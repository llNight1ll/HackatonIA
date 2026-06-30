# TechCorp AI Chat — Livrable DEV WEB (React)

Interface web de chat **React + Vite** pour interagir avec le modèle **Phi-3.5-Financial** via le serveur d'inférence déployé par l'équipe INFRA.

## Fonctionnalités

- Interface React avec composants modulaires
- Historique de conversation
- Streaming temps réel des réponses (Ollama)
- Indicateur connecté / déconnecté
- Support Ollama et Triton
- Lancement en une commande

## Prérequis

- Python 3.10+
- Node.js 18+
- Serveur d'inférence (équipe INFRA) sur `http://localhost:11434` (Ollama)

## Lancement production (1 commande)

```powershell
cd rendu/devweb
.\run.ps1
```

Ouvre **http://localhost:8080**

## Mode développement (hot reload React)

```powershell
cd rendu/devweb
.\run-dev.ps1
```

- Backend API : http://localhost:8080
- Frontend React : http://localhost:5173 (proxy `/api` vers le backend)

## Structure

```
rendu/devweb/
├── app/                    # Backend FastAPI
│   ├── main.py
│   ├── config.py
│   └── backends/
├── frontend/               # Interface React
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── hooks/
│   │   └── api/
│   └── package.json
├── run.ps1 / run.bat       # Build + lancement
└── run-dev.ps1             # Dev avec hot reload
```

## Configuration

Voir `.env.example` :

| Variable | Défaut | Description |
|----------|--------|-------------|
| `BACKEND` | `ollama` | `ollama` ou `triton` |
| `OLLAMA_URL` | `http://localhost:11434` | URL Ollama |
| `OLLAMA_MODEL` | `phi3.5-financial` | Nom du modèle |
| `PORT` | `8080` | Port du backend |

## Build manuel du frontend

```powershell
cd frontend
npm install
npm run build
```

Le build est servi par FastAPI depuis `frontend/dist/`.
