"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { RecordFormState } from "@/lib/actions/records";
import { createClient } from "@/lib/supabase/client";
import { uploadPhoto, validatePhoto } from "@/lib/storage";
import { todayInputValue } from "@/lib/date";
import { buttonPrimary } from "@/lib/ui";

function CaptureLabel({ uploading }: { uploading: boolean }) {
  const { pending } = useFormStatus();
  if (uploading) return <>写真を送信中…</>;
  if (pending) return <>保存中…</>;
  return <>📷 今日の状態を撮る</>;
}

const initialState: RecordFormState = { error: null };

export function QuickPhotoRecordButton({
  customerId,
  action,
}: {
  customerId: string;
  action: (
    state: RecordFormState,
    formData: FormData
  ) => Promise<RecordFormState>;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [recordId] = useState(() => crypto.randomUUID());
  const [uploading, setUploading] = useState(false);
  const [paths, setPaths] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFiles(files: File[]) {
    setUploadError(null);
    setUploading(true);
    const supabase = createClient();
    const pathPrefix = `customers/${customerId}/records/${recordId}`;
    const uploaded: string[] = [];

    for (const file of files) {
      const validationError = validatePhoto(file);
      if (validationError) {
        setUploadError(validationError);
        setUploading(false);
        return;
      }
      try {
        uploaded.push(await uploadPhoto(supabase, file, pathPrefix));
      } catch (e) {
        setUploadError(
          e instanceof Error ? e.message : "写真のアップロードに失敗しました。"
        );
        setUploading(false);
        return;
      }
    }

    setPaths(uploaded);
    setUploading(false);
    requestAnimationFrame(() => formRef.current?.requestSubmit());
  }

  return (
    <div>
      <form ref={formRef} action={formAction}>
        <input type="hidden" name="record_id" value={recordId} />
        <input type="hidden" name="treatment_date" value={todayInputValue()} />
        {paths.map((path) => (
          <input key={path} type="hidden" name="new_photo_paths" value={path} />
        ))}
        <label
          className={`${buttonPrimary} w-full cursor-pointer ${
            uploading ? "pointer-events-none opacity-70" : ""
          }`}
        >
          <CaptureLabel uploading={uploading} />
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length > 0) handleFiles(files);
              e.target.value = "";
            }}
          />
        </label>
      </form>
      {(uploadError || state.error) && (
        <p
          role="alert"
          className="mt-2 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {uploadError ?? state.error}
        </p>
      )}
    </div>
  );
}
