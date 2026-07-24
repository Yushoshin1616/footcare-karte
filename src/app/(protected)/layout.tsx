import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link href="/" className="text-base font-bold text-foreground">
            フットケアカルテ
          </Link>
          <form action={signOut} className="flex items-center gap-2">
            {user?.email && (
              <span className="hidden max-w-40 truncate text-sm text-muted sm:inline">
                {user.email}
              </span>
            )}
            <button
              type="submit"
              className="min-h-11 rounded-lg px-3 text-sm font-medium text-muted active:bg-surface-muted"
            >
              ログアウト
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 pb-10">{children}</main>
    </div>
  );
}
