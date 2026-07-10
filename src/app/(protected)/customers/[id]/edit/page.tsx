import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateCustomer } from "@/lib/actions/customers";
import { CustomerForm } from "@/components/CustomerForm";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("id, name, phone")
    .eq("id", id)
    .single();

  if (!customer) notFound();

  const action = updateCustomer.bind(null, id);

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <div className="mb-4 flex items-center gap-2">
        <Link
          href={`/customers/${id}`}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted active:bg-surface-muted"
          aria-label="戻る"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold text-foreground">顧客情報を編集</h1>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-4">
        <CustomerForm
          action={action}
          submitLabel="変更を保存"
          submitPendingLabel="保存中…"
          defaultName={customer.name}
          defaultPhone={customer.phone ?? ""}
        />
      </div>
    </div>
  );
}
