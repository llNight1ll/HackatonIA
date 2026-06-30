@echo off
setlocal

cd /d "%~dp0"

if not exist ".venv" (
  echo Creation de l'environnement virtuel...
  python -m venv .venv
)

call .venv\Scripts\activate.bat
pip install -r requirements.txt -q

if not exist ".env" (
  copy .env.example .env >nul
)

echo.
echo TechCorp AI Chat demarre sur http://localhost:8080
echo Backend configure : voir fichier .env
echo.

python -m app.main
