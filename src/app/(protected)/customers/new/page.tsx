import Link from "next/link";
import { CustomerForm } from "@/components/CustomerForm";

export default function NewCustomerPage() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <div className="mb-4 flex items-center gap-2">
        <Link
          href="/"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted active:bg-surface-muted"
          aria-label="一覧に戻る"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold text-foreground">新規顧客登録</h1>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-4">
        <CustomerForm />
      </div>
    </div>
  );
}
