#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
  echo "Création de l'environnement virtuel..."
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -r requirements.txt -q

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

echo
echo "TechCorp AI Chat démarre sur http://localhost:8080"
echo "Backend configuré : voir fichier .env"
echo

python -m app.main
