export function ChartHeader({
  name,
  phone,
  recordCount,
  customerId,
}: {
  name: string;
  phone?: string | null;
  recordCount: number;
  customerId: string;
}) {
  const shortId = customerId.slice(0, 8).toUpperCase();

  return (
    <div className="rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-foreground">
          {name}
          <span className="ml-1 text-sm font-normal text-muted">様</span>
        </h1>
        <span className="shrink-0 font-mono text-xs text-muted">
          No.{shortId}
        </span>
      </div>
      <dl className="grid grid-cols-2 divide-x divide-border text-sm">
        <div className="flex items-baseline gap-2 px-4 py-2.5">
          <dt className="text-xs text-muted">電話番号</dt>
          <dd className="font-medium text-foreground">{phone || "—"}</dd>
        </div>
        <div className="flex items-baseline gap-2 px-4 py-2.5">
          <dt className="text-xs text-muted">記録件数</dt>
          <dd className="font-medium text-foreground">{recordCount}件</dd>
        </div>
      </dl>
    </div>
  );
}
