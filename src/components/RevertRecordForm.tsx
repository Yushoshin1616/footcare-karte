"use client";

import { useFormStatus } from "react-dom";
import { revertRecord } from "@/lib/actions/records";
import { buttonSecondary } from "@/lib/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${buttonSecondary} min-h-10 px-4 text-sm`} disabled={pending}>
      {pending ? "戻しています…" : "この内容に戻す"}
    </button>
  );
}

export function RevertRecordForm({
  customerId,
  recordId,
  historyId,
}: {
  customerId: string;
  recordId: string;
  historyId: string;
}) {
  return (
    <form
      action={revertRecord}
      onSubmit={(e) => {
        if (
          !confirm(
            "この内容に戻しますか？\n現在の内容は履歴として保存されるので、後からまた戻すこともできます。"
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="customer_id" value={customerId} />
      <input type="hidden" name="record_id" value={recordId} />
      <input type="hidden" name="history_id" value={historyId} />
      <SubmitButton />
    </form>
  );
}
