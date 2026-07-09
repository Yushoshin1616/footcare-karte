import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createRecord } from "@/lib/actions/records";
import { RecordForm } from "@/components/RecordForm";
import { todayInputValue } from "@/lib/date";

export default async function NewRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: customer } = await supabase
    .from("customers")
    .select("id, name")
    .eq("id", id)
    .single();

  if (!customer) notFound();

  const action = createRecord.bind(null, id);

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
        <div>
          <h1 className="text-lg font-bold text-foreground">施術記録を追加</h1>
          <p className="text-sm text-muted">{customer.name} 様</p>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-4">
        <RecordForm
          action={action}
          submitLabel="記録を保存"
          submitPendingLabel="保存中…"
          defaultDate={todayInputValue()}
          customerId={id}
        />
      </div>
    </div>
  );
}
