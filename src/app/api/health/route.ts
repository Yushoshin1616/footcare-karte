import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Vercelの関数とSupabaseの接続を定期的に呼び出して「起こしておく」ための
// 軽量なエンドポイント。外部の無料Pingサービスから数分おきに叩くことで、
// スタッフが開いた瞬間のコールドスタート（起動待ち）を防ぐ。
export async function GET() {
  const supabase = await createClient();
  await supabase.from("customers").select("id").limit(1);
  return NextResponse.json({ ok: true });
}
