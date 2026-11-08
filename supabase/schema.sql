-- Esquema do Aplicativo de Metas e Planejamento Financeiro

-- 1. Tabela de Perfis de Usuário
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  monthly_salary numeric(10, 2) default 1500.00,
  full_name text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Tabela de Metas
create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  category_icon text default 'Sparkles',
  color_theme text default 'peach',
  deadline_months integer not null default 6,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Tabela de Itens da Meta
create table if not exists public.goal_items (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references public.goals(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  price numeric(10, 2) not null default 0.00,
  product_url text,
  image_url text,
  is_purchased boolean default false,
  priority text default 'media',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Habilitar Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.goal_items enable row level security;

-- 5. Políticas de Segurança (RLS)
-- Profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Goals
drop policy if exists "Users can manage own goals" on public.goals;
create policy "Users can manage own goals" on public.goals
  for all using (auth.uid() = user_id);

-- Goal Items
drop policy if exists "Users can manage own goal items" on public.goal_items;
create policy "Users can manage own goal items" on public.goal_items
  for all using (auth.uid() = user_id);

-- 6. Trigger para auto-criar perfil quando usuário se cadastra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, monthly_salary)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Usuário'), 1500.00)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

