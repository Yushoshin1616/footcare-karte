"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type AuthState } from "@/lib/actions/auth";
import { buttonPrimary, inputBase, labelBase } from "@/lib/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${buttonPrimary} w-full`} disabled={pending}>
      {pending ? "ログイン中…" : "ログイン"}
    </button>
  );
}

const initialState: AuthState = { error: null };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className={labelBase}>
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={inputBase}
          placeholder="staff@example.com"
        />
      </div>
      <div>
        <label htmlFor="password" className={labelBase}>
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputBase}
          placeholder="パスワードを入力"
        />
      </div>
      {state.error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
