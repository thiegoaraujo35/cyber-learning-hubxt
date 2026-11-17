# Cyber Learning Hub

Plataforma pessoal de gestão de aprendizagem em Cybersecurity (Next.js 16 + Supabase).

## Início rápido (Windows)
Dois cliques em **`iniciar.cmd`**: instala, configura o `.env.local`, sobe o Supabase local se o Docker Desktop estiver aberto e abre http://localhost:3000. Sem Docker, abre em *modo visualização* (sem login, só em `npm run dev`).

## Rodar manualmente
Requisitos: Node.js 20+; Docker (apenas para o Supabase local).

```bash
# Linux/macOS/WSL                 # Windows (CMD ou PowerShell)
./scripts/setup.sh                scripts\setup.cmd
```
Depois:
```bash
npx supabase start     # exibe API URL e anon key -> cole em .env.local
npm run dev            # http://localhost:3000
```
No Windows, o `setup.cmd` já contorna o erro "não está assinado digitalmente" do PowerShell.
Sem Supabase configurado o app abre, mas login/cadastro avisam que falta configuração.

## Publicar no GitHub
```bash
git remote add origin https://github.com/SEU_USUARIO/cyber-learning-hub.git
git push -u origin main
```

## Estado
- **Etapa 1** — estrutura, tema escuro, menu lateral, autenticação (Supabase Auth) e dashboard.
- **Etapa 2** — banco de dados + cadastros: **Meus cursos**, **Certificações**, **Laboratórios**,
  **Metas e planejamento** (com cronograma) e registro de **sessões de estudo**. O dashboard passa a
  ler dados reais (cursos, horas, certificações, laboratórios, gráfico semanal e histórico).
- **Etapa 3** — **Minhas plataformas** (cadastro manual, sem senhas/tokens), cursos ligados a uma
  plataforma, progresso por **aulas concluídas** (botão "+1 aula") e **importação de cursos por link**.
- **Etapa 4** — **Learning Paths** (trilhas com cursos, certificações e laboratórios; progresso
  calculado) e **Biblioteca** de materiais com tipos e tags.
- **Etapa 5** — **Relatórios** (horas por mês, distribuição por status, exportação CSV) e
  **Configurações** (nome, meta semanal, troca de senha).

### Aplicar as migrations (Etapas 2–5)
```bash
npx supabase start        # sobe o Postgres local (Docker)
npx supabase db reset     # aplica supabase/migrations/*.sql
```
Na nuvem: `npx supabase link --project-ref <ref>` e `npx supabase db push`.
Todas as tabelas têm RLS: cada usuário só vê e altera os próprios dados.

## Problemas comuns (Windows)
- **"swc ... is not a valid Win32 application"**: o binário nativo do Next veio corrompido. O `npm run dev` já usa webpack e funciona mesmo assim. Para corrigir de vez: apague `node_modules` e `.next`, rode `npm cache verify` e `npm install`. Para tentar o modo rápido: `npm run dev:turbo`.
