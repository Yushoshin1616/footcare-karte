-- 記録に複数枚の写真を添付できるようにする（既存の photo_path 列は使わなくなるが、
-- 過去データ保全のため削除はしない）
alter table public.records
  add column if not exists photo_paths text[] not null default '{}';

alter table public.record_history
  add column if not exists photo_paths text[] not null default '{}';
