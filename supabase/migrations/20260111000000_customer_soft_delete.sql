-- 顧客の削除を取り消せるように、論理削除（ソフトデリート）に変更する
alter table public.customers
  add column if not exists deleted_at timestamptz;

create index if not exists customers_deleted_at_idx on public.customers (deleted_at);
