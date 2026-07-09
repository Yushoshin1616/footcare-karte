"use client";

import Image from "next/image";
import { useState } from "react";
import { buttonSecondary, labelBase } from "@/lib/ui";

export function PhotoInput({
  name,
  label = "写真",
  caption,
  initialUrl = null,
  allowRemoveExisting = false,
}: {
  name: string;
  label?: string;
  caption?: string;
  initialUrl?: string | null;
  allowRemoveExisting?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);

  const displayUrl = preview ?? (removeExisting ? null : initialUrl);

  return (
    <div>
      <span className={labelBase}>{label}（任意）</span>
      {caption && <p className="-mt-1 mb-2 text-xs text-muted">{caption}</p>}
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt="写真プレビュー"
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-center text-xs text-muted">
              写真なし
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className={`${buttonSecondary} cursor-pointer`}>
            写真を選択
            <input
              type="file"
              name={name}
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPreview(URL.createObjectURL(file));
                  setRemoveExisting(false);
                } else {
                  setPreview(null);
                }
              }}
            />
          </label>
          {allowRemoveExisting && initialUrl && !preview && (
            <label className="flex min-h-6 items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                name="remove_photo"
                checked={removeExisting}
                onChange={(e) => setRemoveExisting(e.target.checked)}
                className="h-4 w-4"
              />
              現在の写真を削除する
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
