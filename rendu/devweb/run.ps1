Set-Location $PSScriptRoot

$python = ".\.venv\Scripts\python.exe"
$pip = ".\.venv\Scripts\pip.exe"

if (-not (Test-Path ".venv")) {
    Write-Host "Creation de l'environnement virtuel Python..."
    python -m venv .venv
}

& $pip install -r requirements.txt -q

if (-not (Test-Path ".env")) {
    Copy-Item .env.example .env
}

Write-Host "Build du frontend React..."
Set-Location frontend
if (-not (Test-Path "node_modules")) {
    npm install
}
npm run build
Set-Location ..

Write-Host ""
Write-Host "TechCorp AI Chat demarre sur http://localhost:8080"
Write-Host "Backend configure : voir fichier .env"
Write-Host ""

& $python -m app.main
