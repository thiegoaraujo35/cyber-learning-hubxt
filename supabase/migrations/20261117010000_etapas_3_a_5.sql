-- Etapas 3–5: plataformas, aulas nos cursos, trilhas, biblioteca e configurações.
-- Mesma regra da Etapa 2: tudo por usuário e protegido por RLS.

-- ───────────────────────── Plataformas (Etapa 3) ─────────────────────────
-- Cadastro das plataformas que você usa. NÃO guarda senha nem token: só um rótulo da conta.
create table public.platforms (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 120),
  url           text check (url is null or url ~* '^https?://'),
  account_label text check (char_length(account_label) <= 120),
  plan          text check (char_length(plan) <= 60),
  status        text not null default 'ativa' check (status in ('ativa', 'inativa')),
  notes         text check (char_length(notes) <= 2000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.courses
  add column platform_id        uuid references public.platforms (id) on delete set null,
  add column total_lessons      integer check (total_lessons is null or total_lessons between 1 and 100000),
  add column completed_lessons  integer not null default 0 check (completed_lessons >= 0),
  add constraint courses_lessons_ok check (total_lessons is null or completed_lessons <= total_lessons);

-- ───────────────────────── Trilhas (Etapa 4) ─────────────────────────
create table public.learning_paths (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 200),
  description text check (char_length(description) <= 2000),
  target_date date,
  status      text not null default 'ativa' check (status in ('ativa', 'concluida', 'pausada')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Item de trilha aponta para um curso, certificação ou laboratório do próprio usuário.
-- ref_id é polimórfico (sem FK); a integridade é garantida pela aplicação + RLS por user_id.
create table public.path_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  path_id    uuid not null references public.learning_paths (id) on delete cascade,
  kind       text not null check (kind in ('course', 'certification', 'lab')),
  ref_id     uuid not null,
  created_at timestamptz not null default now(),
  unique (path_id, kind, ref_id)
);

-- ───────────────────────── Biblioteca (Etapa 4) ─────────────────────────
create table public.resources (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 200),
  kind       text not null default 'documentacao'
             check (kind in ('documentacao', 'artigo', 'video', 'livro', 'ferramenta', 'cheatsheet', 'outro')),
  url        text check (url is null or url ~* '^https?://'),
  tags       text check (char_length(tags) <= 200),
  notes      text check (char_length(notes) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────────────────────── Configurações (Etapa 5) ─────────────────────────
create table public.user_settings (
  user_id            uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  display_name       text check (char_length(display_name) <= 80),
  weekly_goal_hours  numeric(4, 1) not null default 5 check (weekly_goal_hours between 0 and 168),
  updated_at         timestamptz not null default now()
);

-- ───────────────────────── Índices e triggers ─────────────────────────
create index platforms_user_idx      on public.platforms (user_id);
create index courses_platform_idx    on public.courses (platform_id);
create index paths_user_idx          on public.learning_paths (user_id, status);
create index path_items_path_idx     on public.path_items (path_id, created_at);
create index resources_user_idx      on public.resources (user_id, kind);

create trigger platforms_updated_at      before update on public.platforms      for each row execute function public.set_updated_at();
create trigger paths_updated_at          before update on public.learning_paths for each row execute function public.set_updated_at();
create trigger resources_updated_at      before update on public.resources      for each row execute function public.set_updated_at();
create trigger user_settings_updated_at  before update on public.user_settings  for each row execute function public.set_updated_at();

-- ───────────────────────── RLS ─────────────────────────
alter table public.platforms      enable row level security;
alter table public.learning_paths enable row level security;
alter table public.path_items     enable row level security;
alter table public.resources      enable row level security;
alter table public.user_settings  enable row level security;

create policy "platforms: dono"      on public.platforms      for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "paths: dono"          on public.learning_paths for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "path_items: dono"     on public.path_items     for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "resources: dono"      on public.resources      for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "user_settings: dono"  on public.user_settings  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
