"use client";

import Image from "next/image";
import { useState } from "react";
import { buttonSecondary, labelBase } from "@/lib/ui";

type ExistingPhoto = { path: string; url: string };

export function MultiPhotoInput({
  name = "photos",
  label = "写真",
  existingPhotos = [],
}: {
  name?: string;
  label?: string;
  existingPhotos?: ExistingPhoto[];
}) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [removedPaths, setRemovedPaths] = useState<string[]>([]);

  const visibleExisting = existingPhotos.filter(
    (p) => !removedPaths.includes(p.path)
  );

  return (
    <div>
      <span className={labelBase}>{label}（任意・何枚でも追加可）</span>

      {(visibleExisting.length > 0 || previews.length > 0) && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {visibleExisting.map((p) => (
            <div
              key={p.path}
              className="relative aspect-square overflow-hidden rounded-xl bg-surface-muted"
            >
              <Image
                src={p.url}
                alt="登録済みの写真"
                fill
                unoptimized
                className="object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setRemovedPaths((prev) => [...prev, p.path])
                }
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-sm text-white"
                aria-label="この写真を削除"
              >
                ✕
              </button>
            </div>
          ))}
          {previews.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-xl bg-surface-muted"
            >
              <Image
                src={src}
                alt="新しい写真プレビュー"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <label className={`${buttonSecondary} mt-3 inline-flex cursor-pointer`}>
        ＋ 写真を選択
        <input
          type="file"
          name={name}
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            setPreviews(files.map((f) => URL.createObjectURL(f)));
          }}
        />
      </label>

      {removedPaths.map((path) => (
        <input
          key={path}
          type="hidden"
          name="remove_photo_paths"
          value={path}
        />
      ))}
    </div>
  );
}
