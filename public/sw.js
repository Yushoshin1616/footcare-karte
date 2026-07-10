// ホーム画面への追加（PWAインストール）をブラウザに認識させるための
// 最小限の Service Worker。オフラインキャッシュは行わず、
// 常にネットワークからそのまま取得する（データの新しさを優先するため）。

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// GET 以外（Server Actions の POST 送信や写真アップロードなど）には
// 一切介入しない。ブラウザにそのまま処理させることで、
// フォーム送信やAPI通信を壊さないようにする。
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request));
});
