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

## Estado (Etapa 1)
Estrutura, tema escuro, menu lateral, autenticação (Supabase Auth) e dashboard com estados vazios.
Demais módulos são páginas provisórias que indicam a etapa prevista.

## Problemas comuns (Windows)
- **"swc ... is not a valid Win32 application"**: o binário nativo do Next veio corrompido. O `npm run dev` já usa webpack e funciona mesmo assim. Para corrigir de vez: apague `node_modules` e `.next`, rode `npm cache verify` e `npm install`. Para tentar o modo rápido: `npm run dev:turbo`.
