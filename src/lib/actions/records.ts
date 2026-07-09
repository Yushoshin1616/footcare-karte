"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadPhoto, validatePhoto } from "@/lib/storage";

export type RecordFormState = { error: string | null };

async function extractPhoto(
  formData: FormData
): Promise<{ file: File | null; error: string | null }> {
  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return { file: null, error: null };
  }
  const validationError = validatePhoto(photo);
  if (validationError) return { file: null, error: validationError };
  return { file: photo, error: null };
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

  const { file: photoFile, error: photoError } = await extractPhoto(formData);
  if (photoError) return { error: photoError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const id = crypto.randomUUID();
  let photoPath: string | null = null;

  if (photoFile) {
    try {
      photoPath = await uploadPhoto(
        supabase,
        photoFile,
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
    photo_path: photoPath,
    created_by: user?.id ?? null,
    updated_by: user?.id ?? null,
  });

  if (error) {
    return { error: "記録の保存に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
}

export async function updateRecord(
  customerId: string,
  recordId: string,
  _prevState: RecordFormState,
  formData: FormData
): Promise<RecordFormState> {
  const treatmentDate = String(formData.get("treatment_date") || "");
  const memo = String(formData.get("memo") || "").trim();
  const removePhoto = formData.get("remove_photo") === "on";

  if (!treatmentDate) {
    return { error: "施術日を選択してください。" };
  }

  const { file: photoFile, error: photoError } = await extractPhoto(formData);
  if (photoError) return { error: photoError };

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

  let photoPath = current.photo_path;
  if (photoFile) {
    try {
      photoPath = await uploadPhoto(
        supabase,
        photoFile,
        `customers/${customerId}/records/${recordId}`
      );
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "写真のアップロードに失敗しました。",
      };
    }
  } else if (removePhoto) {
    photoPath = null;
  }

  const { error: historyError } = await supabase.from("record_history").insert({
    record_id: recordId,
    treatment_date: current.treatment_date,
    photo_path: current.photo_path,
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
      photo_path: photoPath,
      updated_by: user?.id ?? null,
    })
    .eq("id", recordId);

  if (updateError) {
    return { error: "記録の更新に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
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
    photo_path: current.photo_path,
    memo: current.memo,
    edited_by: user?.id ?? null,
    reason: "revert",
  });

  await supabase
    .from("records")
    .update({
      treatment_date: history.treatment_date,
      photo_path: history.photo_path,
      memo: history.memo,
      updated_by: user?.id ?? null,
    })
    .eq("id", recordId);

  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
}
