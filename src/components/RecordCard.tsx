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
    <li>
      <article className="rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <p className="text-base font-bold text-foreground">
              {formatDateOnly(treatmentDate)}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              記録: {formatDateTime(createdAt)}
              {wasEdited && <> ／ 編集: {formatDateTime(updatedAt)}</>}
            </p>
          </div>
          <Link
            href={`/customers/${customerId}/records/${recordId}/edit`}
            className="flex min-h-8 shrink-0 items-center rounded-md border border-border px-2.5 text-xs font-semibold text-primary active:bg-surface-muted"
          >
            編集
          </Link>
        </div>

        {photoUrls.length > 0 && (
          <div className="border-b border-border px-4 py-3">
            <p className="mb-2 text-xs font-medium text-muted">状態写真</p>
            {photoUrls.length === 1 ? (
              <div className="relative h-44 w-full overflow-hidden rounded-lg bg-surface-muted">
                <Image
                  src={photoUrls[0]}
                  alt={`${formatDateOnly(treatmentDate)}の状態写真`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {photoUrls.map((url, i) => (
                  <div
                    key={url}
                    className="relative aspect-square overflow-hidden rounded-lg bg-surface-muted"
                  >
                    <Image
                      src={url}
                      alt={`${formatDateOnly(treatmentDate)}の状態写真 ${i + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="px-4 py-3">
          <p className="mb-1 text-xs font-medium text-muted">
            施術内容・申し送り
          </p>
          {memo ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {memo}
            </p>
          ) : (
            <p className="text-sm italic text-muted">未記入</p>
          )}
        </div>
      </article>
    </li>
  );
}
