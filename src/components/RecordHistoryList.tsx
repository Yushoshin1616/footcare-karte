import Image from "next/image";
import { formatDateOnly, formatDateTime } from "@/lib/date";
import { RevertRecordForm } from "@/components/RevertRecordForm";

type HistoryEntry = {
  id: string;
  treatment_date: string;
  memo: string;
  snapshot_at: string;
  reason: string;
  photoUrl: string | null;
};

export function RecordHistoryList({
  customerId,
  recordId,
  entries,
}: {
  customerId: string;
  recordId: string;
  entries: HistoryEntry[];
}) {
  if (entries.length === 0) return null;

  return (
    <details className="rounded-2xl border border-border bg-surface">
      <summary className="min-h-12 cursor-pointer list-none px-4 py-3 text-sm font-medium text-muted marker:content-none">
        編集履歴を見る（{entries.length}件）
      </summary>
      <div className="flex flex-col gap-3 border-t border-border px-4 py-4">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-xl bg-surface-muted p-3">
            <p className="text-xs text-muted">
              {entry.reason === "revert" ? "復元前の内容" : "編集前の内容"}（
              {formatDateTime(entry.snapshot_at)} 時点）
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              施術日: {formatDateOnly(entry.treatment_date)}
            </p>
            {entry.photoUrl && (
              <div className="relative mt-2 h-32 w-full overflow-hidden rounded-lg">
                <Image
                  src={entry.photoUrl}
                  alt="編集前の写真"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            )}
            {entry.memo && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                {entry.memo}
              </p>
            )}
            <div className="mt-3">
              <RevertRecordForm
                customerId={customerId}
                recordId={recordId}
                historyId={entry.id}
              />
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
