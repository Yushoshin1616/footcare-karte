import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSignedUrls } from "@/lib/storage";
import { updateRecord } from "@/lib/actions/records";
import { RecordForm } from "@/components/RecordForm";
import { RecordHistoryList } from "@/components/RecordHistoryList";

export default async function EditRecordPage({
  params,
}: {
  params: Promise<{ id: string; recordId: string }>;
}) {
  const { id, recordId } = await params;
  const supabase = await createClient();

  const [{ data: customer }, { data: record }, { data: history }] = await Promise.all([
    supabase.from("customers").select("id, name").eq("id", id).single(),
    supabase.from("records").select("*").eq("id", recordId).eq("customer_id", id).single(),
    supabase
      .from("record_history")
      .select("*")
      .eq("record_id", recordId)
      .order("snapshot_at", { ascending: false }),
  ]);

  if (!customer || !record) notFound();

  const allPaths = [
    ...record.photo_paths,
    ...(history ?? []).flatMap((h) => h.photo_paths),
  ];
  const photoUrlMap = await getSignedUrls(supabase, allPaths);

  const action = updateRecord.bind(null, id, recordId);

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
          <h1 className="text-lg font-bold text-foreground">施術記録を編集</h1>
          <p className="text-sm text-muted">{customer.name} 様</p>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-border bg-surface p-4">
        <RecordForm
          action={action}
          submitLabel="変更を保存"
          submitPendingLabel="保存中…"
          defaultDate={record.treatment_date}
          defaultMemo={record.memo}
          customerId={id}
          recordId={recordId}
          existingPhotos={record.photo_paths
            .filter((p) => photoUrlMap[p])
            .map((p) => ({ path: p, url: photoUrlMap[p] }))}
        />
      </div>

      <RecordHistoryList
        customerId={id}
        recordId={recordId}
        entries={(history ?? []).map((h) => ({
          id: h.id,
          treatment_date: h.treatment_date,
          memo: h.memo,
          snapshot_at: h.snapshot_at,
          reason: h.reason,
          photoUrls: h.photo_paths
            .filter((p) => photoUrlMap[p])
            .map((p) => photoUrlMap[p]),
        }))}
      />
    </div>
  );
}
