"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { backupPhotosToBlob } from "@/lib/blob-backup";

export type RecordFormState = { error: string | null };

function extractNewPhotoPaths(formData: FormData, expectedPrefix: string): string[] {
  return formData
    .getAll("new_photo_paths")
    .map((v) => String(v))
    .filter((p) => p.startsWith(`${expectedPrefix}/`));
}

export async function createRecord(
  customerId: string,
  _prevState: RecordFormState,
  formData: FormData
): Promise<RecordFormState> {
  const id = String(formData.get("record_id") || "").trim() || crypto.randomUUID();
  const treatmentDate = String(formData.get("treatment_date") || "");
  const memo = String(formData.get("memo") || "").trim();

  if (!treatmentDate) {
    return { error: "施術日を選択してください。" };
  }

  const photoPaths = extractNewPhotoPaths(
    formData,
    `customers/${customerId}/records/${id}`
  );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  after(() => backupPhotosToBlob(photoPaths));

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
  const newPaths = extractNewPhotoPaths(
    formData,
    `customers/${customerId}/records/${recordId}`
  );

  if (!treatmentDate) {
    return { error: "施術日を選択してください。" };
  }

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

  // 写真を「削除」しても Storage の実体は消さない。record_history に元の
  // photo_paths が残るため、編集履歴からいつでも復元できる（データ消失防止）。
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

  after(() => backupPhotosToBlob(newPaths));

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
