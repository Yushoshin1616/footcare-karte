import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSignedUrls } from "@/lib/storage";
import { createRecord } from "@/lib/actions/records";
import { CustomerAvatar } from "@/components/CustomerAvatar";
import { RecordCard } from "@/components/RecordCard";
import { QuickPhotoRecordButton } from "@/components/QuickPhotoRecordButton";
import { SavedBanner } from "@/components/SavedBanner";
import { DeleteCustomerButton } from "@/components/DeleteCustomerButton";
import { buttonSecondary } from "@/lib/ui";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (customerError || !customer) {
    notFound();
  }

  const { data: records, error: recordsError } = await supabase
    .from("records")
    .select("*")
    .eq("customer_id", id)
    .order("treatment_date", { ascending: false })
    .order("created_at", { ascending: false });

  const photoUrlMap = await getSignedUrls(
    supabase,
    (records ?? []).flatMap((r) => r.photo_paths)
  );

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <Suspense fallback={null}>
        <SavedBanner />
      </Suspense>

      <div className="mb-4 flex items-center gap-2">
        <Link
          href="/"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted active:bg-surface-muted"
          aria-label="一覧に戻る"
        >
          ←
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <CustomerAvatar name={customer.name} size={72} />
        <div>
          <h1 className="text-xl font-bold text-foreground">{customer.name}</h1>
          {customer.phone && (
            <p className="mt-0.5 text-sm text-muted">{customer.phone}</p>
          )}
        </div>
      </div>

      {customer.memo && (
        <div className="mb-6 rounded-2xl border border-border bg-surface-muted px-4 py-3">
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {customer.memo}
          </p>
        </div>
      )}

      <div className="mb-3">
        <QuickPhotoRecordButton
          customerId={id}
          action={createRecord.bind(null, id)}
        />
      </div>

      <div className="mb-4">
        <Link
          href={`/customers/${id}/records/new`}
          className={`${buttonSecondary} w-full`}
        >
          📅 日付やメモを指定して記録
        </Link>
      </div>

      <h2 className="mb-3 text-base font-bold text-foreground">施術記録</h2>

      {recordsError && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          記録の取得に失敗しました。時間をおいて再度お試しください。
        </p>
      )}

      {!recordsError && records && records.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-muted">
          まだ記録がありません。
          <br />
          「記録を追加」から最初の記録を残しましょう。
        </div>
      )}

      {!recordsError && records && records.length > 0 && (
        <ul className="flex flex-col gap-3">
          {records.map((record) => (
            <RecordCard
              key={record.id}
              customerId={id}
              recordId={record.id}
              treatmentDate={record.treatment_date}
              memo={record.memo}
              photoUrls={record.photo_paths
                .map((p) => photoUrlMap[p])
                .filter((u): u is string => !!u)}
              createdAt={record.created_at}
              updatedAt={record.updated_at}
            />
          ))}
        </ul>
      )}

      <div className="mt-10 border-t border-border pt-6">
        <DeleteCustomerButton customerId={id} customerName={customer.name} />
      </div>
    </div>
  );
}
