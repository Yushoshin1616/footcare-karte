"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { inputBase } from "@/lib/ui";

export function SearchBox({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(defaultValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (value.trim()) params.set("q", value.trim());
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, pathname, router]);

  return (
    <input
      type="search"
      inputMode="search"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="名前で検索"
      aria-label="顧客を名前で検索"
      className={inputBase}
    />
  );
}
