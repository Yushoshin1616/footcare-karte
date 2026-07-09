"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const MESSAGES: Record<string, string> = {
  customer: "顧客を登録しました",
  "customer-deleted": "顧客を削除しました（ゴミ箱から元に戻せます）",
  "customer-restored": "顧客を元に戻しました",
  "customer-purged": "顧客を完全に削除しました",
  record: "記録を保存しました",
  "record-updated": "記録を更新しました",
  "record-reverted": "元の内容に戻しました",
};

export function SavedBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const saved = searchParams.get("saved");
  const message = saved ? MESSAGES[saved] : undefined;

  useEffect(() => {
    if (!message) return;

    const cleanTimer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      params.delete("saved");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, 3000);

    return () => clearTimeout(cleanTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  if (!message) return null;

  return (
    <div
      key={saved}
      role="status"
      className="animate-saved-banner fixed inset-x-4 top-4 z-50 mx-auto flex max-w-md items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-lg"
    >
      <span>✓</span>
      <span>{message}</span>
    </div>
  );
}
