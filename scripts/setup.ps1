# Setup local (Windows PowerShell). Requer Node 20+ e, para o banco local, Docker Desktop.
Set-Location (Split-Path $PSScriptRoot -Parent)   # sempre na raiz do projeto
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Write-Error "Instale o Node.js 20+"; exit 1 }
npm install
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
Write-Host ""
Write-Host "Pronto. Proximos passos:"
Write-Host "  1) npx supabase start   (Docker) -> copie API URL e anon key para .env.local"
Write-Host "  2) npm run dev          -> http://localhost:3000"
