import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const BUCKET = "customer-photos";
export const MAX_PHOTO_SIZE = 20 * 1024 * 1024;

const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "heic",
  "heif",
  "bmp",
  "tif",
  "tiff",
];

const EXTENSION_MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  bmp: "image/bmp",
  tif: "image/tiff",
  tiff: "image/tiff",
};

export async function uploadPhoto(
  supabase: SupabaseClient<Database>,
  file: File,
  pathPrefix: string
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;
  const contentType = file.type || EXTENSION_MIME_TYPES[ext] || undefined;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType,
    upsert: false,
  });
  if (error) {
    throw new Error(`写真のアップロードに失敗しました: ${error.message}`);
  }
  return path;
}

export async function uploadPhotos(
  supabase: SupabaseClient<Database>,
  files: File[],
  pathPrefix: string
): Promise<string[]> {
  const paths: string[] = [];
  for (const file of files) {
    paths.push(await uploadPhoto(supabase, file, pathPrefix));
  }
  return paths;
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

async function listAllFiles(
  supabase: SupabaseClient<Database>,
  prefix: string
): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(prefix, { limit: 1000 });
  if (error || !data) return [];

  const files: string[] = [];
  for (const item of data) {
    const itemPath = `${prefix}/${item.name}`;
    if (item.id) {
      files.push(itemPath);
    } else {
      files.push(...(await listAllFiles(supabase, itemPath)));
    }
  }
  return files;
}

export async function deleteFolder(
  supabase: SupabaseClient<Database>,
  prefix: string
): Promise<void> {
  const files = await listAllFiles(supabase, prefix);
  if (files.length === 0) return;
  await supabase.storage.from(BUCKET).remove(files);
}

export function validatePhoto(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const looksLikeImage =
    file.type.startsWith("image/") || IMAGE_EXTENSIONS.includes(ext);

  if (!looksLikeImage) {
    return "写真は画像ファイルを選択してください。";
  }
  if (file.size > MAX_PHOTO_SIZE) {
    return "写真のサイズは20MB以下にしてください。";
  }
  return null;
}
