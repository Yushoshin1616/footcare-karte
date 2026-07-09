export default function Loading() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="h-7 w-24 animate-pulse rounded-lg bg-surface-muted" />
        <div className="h-12 w-28 animate-pulse rounded-xl bg-surface-muted" />
      </div>
      <div className="mb-4 h-12 animate-pulse rounded-xl bg-surface-muted" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex h-16 items-center gap-3 rounded-2xl border border-border bg-surface px-3"
          >
            <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-surface-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
