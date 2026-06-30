@echo off
setlocal

cd /d "%~dp0"

if not exist ".venv" (
  echo Creation de l'environnement virtuel Python...
  python -m venv .venv
)

call .venv\Scripts\activate.bat
pip install -r requirements.txt -q

if not exist ".env" (
  copy .env.example .env >nul
)

echo Build du frontend React...
cd frontend
if not exist "node_modules" (
  call npm install
)
call npm run build
cd ..

echo.
echo TechCorp AI Chat demarre sur http://localhost:8080
echo Backend configure : voir fichier .env
echo.

python -m app.main
