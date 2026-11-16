#!/usr/bin/env bash
# Setup local (Linux/macOS/WSL). Requer Node 20+ e, para o banco local, Docker.
set -e
cd "$(dirname "$0")/.."   # sempre na raiz do projeto
node -v >/dev/null || { echo "Instale o Node.js 20+"; exit 1; }
npm install
[ -f .env.local ] || cp .env.example .env.local
echo
echo "Pronto. Próximos passos:"
echo "  1) npx supabase start   (Docker) -> copie API URL e anon key para .env.local"
echo "  2) npm run dev          -> http://localhost:3000"
