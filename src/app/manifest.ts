import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "顧客管理カルテ",
    short_name: "顧客管理カルテ",
    description: "フットケアサロン向け顧客カルテ管理アプリ",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3f6b58",
    lang: "ja",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
