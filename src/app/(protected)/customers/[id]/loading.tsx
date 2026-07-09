export default function Loading() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-[72px] w-[72px] animate-pulse rounded-full bg-surface-muted" />
        <div className="h-6 w-32 animate-pulse rounded bg-surface-muted" />
      </div>
      <div className="mb-4 h-12 animate-pulse rounded-xl bg-surface-muted" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-surface-muted" />
        ))}
      </div>
    </div>
  );
}
