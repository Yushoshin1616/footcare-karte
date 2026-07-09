# フットケアサロン カルテ管理

フットケアサロン向けの顧客カルテ管理アプリです。スタッフがスマートフォン・タブレットで顧客情報と施術記録を管理します。

## 技術スタック

- Next.js 16（App Router / TypeScript）+ Tailwind CSS v4
- Supabase（PostgreSQL / Auth / Storage）
- スタッフ用メール＋パスワード認証（`src/proxy.ts` で未ログインアクセスを保護）

## セットアップ

### 1. Supabase プロジェクトを用意する

[supabase.com](https://supabase.com) で新規プロジェクトを作成するか、Supabase CLI でローカル環境を起動します。

```bash
# ローカルで動かす場合（Docker が必要）
npx supabase start
```

### 2. マイグレーションを適用する

`supabase/migrations/20260101000000_init.sql` に、テーブル定義・RLS・Storage バケット（`customer-photos`、非公開）がすべて含まれています。

```bash
# ローカル環境の場合（DBリセットで初期スキーマを適用）
npx supabase db reset

# 本番 Supabase プロジェクトの場合
npx supabase link --project-ref <プロジェクトref>
npx supabase db push
```

### 3. 環境変数を設定する

`.env.local` を作成し、Supabase の URL と anon key を設定します（`npx supabase start` 実行後にターミナルへ出力されます／本番はダッシュボードの Project Settings > API から取得）。

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

### 4. スタッフアカウントを作成する

このアプリに自己サインアップ機能はありません。スタッフのログイン用アカウントは Supabase 側で発行します。

- Supabase Studio の Authentication > Users > Add user から作成（推奨）
- もしくは Admin API で作成:

```bash
curl -X POST "<SUPABASE_URL>/auth/v1/admin/users" \
  -H "apikey: <SERVICE_ROLE_KEY>" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@example.com","password":"任意のパスワード","email_confirm":true}'
```

### 5. 開発サーバーを起動する

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開き、発行したスタッフアカウントでログインします。

## 主な機能

- 顧客一覧（名前検索・本人確認用写真のサムネイル）
- 新規顧客登録（名前・本人確認用の写真・電話番号・メモ）
- 顧客ごとのカルテ（施術記録を新しい順のタイムラインで表示。日付ごとの状態写真とメモをすぐ見返せます）
- 記録の追加・編集（カレンダーで施術日を選択、施術部位の状態写真1枚、自由記述メモ）
- 編集履歴からの復元（誤って上書きしても元の内容に戻せます。復元操作自体も履歴に残ります）

## 本番デプロイ時の注意

- Vercel などにデプロイする際は、環境変数（`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`）を本番の Supabase プロジェクトの値に設定してください。
- `supabase/migrations` を本番プロジェクトに適用（`supabase db push`）してから利用を開始してください。
- 顧客写真は非公開ストレージバケットに保存され、閲覧のたびに期限付き署名URLを発行します（第三者に直接URLが漏れても長期間アクセスされない設計です）。
