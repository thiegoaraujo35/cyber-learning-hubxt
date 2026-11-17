-- Etapa 2 — núcleo de dados: cursos, certificações, laboratórios, metas e sessões de estudo.
-- Toda tabela é por usuário (user_id) e protegida por RLS: cada pessoa só enxerga e altera o que é dela.

create extension if not exists pgcrypto;

-- Mantém updated_at sempre correto.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────────────────────── Cursos ─────────────────────────
create table public.courses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 200),
  provider     text check (char_length(provider) <= 120),
  url          text check (url is null or url ~* '^https?://'),
  status       text not null default 'planejado'
               check (status in ('planejado', 'em_andamento', 'concluido', 'pausado')),
  progress     smallint not null default 0 check (progress between 0 and 100),
  hours_total  numeric(6, 1) check (hours_total is null or hours_total >= 0),
  started_at   date,
  completed_at date,
  notes        text check (char_length(notes) <= 4000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ───────────────────────── Certificações ─────────────────────────
create table public.certifications (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name           text not null check (char_length(name) between 1 and 200),
  issuer         text check (char_length(issuer) <= 120),
  level          text check (char_length(level) <= 60),
  status         text not null default 'planejada'
                 check (status in ('planejada', 'estudando', 'agendada', 'conquistada', 'expirada')),
  exam_date      date,
  obtained_at    date,
  expires_at     date,
  credential_url text check (credential_url is null or credential_url ~* '^https?://'),
  notes          text check (char_length(notes) <= 4000),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ───────────────────────── Laboratórios ─────────────────────────
create table public.labs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 200),
  platform     text check (char_length(platform) <= 120),
  category     text check (char_length(category) <= 120),
  difficulty   text not null default 'iniciante'
               check (difficulty in ('iniciante', 'intermediario', 'avancado')),
  status       text not null default 'pendente'
               check (status in ('pendente', 'em_andamento', 'concluido')),
  completed_at date,
  evidence_url text check (evidence_url is null or evidence_url ~* '^https?://'),
  notes        text check (char_length(notes) <= 4000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ───────────────────────── Metas ─────────────────────────
create table public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 200),
  description text check (char_length(description) <= 2000),
  target_date date,
  status      text not null default 'ativa' check (status in ('ativa', 'concluida', 'cancelada')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ───────────────────────── Sessões de estudo ─────────────────────────
create table public.study_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  course_id  uuid references public.courses (id) on delete set null,
  studied_on date not null default current_date,
  minutes    integer not null check (minutes between 1 and 1440),
  note       text check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);

-- ───────────────────────── Índices e triggers ─────────────────────────
create index courses_user_idx        on public.courses (user_id, status);
create index certifications_user_idx on public.certifications (user_id, status);
create index labs_user_idx           on public.labs (user_id, status);
create index goals_user_idx          on public.goals (user_id, status);
create index study_sessions_user_idx on public.study_sessions (user_id, studied_on desc);

create trigger courses_updated_at        before update on public.courses        for each row execute function public.set_updated_at();
create trigger certifications_updated_at before update on public.certifications for each row execute function public.set_updated_at();
create trigger labs_updated_at           before update on public.labs           for each row execute function public.set_updated_at();
create trigger goals_updated_at          before update on public.goals          for each row execute function public.set_updated_at();

-- ───────────────────────── RLS ─────────────────────────
alter table public.courses        enable row level security;
alter table public.certifications enable row level security;
alter table public.labs           enable row level security;
alter table public.goals          enable row level security;
alter table public.study_sessions enable row level security;

create policy "courses: dono"        on public.courses        for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "certifications: dono" on public.certifications for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "labs: dono"           on public.labs           for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "goals: dono"          on public.goals          for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "study_sessions: dono" on public.study_sessions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
