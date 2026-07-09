import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-dvh flex-1 flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            フットケアサロン
            <br />
            カルテ管理
          </h1>
          <p className="mt-2 text-sm text-muted">
            スタッフ用ログイン
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <LoginForm next={next ?? "/"} />
        </div>
      </div>
    </main>
  );
}
