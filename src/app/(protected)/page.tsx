import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSignedUrls } from "@/lib/storage";
import { SearchBox } from "@/components/SearchBox";
import { CustomerAvatar } from "@/components/CustomerAvatar";
import { buttonPrimary } from "@/lib/ui";

export default async function CustomerListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const keyword = q?.trim() ?? "";
  const supabase = await createClient();

  let query = supabase
    .from("customers")
    .select("id, name, photo_path, created_at")
    .order("created_at", { ascending: false });

  if (keyword) {
    query = query.ilike("name", `%${keyword}%`);
  }

  const { data: customers, error } = await query;
  const photoMap = customers
    ? await getSignedUrls(
        supabase,
        customers.map((c) => c.photo_path)
      )
    : {};

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-foreground">顧客一覧</h1>
        <Link href="/customers/new" className={buttonPrimary}>
          + 新規顧客
        </Link>
      </div>

      <div className="mb-4">
        <SearchBox defaultValue={keyword} />
      </div>

      {error && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          顧客一覧の取得に失敗しました。時間をおいて再度お試しください。
        </p>
      )}

      {!error && customers && customers.length === 0 && keyword && (
        <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-muted">
          「{keyword}」に一致する顧客が見つかりませんでした。
        </div>
      )}

      {!error && customers && customers.length === 0 && !keyword && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-4 py-14 text-center">
          <p className="text-muted">
            まだ顧客が登録されていません。
            <br />
            最初の顧客を登録しましょう。
          </p>
          <Link href="/customers/new" className={buttonPrimary}>
            + 新規顧客を登録
          </Link>
        </div>
      )}

      {!error && customers && customers.length > 0 && (
        <ul className="flex flex-col gap-2">
          {customers.map((customer) => (
            <li key={customer.id}>
              <Link
                href={`/customers/${customer.id}`}
                className="flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-2 active:bg-surface-muted"
              >
                <CustomerAvatar
                  url={photoMap[customer.photo_path ?? ""] ?? null}
                  name={customer.name}
                />
                <span className="text-base font-medium text-foreground">
                  {customer.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
