import { put, del, list } from "@vercel/blob";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "customer-photos";

// Supabase Storage に何か障害が起きても写真ファイルが失われないよう、
// Vercel Blob（別インフラ）にも同じパスでコピーを保存しておく。
// あくまでバックアップなので、失敗してもメインの保存処理は止めない。
export async function backupPhotosToBlob(paths: string[]): Promise<void> {
  if (paths.length === 0) return;

  const supabase = await createClient();

  await Promise.allSettled(
    paths.map(async (path) => {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .download(path);
      if (error || !data) return;

      await put(path, data, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
    })
  );
}

export async function deleteBlobFolder(prefix: string): Promise<void> {
  try {
    const { blobs } = await list({ prefix });
    if (blobs.length === 0) return;
    await del(blobs.map((b) => b.url));
  } catch {
    // ベストエフォート
  }
}
