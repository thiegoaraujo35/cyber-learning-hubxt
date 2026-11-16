# Cyber Learning Hub - inicia tudo com um comando (Windows).
Set-Location $PSScriptRoot
$ErrorActionPreference = "Continue"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Instale o Node.js 20+ (https://nodejs.org) e rode de novo." -ForegroundColor Red; exit 1
}
if (-not (Test-Path node_modules)) { Write-Host "Instalando dependencias..."; npm install }
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }

function Set-EnvVar($key, $value) {
  $lines = @(Get-Content .env.local)
  $found = $false
  $lines = $lines | ForEach-Object { if ($_ -match "^$key=") { $found = $true; "$key=$value" } else { $_ } }
  if (-not $found) { $lines += "$key=$value" }
  Set-Content .env.local $lines
}

$supabaseOk = $false
if (Get-Command docker -ErrorAction SilentlyContinue) {
  docker info *> $null
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Iniciando Supabase local (a 1a vez baixa imagens e demora)..."
    npx supabase start
    if ($LASTEXITCODE -eq 0) {
      $out = npx supabase status -o env
      $url = ($out | Select-String '^API_URL="?([^"]+)"?').Matches.Groups[1].Value
      $key = ($out | Select-String '^(ANON_KEY|PUBLISHABLE_KEY)="?([^"]+)"?').Matches.Groups[2].Value
      if ($url -and $key) {
        Set-EnvVar "NEXT_PUBLIC_SUPABASE_URL" $url
        Set-EnvVar "NEXT_PUBLIC_SUPABASE_ANON_KEY" $key
        Set-EnvVar "DEV_BYPASS_AUTH" "false"
        $supabaseOk = $true
      }
    }
  }
}

if ($supabaseOk) {
  Write-Host "Supabase local configurado. Login/cadastro ativos." -ForegroundColor Green
} else {
  Set-EnvVar "DEV_BYPASS_AUTH" "true"
  Write-Host "Docker/Supabase indisponivel: abrindo em MODO VISUALIZACAO (sem login)." -ForegroundColor Yellow
  Write-Host "Para ativar login: abra o Docker Desktop e rode iniciar.cmd de novo." -ForegroundColor Yellow
}

Start-Process cmd -ArgumentList '/c timeout /t 8 >nul & start http://localhost:3000' -WindowStyle Hidden
Write-Host "Abrindo http://localhost:3000 (Ctrl+C para parar)"
npm run dev
