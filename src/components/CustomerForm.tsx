"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createCustomer, type CustomerFormState } from "@/lib/actions/customers";
import { buttonPrimary, inputBase, labelBase } from "@/lib/ui";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${buttonPrimary} w-full`} disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

const initialState: CustomerFormState = { error: null };

export function CustomerForm({
  action = createCustomer,
  submitLabel = "登録する",
  submitPendingLabel = "登録中…",
  defaultName = "",
  defaultPhone = "",
}: {
  action?: (
    state: CustomerFormState,
    formData: FormData
  ) => Promise<CustomerFormState>;
  submitLabel?: string;
  submitPendingLabel?: string;
  defaultName?: string;
  defaultPhone?: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label htmlFor="name" className={labelBase}>
          お名前 <span className="text-danger">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="off"
          defaultValue={defaultName}
          className={inputBase}
          placeholder="山田 花子"
        />
      </div>

      <div>
        <label htmlFor="phone" className={labelBase}>
          電話番号
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="off"
          inputMode="tel"
          defaultValue={defaultPhone}
          className={inputBase}
          placeholder="090-1234-5678"
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
