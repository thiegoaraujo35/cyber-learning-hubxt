# Cyber Learning Hub

Plataforma pessoal de gestão de aprendizagem em Cybersecurity (Next.js 16 + Supabase).

## Rodar na sua máquina
Requisitos: Node.js 20+; Docker (apenas para o Supabase local).

```bash
# Linux/macOS/WSL                 # Windows (PowerShell)
./scripts/setup.sh                .\scripts\setup.ps1
```
Depois:
```bash
npx supabase start     # exibe API URL e anon key -> cole em .env.local
npm run dev            # http://localhost:3000
```
Sem Supabase configurado o app abre, mas login/cadastro avisam que falta configuração.

## Publicar no GitHub
```bash
git remote add origin https://github.com/SEU_USUARIO/cyber-learning-hub.git
git push -u origin main
```

## Estado (Etapa 1)
Estrutura, tema escuro, menu lateral, autenticação (Supabase Auth) e dashboard com estados vazios.
Demais módulos são páginas provisórias que indicam a etapa prevista.
