Set-Location $PSScriptRoot

$python = ".\.venv\Scripts\python.exe"

if (-not (Test-Path ".venv")) {
    python -m venv .venv
    & .\.venv\Scripts\pip.exe install -r requirements.txt -q
}

if (-not (Test-Path ".env")) {
    Copy-Item .env.example .env
}

Write-Host "Backend  -> http://localhost:8080"
Write-Host "Frontend -> http://localhost:5173 (hot reload)"
Write-Host ""

Start-Process -FilePath $python -ArgumentList "-m", "app.main" -WorkingDirectory $PSScriptRoot

Set-Location frontend
if (-not (Test-Path "node_modules")) {
    npm install
}
npm run dev
