# Cyber Learning Hub

Painel pessoal de aprendizagem em Cybersecurity: cursos, certificações, laboratórios, trilhas,
biblioteca, metas e relatórios.

- **Site estático** (Next.js exportado) publicado no **GitHub Pages**.
- **Dados** no **Supabase** (nuvem, plano gratuito), protegidos por login + RLS.
- **Sem Docker** e sem servidor próprio.

## Como a segurança funciona (repositório público, dados privados)

| Camada | O que faz |
|---|---|
| Repositório | Só código. Nenhuma senha/chave de serviço dentro. O `.env.local` é ignorado pelo Git. |
| Login | Só existe **um** usuário (o seu). Cadastro público desativado. |
| Trava no banco | Um *trigger* impede criar qualquer segundo usuário, mesmo que o cadastro seja reativado. |
| RLS | Toda tabela só devolve linhas com `user_id = auth.uid()`. Sem login, o banco não devolve nada. |
| Chave `anon` | É pública por definição (vai no site). Sem login ela não acessa nenhuma tabela. |

Quem abrir o link do site só vê a tela de login.

## Publicar (uma vez)

### 1. Supabase (nuvem)
1. Crie um projeto em <https://supabase.com> (gratuito).
2. **SQL Editor**: rode, nesta ordem, o conteúdo de cada arquivo em `supabase/migrations/`:
   1. `20261117000000_etapa_2_nucleo.sql`
   2. `20261117010000_etapas_3_a_5.sql`
3. **Authentication → Users → Add user → Create new user**: seu e-mail + uma senha forte
   (marque *Auto Confirm User*).
4. Rode o terceiro arquivo: `20261117020000_travar_acesso_so_para_voce.sql`.
5. **Authentication → Sign In / Providers**: desative **Allow new users to sign up**.
6. (Recomendado) ative MFA/TOTP em **Authentication → Multi-Factor**.
7. **Project Settings → API**: anote a **Project URL** e a chave **anon public**.

### 2. GitHub
1. Crie um repositório **novo** (pode ser público) e envie este projeto.
2. **Settings → Secrets and variables → Actions → aba Variables → New repository variable**:
   - `SUPABASE_URL` = a Project URL
   - `SUPABASE_ANON_KEY` = a chave anon public
3. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Faça um push na branch `main` (ou rode o workflow em *Actions*). Em 1–2 minutos o site abre em
   `https://SEU_USUARIO.github.io/NOME_DO_REPOSITORIO/`.

### 3. Supabase: endereço do site
Em **Authentication → URL Configuration**, coloque o endereço acima em **Site URL**.

## Rodar no seu computador (opcional)
Requisitos: Node.js 20+.

```bash
cp .env.example .env.local   # preencha com a URL e a chave anon do seu projeto Supabase
npm install
npm run dev                  # http://localhost:3000
```

## O que tem
- **Dashboard** com indicadores, gráfico semanal (com meta) e registro de sessões de estudo.
- **Meus cursos** (progresso por aulas, importação por link), **Certificações**, **Laboratórios**.
- **Minhas plataformas** (cadastro manual, sem senhas), **Learning Paths**, **Biblioteca**.
- **Metas e planejamento** (cronograma), **Relatórios** (gráficos + exportação CSV) e **Configurações**.

## Observações
- Se precisar recriar o seu usuário um dia, apague o trigger antes:
  `drop trigger bloquear_novos_usuarios on auth.users;` e rode o arquivo 3 de novo depois.
- O progresso de cursos externos (Udemy etc.) é registrado por você; não há integração por API.
