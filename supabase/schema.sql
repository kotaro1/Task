-- Run this entire file once in the Supabase SQL Editor (Project > SQL Editor > New query).

-- enums
create type task_scale as enum ('day', 'week', 'month', 'year', 'school', 'life');
create type task_status as enum ('not_started', 'in_progress', 'done');

-- categories (extensible: user can add more later)
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  color text,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  scale task_scale not null,
  status task_status not null default 'not_started',
  category_id uuid references categories(id) on delete set null,
  due_date date,
  is_deadline boolean not null default false,
  is_important boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_user_due_idx on tasks (user_id, due_date);
create index tasks_user_scale_status_idx on tasks (user_id, scale, status);

-- achievements
create table achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_task_id uuid references tasks(id) on delete set null,
  title text not null,
  achieved_at timestamptz not null default now(),
  description text,
  image_path text,
  created_at timestamptz not null default now()
);
create index achievements_user_achieved_idx on achievements (user_id, achieved_at desc);

-- user_settings (one row per user; currently just the background image choice)
create table user_settings (
  id uuid primary key references auth.users(id) on delete cascade,
  background_image_path text,
  updated_at timestamptz not null default now()
);

-- updated_at auto-touch
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger tasks_set_updated_at before update on tasks
  for each row execute function set_updated_at();

create trigger user_settings_set_updated_at before update on user_settings
  for each row execute function set_updated_at();

-- seed 4 default categories automatically when a new user signs up
create or replace function seed_default_categories() returns trigger as $$
begin
  insert into public.categories (user_id, name, sort_order) values
    (new.id, '勉強系', 0),
    (new.id, 'その他雑用', 1),
    (new.id, '他人関係', 2),
    (new.id, 'イベント', 3);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created_seed_categories
  after insert on auth.users
  for each row execute function seed_default_categories();

-- row level security
alter table categories enable row level security;
alter table tasks enable row level security;
alter table achievements enable row level security;
alter table user_settings enable row level security;

create policy "select own categories" on categories for select using (auth.uid() = user_id);
create policy "insert own categories" on categories for insert with check (auth.uid() = user_id);
create policy "update own categories" on categories for update using (auth.uid() = user_id);
create policy "delete own categories" on categories for delete using (auth.uid() = user_id);

create policy "select own tasks" on tasks for select using (auth.uid() = user_id);
create policy "insert own tasks" on tasks for insert with check (auth.uid() = user_id);
create policy "update own tasks" on tasks for update using (auth.uid() = user_id);
create policy "delete own tasks" on tasks for delete using (auth.uid() = user_id);

create policy "select own achievements" on achievements for select using (auth.uid() = user_id);
create policy "insert own achievements" on achievements for insert with check (auth.uid() = user_id);
create policy "update own achievements" on achievements for update using (auth.uid() = user_id);
create policy "delete own achievements" on achievements for delete using (auth.uid() = user_id);

create policy "select own settings" on user_settings for select using (auth.uid() = id);
create policy "insert own settings" on user_settings for insert with check (auth.uid() = id);
create policy "update own settings" on user_settings for update using (auth.uid() = id);

-- storage: run after creating the 'achievement-images' bucket (private) in the Storage UI
create policy "read own achievement images" on storage.objects
  for select using (bucket_id = 'achievement-images' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "upload own achievement images" on storage.objects
  for insert with check (bucket_id = 'achievement-images' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "delete own achievement images" on storage.objects
  for delete using (bucket_id = 'achievement-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- storage: run after creating the 'backgrounds' bucket (private) in the Storage UI
create policy "read own background images" on storage.objects
  for select using (bucket_id = 'backgrounds' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "upload own background images" on storage.objects
  for insert with check (bucket_id = 'backgrounds' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "delete own background images" on storage.objects
  for delete using (bucket_id = 'backgrounds' and auth.uid()::text = (storage.foldername(name))[1]);
