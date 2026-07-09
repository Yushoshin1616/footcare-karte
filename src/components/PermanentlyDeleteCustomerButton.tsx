"use client";

import { useFormStatus } from "react-dom";
import { permanentlyDeleteCustomer } from "@/lib/actions/customers";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="min-h-10 rounded-lg px-4 text-sm font-medium text-danger active:bg-danger/10"
      disabled={pending}
    >
      {pending ? "削除中…" : "完全に削除する"}
    </button>
  );
}

export function PermanentlyDeleteCustomerButton({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  return (
    <form
      action={permanentlyDeleteCustomer}
      onSubmit={(e) => {
        if (
          !confirm(
            `${customerName} さんを完全に削除します。\nこの操作は元に戻せません。記録・写真もすべて完全に消去されます。本当によろしいですか？`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="customer_id" value={customerId} />
      <SubmitButton />
    </form>
  );
}
