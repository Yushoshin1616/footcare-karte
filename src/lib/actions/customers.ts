"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteFolder } from "@/lib/storage";

export type CustomerFormState = { error: string | null };

export async function createCustomer(
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

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
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "顧客の登録に失敗しました。時間をおいて再度お試しください。" };
  }

  redirect(`/customers/${data.id}?saved=customer`);
}

export async function deleteCustomer(formData: FormData) {
  const customerId = String(formData.get("customer_id") || "");
  if (!customerId) redirect("/");

  const supabase = await createClient();
  await supabase
    .from("customers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", customerId);

  redirect("/?saved=customer-deleted");
}

export async function restoreCustomer(formData: FormData) {
  const customerId = String(formData.get("customer_id") || "");
  if (!customerId) redirect("/trash");

  const supabase = await createClient();
  await supabase
    .from("customers")
    .update({ deleted_at: null })
    .eq("id", customerId);

  redirect(`/customers/${customerId}?saved=customer-restored`);
}

export async function permanentlyDeleteCustomer(formData: FormData) {
  const customerId = String(formData.get("customer_id") || "");
  if (!customerId) redirect("/trash");

  const supabase = await createClient();
  await supabase.from("customers").delete().eq("id", customerId);
  await deleteFolder(supabase, `customers/${customerId}`).catch(() => {});

  redirect("/trash?saved=customer-purged");
}
