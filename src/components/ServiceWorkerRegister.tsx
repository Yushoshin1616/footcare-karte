"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // ホーム画面追加の可否に影響するだけなので、失敗しても致命的ではない
      });
    }
  }, []);

  return null;
}
