import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { CustomerAvatar } from "@/components/CustomerAvatar";
import { RestoreCustomerButton } from "@/components/RestoreCustomerButton";
import { PermanentlyDeleteCustomerButton } from "@/components/PermanentlyDeleteCustomerButton";
import { SavedBanner } from "@/components/SavedBanner";
import { formatDateTime } from "@/lib/date";

export default async function TrashPage() {
  const supabase = await createClient();

  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, name, deleted_at")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

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
        <h1 className="text-xl font-bold text-foreground">ゴミ箱</h1>
      </div>

      <p className="mb-4 text-sm text-muted">
        削除した顧客がここに表示されます。「元に戻す」で復元できます。
      </p>

      {error && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          ゴミ箱の取得に失敗しました。時間をおいて再度お試しください。
        </p>
      )}

      {!error && customers && customers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-muted">
          ゴミ箱は空です。
        </div>
      )}

      {!error && customers && customers.length > 0 && (
        <ul className="flex flex-col gap-2">
          {customers.map((customer) => (
            <li
              key={customer.id}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <div className="mb-3 flex items-center gap-3">
                <CustomerAvatar name={customer.name} size={48} />
                <div className="flex-1">
                  <p className="text-base font-medium text-foreground">
                    {customer.name}
                  </p>
                  <p className="text-xs text-muted">
                    削除日時: {formatDateTime(customer.deleted_at!)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <RestoreCustomerButton customerId={customer.id} />
                <PermanentlyDeleteCustomerButton
                  customerId={customer.id}
                  customerName={customer.name}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
