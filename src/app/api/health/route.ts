import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Vercelの関数とSupabaseの接続を定期的に呼び出して「起こしておく」ための
// 軽量なエンドポイント。Vercel Cron（vercel.json）から毎日叩くことで、
// Supabase無料プランが7日間無アクセスで自動一時停止するのを防ぐ。
// （以前は外部の無料Pingサービスに依存していたが、設定が止まると
//   気づかないままプロジェクトが一時停止してしまったため、
//   デプロイと一体管理できるVercel Cronに切り替えた）
export async function GET() {
  const supabase = await createClient();
  await supabase.from("customers").select("id").limit(1);
  return NextResponse.json({ ok: true });
}
