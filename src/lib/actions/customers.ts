"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadPhoto, validatePhoto } from "@/lib/storage";

export type CustomerFormState = { error: string | null };

export async function createCustomer(
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const memo = String(formData.get("memo") || "").trim();
  const photo = formData.get("photo");

  if (!name) {
    return { error: "お名前を入力してください。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const id = crypto.randomUUID();
  let photoPath: string | null = null;

  if (photo instanceof File && photo.size > 0) {
    const validationError = validatePhoto(photo);
    if (validationError) return { error: validationError };

    try {
      photoPath = await uploadPhoto(supabase, photo, `customers/${id}/profile`);
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "写真のアップロードに失敗しました。",
      };
    }
  }

  const { error } = await supabase.from("customers").insert({
    id,
    name,
    phone: phone || null,
    memo: memo || null,
    photo_path: photoPath,
    created_by: user?.id ?? null,
  });

  if (error) {
    return { error: "顧客の登録に失敗しました。時間をおいて再度お試しください。" };
  }

  redirect(`/customers/${id}?saved=customer`);
}
