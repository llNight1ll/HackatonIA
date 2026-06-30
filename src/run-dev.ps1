Set-Location $PSScriptRoot
$ErrorActionPreference = "Stop"

$venvPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"

function Test-VenvReady {
    return Test-Path $venvPython
}

function Initialize-Venv {
    if ((Test-Path ".venv") -and -not (Test-VenvReady)) {
        Write-Host "Environnement virtuel incomplet, recreation..."
        Remove-Item -Recurse -Force ".venv"
    }

    if (-not (Test-VenvReady)) {
        Write-Host "Creation de l'environnement virtuel Python..."
        & python -m venv .venv
        if (-not (Test-VenvReady)) {
            throw "Echec de creation de .venv"
        }
    }
}

Initialize-Venv

& $venvPython -m pip install --upgrade pip -q
& $venvPython -m pip install -r requirements.txt -q

if (-not (Test-Path ".env")) {
    Copy-Item .env.example .env
}

Write-Host "Backend  -> http://localhost:8080"
Write-Host "Frontend -> http://localhost:5173 (hot reload)"
Write-Host ""

Start-Process -FilePath $venvPython -ArgumentList "-m", "app.main" -WorkingDirectory $PSScriptRoot

Set-Location frontend
if (-not (Test-Path ".env")) {
    Copy-Item .env.example .env
    Write-Host "frontend/.env cree depuis .env.example - renseignez vos cles Supabase"
}
if (-not (Test-Path "node_modules")) {
    npm install
}
npm run dev
