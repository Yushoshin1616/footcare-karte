"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CustomerFormState = { error: string | null };

export async function createCustomer(
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const memo = String(formData.get("memo") || "").trim();

  if (!name) {
    return { error: "お名前を入力してください。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("customers")
    .insert({
      name,
      phone: phone || null,
      memo: memo || null,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "顧客の登録に失敗しました。時間をおいて再度お試しください。" };
  }

  redirect(`/customers/${data.id}?saved=customer`);
}
