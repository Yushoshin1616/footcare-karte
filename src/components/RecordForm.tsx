"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { RecordFormState } from "@/lib/actions/records";
import { buttonPrimary, inputBase, labelBase, textareaBase } from "@/lib/ui";
import { MultiPhotoInput } from "@/components/MultiPhotoInput";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${buttonPrimary} w-full`} disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

const initialState: RecordFormState = { error: null };

export function RecordForm({
  action,
  submitLabel,
  submitPendingLabel,
  defaultDate,
  defaultMemo = "",
  existingPhotos = [],
}: {
  action: (state: RecordFormState, formData: FormData) => Promise<RecordFormState>;
  submitLabel: string;
  submitPendingLabel: string;
  defaultDate: string;
  defaultMemo?: string;
  existingPhotos?: { path: string; url: string }[];
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label htmlFor="treatment_date" className={labelBase}>
          施術日 <span className="text-danger">*</span>
        </label>
        <input
          id="treatment_date"
          name="treatment_date"
          type="date"
          required
          defaultValue={defaultDate}
          className={inputBase}
        />
      </div>

      <MultiPhotoInput
        name="photos"
        label="記録写真"
        existingPhotos={existingPhotos}
      />

      <div>
        <label htmlFor="memo" className={labelBase}>
          メモ
        </label>
        <textarea
          id="memo"
          name="memo"
          defaultValue={defaultMemo}
          className={textareaBase}
          placeholder="症状・施術内容・使用商品・次回への申し送りなど"
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}

      <SubmitButton label={submitLabel} pendingLabel={submitPendingLabel} />
    </form>
  );
}
