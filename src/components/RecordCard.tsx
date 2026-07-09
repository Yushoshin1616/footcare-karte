import Link from "next/link";
import Image from "next/image";
import { formatDateOnly, formatDateTime } from "@/lib/date";

export function RecordCard({
  customerId,
  recordId,
  treatmentDate,
  memo,
  photoUrls,
  createdAt,
  updatedAt,
}: {
  customerId: string;
  recordId: string;
  treatmentDate: string;
  memo: string;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
}) {
  const wasEdited = updatedAt !== createdAt;

  return (
    <li className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-foreground">
            {formatDateOnly(treatmentDate)}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            記録日時: {formatDateTime(createdAt)}
            {wasEdited && <span>（編集済み: {formatDateTime(updatedAt)}）</span>}
          </p>
        </div>
        <Link
          href={`/customers/${customerId}/records/${recordId}/edit`}
          className="flex min-h-9 shrink-0 items-center rounded-lg border border-border px-3 text-sm font-medium text-primary active:bg-surface-muted"
        >
          編集
        </Link>
      </div>

      {photoUrls.length === 1 && (
        <div className="relative mb-3 h-48 w-full overflow-hidden rounded-xl bg-surface-muted">
          <Image
            src={photoUrls[0]}
            alt={`${formatDateOnly(treatmentDate)}の記録写真`}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      )}

      {photoUrls.length > 1 && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {photoUrls.map((url, i) => (
            <div
              key={url}
              className="relative aspect-square overflow-hidden rounded-xl bg-surface-muted"
            >
              <Image
                src={url}
                alt={`${formatDateOnly(treatmentDate)}の記録写真 ${i + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {memo ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {memo}
        </p>
      ) : (
        <p className="text-sm text-muted">メモはありません。</p>
      )}
    </li>
  );
}
