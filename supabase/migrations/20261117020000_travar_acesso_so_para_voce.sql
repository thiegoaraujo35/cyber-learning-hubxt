-- Acesso só para o dono do projeto.
-- Rode DEPOIS de criar o seu usuário (Authentication > Users > Add user).
--
-- 1) Trava no banco: depois que existe um usuário, nenhum outro pode ser criado
--    (nem por cadastro público, nem pelo painel, nem por API), mesmo que o cadastro
--    seja reativado sem querer nas configurações do Supabase.
-- 2) A chave "anon" (pública, presente no site) perde qualquer acesso direto às tabelas.
--    Quem lê/grava dados é sempre o usuário logado, limitado pela RLS (user_id = auth.uid()).

create or replace function public.bloquear_novos_usuarios()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from auth.users) then
    raise exception 'Cadastro de novos usuários está bloqueado neste projeto.';
  end if;
  return new;
end;
$$;

revoke all on function public.bloquear_novos_usuarios() from public, anon, authenticated;

drop trigger if exists bloquear_novos_usuarios on auth.users;
create trigger bloquear_novos_usuarios
  before insert on auth.users
  for each row execute function public.bloquear_novos_usuarios();

revoke all on all tables in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
