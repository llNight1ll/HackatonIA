@echo off
setlocal

cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  if exist ".venv" (
    echo Environnement virtuel incomplet, recreation...
    rmdir /s /q ".venv"
  )
  echo Creation de l'environnement virtuel Python...
  python -m venv .venv
)

if not exist ".venv\Scripts\python.exe" (
  echo Echec de creation de .venv
  exit /b 1
)

call .venv\Scripts\activate.bat
python -m pip install --upgrade pip -q
python -m pip install -r requirements.txt -q

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

.venv\Scripts\python.exe -m app.main
