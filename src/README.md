# TechCorp AI Chat — Livrable DEV WEB (React)

Interface web de chat **React + Vite** pour interagir avec le modèle **Phi-3.5-Financial** via le serveur d'inférence déployé par l'équipe INFRA.

## Fonctionnalités

- Authentification utilisateur (inscription / connexion via Supabase)
- Persistance des conversations et messages (Supabase + RLS)
- Interface React avec composants modulaires
- Historique multi-conversations
- Streaming temps réel des réponses (Ollama)
- Indicateur connecté / déconnecté
- Support Ollama et Triton
- Lancement en une commande

## Prérequis

- Python 3.10+
- Node.js 18+
- Projet [Supabase](https://supabase.com) (gratuit)
- Serveur d'inférence (équipe INFRA) sur `http://localhost:11434` (Ollama)

## Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Ouvrez **SQL Editor** et exécutez le script `supabase/schema.sql`
3. Dans **Authentication → Providers**, activez **Email** (désactivez la confirmation e-mail pour le hackathon si besoin)
4. Copiez **Project URL** et **anon public key** (Settings → API)
5. Créez `frontend/.env` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

## Lancement production (1 commande)

```powershell
cd rendu/devweb
.\run.ps1
```

Ouvre **http://localhost:8080** → redirection vers `/login` si non connecté.

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
├── app/                    # Backend FastAPI (inférence LLM)
├── frontend/               # Interface React
│   ├── src/
│   │   ├── pages/          # Login, Register, Chat
│   │   ├── context/        # AuthContext (Supabase)
│   │   ├── api/            # chat + conversations
│   │   └── hooks/
│   └── .env.example
├── supabase/
│   └── schema.sql          # Tables + RLS à exécuter dans Supabase
├── run.ps1 / run.bat
└── run-dev.ps1
```

## Configuration backend

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
