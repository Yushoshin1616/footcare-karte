"use client";

import { useFormStatus } from "react-dom";
import { restoreCustomer } from "@/lib/actions/customers";
import { buttonSecondary } from "@/lib/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={`${buttonSecondary} min-h-10 px-4 text-sm`}
      disabled={pending}
    >
      {pending ? "復元中…" : "元に戻す"}
    </button>
  );
}

export function RestoreCustomerButton({ customerId }: { customerId: string }) {
  return (
    <form action={restoreCustomer}>
      <input type="hidden" name="customer_id" value={customerId} />
      <SubmitButton />
    </form>
  );
}
