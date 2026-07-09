"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { RecordFormState } from "@/lib/actions/records";
import { todayInputValue } from "@/lib/date";
import { buttonPrimary } from "@/lib/ui";

function CaptureLabel() {
  const { pending } = useFormStatus();
  return <>{pending ? "保存中…" : "📷 今日の状態を撮る"}</>;
}

const initialState: RecordFormState = { error: null };

export function QuickPhotoRecordButton({
  action,
}: {
  action: (
    state: RecordFormState,
    formData: FormData
  ) => Promise<RecordFormState>;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      <form ref={formRef} action={formAction}>
        <input type="hidden" name="treatment_date" value={todayInputValue()} />
        <label className={`${buttonPrimary} w-full cursor-pointer`}>
          <CaptureLabel />
          <input
            type="file"
            name="photo"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={() => formRef.current?.requestSubmit()}
          />
        </label>
      </form>
      {state.error && (
        <p
          role="alert"
          className="mt-2 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {state.error}
        </p>
      )}
    </div>
  );
}
