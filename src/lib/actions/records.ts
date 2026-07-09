"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadPhotos, validatePhoto } from "@/lib/storage";

export type RecordFormState = { error: string | null };

function extractPhotoFiles(formData: FormData): File[] {
  return formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);
}

function validatePhotos(files: File[]): string | null {
  for (const file of files) {
    const error = validatePhoto(file);
    if (error) return error;
  }
  return null;
}

export async function createRecord(
  customerId: string,
  _prevState: RecordFormState,
  formData: FormData
): Promise<RecordFormState> {
  const treatmentDate = String(formData.get("treatment_date") || "");
  const memo = String(formData.get("memo") || "").trim();

  if (!treatmentDate) {
    return { error: "施術日を選択してください。" };
  }

  const photoFiles = extractPhotoFiles(formData);
  const validationError = validatePhotos(photoFiles);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const id = crypto.randomUUID();
  let photoPaths: string[] = [];

  if (photoFiles.length > 0) {
    try {
      photoPaths = await uploadPhotos(
        supabase,
        photoFiles,
        `customers/${customerId}/records/${id}`
      );
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "写真のアップロードに失敗しました。",
      };
    }
  }

  const { error } = await supabase.from("records").insert({
    id,
    customer_id: customerId,
    treatment_date: treatmentDate,
    memo,
    photo_paths: photoPaths,
    created_by: user?.id ?? null,
    updated_by: user?.id ?? null,
  });

  if (error) {
    return { error: "記録の保存に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}?saved=record`);
}

export async function updateRecord(
  customerId: string,
  recordId: string,
  _prevState: RecordFormState,
  formData: FormData
): Promise<RecordFormState> {
  const treatmentDate = String(formData.get("treatment_date") || "");
  const memo = String(formData.get("memo") || "").trim();
  const removePaths = new Set(
    formData.getAll("remove_photo_paths").map((v) => String(v))
  );

  if (!treatmentDate) {
    return { error: "施術日を選択してください。" };
  }

  const photoFiles = extractPhotoFiles(formData);
  const validationError = validatePhotos(photoFiles);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: current, error: fetchError } = await supabase
    .from("records")
    .select("*")
    .eq("id", recordId)
    .single();

  if (fetchError || !current) {
    return { error: "記録が見つかりませんでした。" };
  }

  let newPaths: string[] = [];
  if (photoFiles.length > 0) {
    try {
      newPaths = await uploadPhotos(
        supabase,
        photoFiles,
        `customers/${customerId}/records/${recordId}`
      );
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "写真のアップロードに失敗しました。",
      };
    }
  }

  const keptPaths = current.photo_paths.filter((p) => !removePaths.has(p));
  const photoPaths = [...keptPaths, ...newPaths];

  const { error: historyError } = await supabase.from("record_history").insert({
    record_id: recordId,
    treatment_date: current.treatment_date,
    photo_paths: current.photo_paths,
    memo: current.memo,
    edited_by: user?.id ?? null,
    reason: "update",
  });

  if (historyError) {
    return { error: "編集履歴の保存に失敗しました。時間をおいて再度お試しください。" };
  }

  const { error: updateError } = await supabase
    .from("records")
    .update({
      treatment_date: treatmentDate,
      memo,
      photo_paths: photoPaths,
      updated_by: user?.id ?? null,
    })
    .eq("id", recordId);

  if (updateError) {
    return { error: "記録の更新に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}?saved=record-updated`);
}

export async function revertRecord(formData: FormData) {
  const customerId = String(formData.get("customer_id") || "");
  const recordId = String(formData.get("record_id") || "");
  const historyId = String(formData.get("history_id") || "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: current }, { data: history }] = await Promise.all([
    supabase.from("records").select("*").eq("id", recordId).single(),
    supabase.from("record_history").select("*").eq("id", historyId).single(),
  ]);

  if (!current || !history) {
    redirect(`/customers/${customerId}`);
  }

  await supabase.from("record_history").insert({
    record_id: recordId,
    treatment_date: current.treatment_date,
    photo_paths: current.photo_paths,
    memo: current.memo,
    edited_by: user?.id ?? null,
    reason: "revert",
  });

  await supabase
    .from("records")
    .update({
      treatment_date: history.treatment_date,
      photo_paths: history.photo_paths,
      memo: history.memo,
      updated_by: user?.id ?? null,
    })
    .eq("id", recordId);

  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}?saved=record-reverted`);
}
