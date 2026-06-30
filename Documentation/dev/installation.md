# Installation — TechCorp AI Chat

Ce guide décrit l'installation complète de l'interface web TechCorp AI Chat, de la préparation de l'environnement au premier lancement.

**Emplacement du code :** `rendu/devweb/`

---

## 1. Prérequis

### Logiciels

| Composant | Version minimale | Vérification |
|-----------|------------------|--------------|
| Python | 3.10+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ (inclus avec Node) | `npm --version` |
| Git | — | `git --version` |

### Services externes

| Service | Rôle | Obligatoire |
|---------|------|-------------|
| **Supabase** | Auth + base de données | Oui |
| **Ollama** (ou Triton) | Inférence Phi-3.5-Financial | Oui (équipe INFRA) |

---

## 2. Cloner le dépôt

```powershell
git clone <url-du-repo> HackatonIA
cd HackatonIA/rendu/devweb
```

---

## 3. Configuration Supabase

### 3.1 Créer le projet

1. Rendez-vous sur [supabase.com](https://supabase.com) et créez un compte
2. **New project** → choisissez un nom et un mot de passe BDD
3. Attendez la fin du provisioning (~2 min)

### 3.2 Exécuter le schéma SQL

1. Ouvrez **SQL Editor** dans le dashboard Supabase
2. **New query**
3. Copiez-collez le contenu de `rendu/devweb/supabase/schema.sql`
4. Cliquez **Run**

Le script crée les tables `profiles`, `conversations`, `messages`, les triggers et les policies RLS.

### 3.3 Configurer l'authentification

1. **Authentication → Providers → Email**
2. Activez **Email**
3. Pour un environnement de développement / hackathon : **désactivez** « Confirm email » afin de pouvoir se connecter immédiatement après inscription

### 3.4 Récupérer les clés API

1. **Project Settings → API**
2. Notez :
   - **Project URL** (ex. `https://xxxxx.supabase.co`)
   - **anon public** key (clé publique, safe côté frontend)

---

## 4. Configuration du serveur d'inférence

L'interface dépend d'un serveur d'inférence déployé par l'équipe INFRA.

### Option A — Ollama (recommandé)

```powershell
# Installer Ollama : https://ollama.com/download

# Créer le modèle depuis le Modelfile du projet
cd ../../infra/ollama
ollama create phi3.5-financial -f Modelfile

# Vérifier
ollama list
curl http://localhost:11434/api/tags
```

Le serveur Ollama doit répondre sur `http://localhost:11434` avec le modèle `phi3.5-financial` disponible.

### Option B — Triton

Si l'équipe INFRA a déployé Triton sur le port 8000, configurez `BACKEND=triton` dans `.env` (voir section 5).

---

## 5. Configuration de l'application

### 5.1 Backend — fichier `.env`

À la racine de `rendu/devweb/` :

```powershell
Copy-Item .env.example .env
```

Éditez `.env` :

```env
BACKEND=ollama
HOST=0.0.0.0
PORT=8080

OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=phi3.5-financial

TRITON_URL=http://localhost:8000
TRITON_MODEL=phi35_financial
```

| Variable | Description |
|----------|-------------|
| `BACKEND` | `ollama` ou `triton` |
| `OLLAMA_URL` | URL du serveur Ollama |
| `OLLAMA_MODEL` | Nom exact du modèle chargé |
| `PORT` | Port du serveur FastAPI |

### 5.2 Frontend — fichier `frontend/.env`

```powershell
cd frontend
Copy-Item .env.example .env
```

Éditez `frontend/.env` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Important :** les variables Vite doivent être préfixées par `VITE_`. Toute modification nécessite un rebuild (`npm run build`) en production, ou un redémarrage du serveur Vite en développement.

---

## 6. Installation des dépendances

### Automatique (recommandé)

Les scripts `run.ps1` et `run-dev.ps1` créent le venv Python, installent les packages et lancent `npm install` automatiquement.

### Manuelle

**Backend Python :**

```powershell
cd rendu/devweb
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Frontend Node.js :**

```powershell
cd rendu/devweb/frontend
npm install
```

---

## 7. Build et lancement

### Production (une commande)

```powershell
cd rendu/devweb
.\run.ps1
```

Ce script :
1. Crée/met à jour le venv Python
2. Installe les dépendances Python
3. Copie `.env.example` → `.env` si absent
4. Build le frontend React (`npm run build`)
5. Démarre FastAPI sur `http://localhost:8080`

Ouvrez **http://localhost:8080** dans le navigateur.

### Développement (hot reload)

```powershell
cd rendu/devweb
.\run-dev.ps1
```

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8080 |
| Frontend Vite | http://localhost:5173 |

Le proxy Vite redirige `/api/*` vers le backend.

### Linux / macOS

```bash
cd rendu/devweb
chmod +x run.sh
./run.sh
```

---

## 8. Vérification de l'installation

### Checklist

- [ ] Supabase : tables visibles dans **Table Editor** (`profiles`, `conversations`, `messages`)
- [ ] Ollama : `curl http://localhost:11434/api/tags` retourne `phi3.5-financial`
- [ ] Backend : `curl http://localhost:8080/api/health` → `"connected": true`
- [ ] Frontend : page `/login` s'affiche
- [ ] Inscription : création de compte + entrée dans `auth.users` et `profiles`
- [ ] Chat : envoi d'un message → réponse du modèle + messages en BDD

### Tests rapides

**Santé du backend :**
```powershell
curl http://localhost:8080/api/health
```

Réponse attendue (extrait) :
```json
{
  "connected": true,
  "backend": "ollama",
  "model": "phi3.5-financial",
  "model_ready": true
}
```

**Test chat (sans frontend) :**
```powershell
curl -X POST http://localhost:8080/api/chat `
  -H "Content-Type: application/json" `
  -d '{"messages":[{"role":"user","content":"Bonjour"}],"stream":false}'
```

---

## 9. Problèmes courants

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| `503 Frontend React non buildé` | Pas de build Vite | `cd frontend && npm run build` |
| `connected: false` sur `/api/health` | Ollama arrêté ou mauvaise URL | Démarrer Ollama, vérifier `OLLAMA_URL` |
| `model_ready: false` | Modèle non chargé | `ollama create phi3.5-financial -f Modelfile` |
| Erreur Supabase à l'inscription | Schéma SQL non exécuté | Relancer `schema.sql` |
| Page blanche après login | Clés Supabase invalides | Vérifier `frontend/.env` |
| `Invalid login credentials` | Email non confirmé | Désactiver confirmation email dans Supabase |
| Erreur PowerShell sur `run.ps1` | Caractères Unicode | Utiliser la version corrigée du script |

---

## 10. Structure des fichiers de configuration

```
rendu/devweb/
├── .env                  # Config backend (NE PAS committer)
├── .env.example          # Modèle config backend
└── frontend/
    ├── .env              # Config Supabase (NE PAS committer)
    └── .env.example      # Modèle config frontend
```

Les fichiers `.env` sont ignorés par Git (`.gitignore`). Ne commitez jamais de clés secrètes.

---

## 11. Prochaines étapes

Une fois l'installation validée, consultez :

- [Documentation d'exploitation](./exploitation.md) — utilisation quotidienne, maintenance
- [Documentation d'architecture](./architecture.md) — détails techniques
