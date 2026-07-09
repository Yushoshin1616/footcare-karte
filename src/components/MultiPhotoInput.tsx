"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadPhoto, validatePhoto } from "@/lib/storage";
import { buttonSecondary, labelBase } from "@/lib/ui";

type ExistingPhoto = { path: string; url: string };

type PendingItem = {
  key: string;
  previewUrl: string;
  status: "uploading" | "done" | "error";
  path?: string;
  errorMessage?: string;
};

export function MultiPhotoInput({
  name = "new_photo_paths",
  label = "写真",
  pathPrefix,
  existingPhotos = [],
  onUploadingChange,
}: {
  name?: string;
  label?: string;
  pathPrefix: string;
  existingPhotos?: ExistingPhoto[];
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [removedPaths, setRemovedPaths] = useState<string[]>([]);

  const isUploading = items.some((i) => i.status === "uploading");

  useEffect(() => {
    onUploadingChange?.(isUploading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUploading]);

  const visibleExisting = existingPhotos.filter(
    (p) => !removedPaths.includes(p.path)
  );

  async function handleFiles(files: File[]) {
    const supabase = createClient();

    const newItems: PendingItem[] = files.map((file) => ({
      key: `${Date.now()}-${Math.random()}`,
      previewUrl: URL.createObjectURL(file),
      status: "uploading",
    }));
    setItems((prev) => [...prev, ...newItems]);

    await Promise.all(
      files.map(async (file, i) => {
        const item = newItems[i];
        const validationError = validatePhoto(file);
        if (validationError) {
          setItems((prev) =>
            prev.map((it) =>
              it.key === item.key
                ? { ...it, status: "error", errorMessage: validationError }
                : it
            )
          );
          return;
        }
        try {
          const path = await uploadPhoto(supabase, file, pathPrefix);
          setItems((prev) =>
            prev.map((it) =>
              it.key === item.key ? { ...it, status: "done", path } : it
            )
          );
        } catch (e) {
          setItems((prev) =>
            prev.map((it) =>
              it.key === item.key
                ? {
                    ...it,
                    status: "error",
                    errorMessage:
                      e instanceof Error
                        ? e.message
                        : "写真のアップロードに失敗しました。",
                  }
                : it
            )
          );
        }
      })
    );
  }

  const failedItems = items.filter((i) => i.status === "error");

  return (
    <div>
      <span className={labelBase}>{label}（任意・何枚でも追加可）</span>

      {(visibleExisting.length > 0 || items.length > 0) && (
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
          {items
            .filter((it) => it.status !== "error")
            .map((it) => (
              <div
                key={it.key}
                className="relative aspect-square overflow-hidden rounded-xl bg-surface-muted"
              >
                <Image
                  src={it.previewUrl}
                  alt="新しい写真プレビュー"
                  fill
                  unoptimized
                  className="object-cover"
                />
                {it.status === "uploading" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white">
                    送信中…
                  </div>
                )}
                {it.path && (
                  <input type="hidden" name={name} value={it.path} />
                )}
              </div>
            ))}
        </div>
      )}

      {failedItems.length > 0 && (
        <p className="mt-2 text-sm text-danger">
          {failedItems[0].errorMessage}
        </p>
      )}

      <label className={`${buttonSecondary} mt-3 inline-flex cursor-pointer`}>
        ＋ 写真を選択
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length > 0) handleFiles(files);
            e.target.value = "";
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
