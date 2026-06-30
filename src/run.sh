#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -x ".venv/bin/python" ]; then
  if [ -d ".venv" ]; then
    echo "Environnement virtuel incomplet, recréation..."
    rm -rf ".venv"
  fi
  echo "Création de l'environnement virtuel Python..."
  python3 -m venv .venv
fi

source .venv/bin/activate
python -m pip install --upgrade pip -q
python -m pip install -r requirements.txt -q

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

echo "Build du frontend React..."
cd frontend
if [ ! -d "node_modules" ]; then
  npm install
fi
npm run build
cd ..

echo
echo "TechCorp AI Chat démarre sur http://localhost:8080"
echo "Backend configuré : voir fichier .env"
echo

python -m app.main
