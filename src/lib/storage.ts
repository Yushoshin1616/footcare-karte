import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const BUCKET = "customer-photos";
export const MAX_PHOTO_SIZE = 10 * 1024 * 1024;

export async function uploadPhoto(
  supabase: SupabaseClient<Database>,
  file: File,
  pathPrefix: string
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) {
    throw new Error(`写真のアップロードに失敗しました: ${error.message}`);
  }
  return path;
}

export async function getSignedUrl(
  supabase: SupabaseClient<Database>,
  path: string | null,
  expiresInSeconds = 60 * 60
): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error) return null;
  return data.signedUrl;
}

export async function getSignedUrls(
  supabase: SupabaseClient<Database>,
  paths: (string | null | undefined)[],
  expiresInSeconds = 60 * 60
): Promise<Record<string, string>> {
  const validPaths = Array.from(
    new Set(paths.filter((p): p is string => !!p))
  );
  if (validPaths.length === 0) return {};

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(validPaths, expiresInSeconds);

  if (error || !data) return {};

  const map: Record<string, string> = {};
  for (const item of data) {
    if (!item.error && item.signedUrl && item.path) {
      map[item.path] = item.signedUrl;
    }
  }
  return map;
}

export function validatePhoto(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "写真は画像ファイルを選択してください。";
  }
  if (file.size > MAX_PHOTO_SIZE) {
    return "写真のサイズは10MB以下にしてください。";
  }
  return null;
}
