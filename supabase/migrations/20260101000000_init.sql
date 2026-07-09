-- フットケアサロン顧客カルテ管理アプリ 初期スキーマ
-- スタッフは全員が全顧客・全記録にアクセスできる共有スタッフ運用を前提とする

create extension if not exists "pgcrypto";

-- =========================================================
-- customers: 顧客
-- =========================================================
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_path text,
  phone text,
  memo text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

comment on table public.customers is '顧客マスタ';
comment on column public.customers.photo_path is 'Supabase Storage (customer-photos バケット) 内のパス';

create index if not exists customers_name_idx on public.customers using btree (name);
create index if not exists customers_created_at_idx on public.customers (created_at desc);

-- =========================================================
-- records: カルテ記録（施術記録）
-- =========================================================
create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  treatment_date date not null,
  photo_path text,
  memo text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);

comment on table public.records is '顧客ごとの施術記録（タイムライン）';

create index if not exists records_customer_id_idx on public.records (customer_id);
create index if not exists records_treatment_date_idx on public.records (treatment_date desc);

-- =========================================================
-- record_history: 記録の編集履歴（復元用のスナップショット）
-- 更新前の内容をここに退避しておくことで、誤操作から復元できるようにする
-- =========================================================
create table if not exists public.record_history (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.records (id) on delete cascade,
  treatment_date date not null,
  photo_path text,
  memo text not null default '',
  snapshot_at timestamptz not null default now(),
  edited_by uuid references auth.users (id) on delete set null,
  reason text not null default 'update'
);

comment on table public.record_history is 'records の編集前スナップショット（元に戻す機能のための履歴）';

create index if not exists record_history_record_id_idx on public.record_history (record_id, snapshot_at desc);

-- =========================================================
-- updated_at 自動更新トリガー
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists records_set_updated_at on public.records;
create trigger records_set_updated_at
  before update on public.records
  for each row
  execute function public.set_updated_at();

-- =========================================================
-- RLS: ログイン済みスタッフのみ全操作可能（顧客データは全スタッフ共有）
-- =========================================================
alter table public.customers enable row level security;
alter table public.records enable row level security;
alter table public.record_history enable row level security;

-- RLS はあくまで行単位の絞り込みであり、テーブル自体への権限は別途 GRANT が必要
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.records to authenticated;
grant select, insert on public.record_history to authenticated;

create policy "staff can read customers"
  on public.customers for select
  to authenticated
  using (true);

create policy "staff can insert customers"
  on public.customers for insert
  to authenticated
  with check (true);

create policy "staff can update customers"
  on public.customers for update
  to authenticated
  using (true)
  with check (true);

create policy "staff can delete customers"
  on public.customers for delete
  to authenticated
  using (true);

create policy "staff can read records"
  on public.records for select
  to authenticated
  using (true);

create policy "staff can insert records"
  on public.records for insert
  to authenticated
  with check (true);

create policy "staff can update records"
  on public.records for update
  to authenticated
  using (true)
  with check (true);

create policy "staff can delete records"
  on public.records for delete
  to authenticated
  using (true);

create policy "staff can read record_history"
  on public.record_history for select
  to authenticated
  using (true);

create policy "staff can insert record_history"
  on public.record_history for insert
  to authenticated
  with check (true);

-- =========================================================
-- Storage: 顧客写真・記録写真を保存する非公開バケット
-- =========================================================
insert into storage.buckets (id, name, public)
values ('customer-photos', 'customer-photos', false)
on conflict (id) do nothing;

create policy "staff can read customer photos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'customer-photos');

create policy "staff can upload customer photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'customer-photos');

create policy "staff can update customer photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'customer-photos')
  with check (bucket_id = 'customer-photos');

create policy "staff can delete customer photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'customer-photos');
