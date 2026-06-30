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
        $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
        if (-not $pythonCmd) {
            throw "Python introuvable. Installez Python 3.10+ et ajoutez-le au PATH."
        }
        & python -m venv .venv
        if (-not (Test-VenvReady)) {
            throw "Echec de creation de .venv avec $($pythonCmd.Source)"
        }
    }
}

Initialize-Venv

& $venvPython -m pip install --upgrade pip -q
& $venvPython -m pip install -r requirements.txt -q

if (-not (Test-Path ".env")) {
    Copy-Item .env.example .env
}

Write-Host "Build du frontend React..."
Set-Location frontend
if (-not (Test-Path "node_modules")) {
    npm install
}
npm run build
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "TechCorp AI Chat demarre sur http://localhost:8080"
Write-Host "Backend configure : voir fichier .env"
Write-Host ""

& $venvPython -m app.main
