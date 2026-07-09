"use client";

import { useFormStatus } from "react-dom";
import { deleteCustomer } from "@/lib/actions/customers";
import { buttonDanger } from "@/lib/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${buttonDanger} w-full`} disabled={pending}>
      {pending ? "削除中…" : "この顧客を削除する"}
    </button>
  );
}

export function DeleteCustomerButton({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  return (
    <form
      action={deleteCustomer}
      onSubmit={(e) => {
        if (
          !confirm(
            `${customerName} さんを削除します。\nすべての記録・写真も一緒に削除され、元に戻せません。本当によろしいですか？`
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
