# Architecture — TechCorp AI Chat (interface web)

## 1. Vue d'ensemble

**TechCorp AI Chat** est l'interface web du projet HackatonIA. Elle permet à des analystes financiers de converser avec le modèle **Phi-3.5-Financial** via une interface de type chat, avec authentification utilisateur et persistance des conversations.

L'application repose sur une architecture **hybride en trois couches** :

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Frontend | React 18 + Vite | Interface utilisateur, auth, persistance |
| Backend API | FastAPI + Uvicorn | Proxy vers le serveur d'inférence LLM |
| Données & Auth | Supabase (PostgreSQL + Auth) | Utilisateurs, conversations, messages |

Le code source se trouve dans `rendu/devweb/`.

---

## 2. Schéma d'architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Navigateur (utilisateur)                        │
└─────────────────────────────────────────────────────────────────────────┘
         │                                    │
         │ HTTPS (auth + CRUD)                │ HTTP /api/*
         ▼                                    ▼
┌─────────────────────┐              ┌─────────────────────┐
│      Supabase       │              │   FastAPI (:8080)   │
│  ─────────────────  │              │  ─────────────────  │
│  Auth (JWT)         │              │  GET  /api/health   │
│  profiles           │              │  POST /api/chat     │
│  conversations      │              │  GET  /  (SPA)      │
│  messages + RLS     │              └──────────┬──────────┘
└─────────────────────┘                         │
                                                │ httpx
                                                ▼
                                     ┌─────────────────────┐
                                     │ Serveur d'inférence │
                                     │  Ollama (:11434)    │
                                     │  ou Triton (:8000)  │
                                     └─────────────────────┘
                                                │
                                                ▼
                                     ┌─────────────────────┐
                                     │ Phi-3.5-Financial   │
                                     └─────────────────────┘
```

### Principes de conception

- **Séparation des responsabilités** : le frontend gère l'UX, l'authentification et la persistance ; le backend FastAPI ne s'occupe que de l'inférence LLM.
- **Sécurité par RLS** : les données utilisateur sont protégées côté Supabase (Row Level Security), sans exposer de clé service côté client au-delà de la clé `anon`.
- **Déploiement monolithique simplifié** : en production, FastAPI sert le build React statique (`frontend/dist/`) sur le port 8080.

---

## 3. Modes d'exécution

### Production (`run.ps1`)

- Build React → `frontend/dist/`
- Un seul processus Uvicorn sur `:8080`
- Frontend et API partagent la même origine (pas de problème CORS en prod)

### Développement (`run-dev.ps1`)

- Backend FastAPI : `http://localhost:8080`
- Frontend Vite (hot reload) : `http://localhost:5173`
- Proxy Vite : les requêtes `/api/*` sont redirigées vers le backend

---

## 4. Structure du projet

```
rendu/devweb/
├── app/                          # Backend Python
│   ├── main.py                   # Point d'entrée FastAPI, routes API + SPA
│   ├── config.py                 # Settings (pydantic-settings, .env)
│   └── backends/
│       ├── base.py               # Interface abstraite InferenceBackend
│       ├── ollama.py             # Client Ollama (streaming)
│       ├── triton.py             # Client Triton (réponse complète)
│       └── __init__.py           # Factory get_backend()
│
├── frontend/                     # Frontend React
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Connexion
│   │   │   ├── Register.jsx      # Inscription
│   │   │   └── Chat.jsx          # Page principale (orchestration)
│   │   ├── components/
│   │   │   ├── Sidebar.jsx       # Navigation, conversations, statut
│   │   │   ├── ChatPanel.jsx     # Zone messages scrollable
│   │   │   ├── Composer.jsx      # Saisie utilisateur
│   │   │   ├── MessageBubble.jsx # Bulle de message
│   │   │   ├── CollapsibleSection.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Session Supabase
│   │   ├── hooks/
│   │   │   ├── useChat.js        # Logique chat + persistance
│   │   │   ├── useConversations.js
│   │   │   └── useHealth.js      # Polling serveur inférence
│   │   ├── api/
│   │   │   ├── chat.js           # Appels /api/health et /api/chat
│   │   │   └── conversations.js  # CRUD Supabase
│   │   ├── lib/
│   │   │   └── supabase.js       # Client Supabase
│   │   └── constants/
│   │       └── prompts.js        # Messages d'accueil, suggestions
│   ├── vite.config.js
│   └── package.json
│
├── supabase/
│   └── schema.sql                # Schéma BDD + RLS + triggers
│
├── run.ps1 / run-dev.ps1         # Scripts de lancement (Windows)
├── run.sh / run.bat              # Linux / Windows batch
├── requirements.txt              # Dépendances Python
├── .env.example                  # Config backend
└── DESIGN.md                     # Design system Verdana Health
```

---

## 5. Backend FastAPI

### Routes exposées

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/health` | État du serveur d'inférence (connecté, modèle, URL) |
| `POST` | `/api/chat` | Génération de réponse LLM |
| `GET` | `/` | Fichier `index.html` du build React |
| — | `/assets/*` | Fichiers statiques Vite (JS, CSS) |

### Contrat API — `POST /api/chat`

**Requête :**
```json
{
  "messages": [
    { "role": "user", "content": "Explique-moi les ETF" }
  ],
  "stream": true
}
```

**Réponse (Ollama, streaming) :** `text/plain; charset=utf-8`, chunks concaténables.

**Réponse (Triton ou fallback) :**
```json
{
  "message": {
    "role": "assistant",
    "content": "Texte de la réponse..."
  }
}
```

**Erreur 503 :** serveur d'inférence indisponible.

### Pattern Adapter — backends d'inférence

Le backend est sélectionné via la variable `BACKEND` dans `.env` :

- **`ollama`** (défaut) : API `/api/chat` d'Ollama, streaming natif
- **`triton`** : API REST v2 `/v2/models/{model}/infer`, réponse JSON complète

La factory `get_backend()` dans `app/backends/__init__.py` instancie le bon adaptateur.

### Configuration (`app/config.py`)

| Variable | Défaut | Description |
|----------|--------|-------------|
| `BACKEND` | `ollama` | Backend d'inférence |
| `HOST` | `0.0.0.0` | Interface d'écoute |
| `PORT` | `8080` | Port HTTP |
| `OLLAMA_URL` | `http://localhost:11434` | URL Ollama |
| `OLLAMA_MODEL` | `phi3.5-financial` | Nom du modèle Ollama |
| `TRITON_URL` | `http://localhost:8000` | URL Triton |
| `TRITON_MODEL` | `phi35_financial` | Nom du modèle Triton |
| `REQUEST_TIMEOUT` | `120.0` | Timeout requêtes inférence (s) |

---

## 6. Frontend React

### Routing (`react-router-dom`)

| Route | Composant | Accès |
|-------|-----------|-------|
| `/login` | `Login` | Public |
| `/register` | `Register` | Public |
| `/` | `Chat` | Protégé (`ProtectedRoute`) |
| `*` | Redirection → `/` | — |

### Authentification

- Client `@supabase/supabase-js` initialisé dans `lib/supabase.js`
- `AuthContext` écoute `onAuthStateChange` et charge le profil depuis `profiles`
- Méthodes : `signIn`, `signUp`, `signOut`
- Variables d'environnement Vite : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Flux d'une conversation

```
1. Utilisateur authentifié accède à /
2. useConversations charge la liste depuis Supabase
3. Utilisateur saisit un message
4. useChat :
   a. Crée une conversation si nécessaire (ensureConversation)
   b. Sauvegarde le message user en BDD
   c. Appelle POST /api/chat avec l'historique
   d. Affiche la réponse en streaming (Ollama)
   e. Sauvegarde le message assistant en BDD
   f. Active la conversation dans la sidebar
5. Changement de conversation → rechargement messages depuis Supabase
```

### Hooks principaux

| Hook | Responsabilité |
|------|----------------|
| `useAuth` | Session, profil, auth |
| `useHealth` | Polling `/api/health` toutes les 10 s, expose `canSend` |
| `useConversations` | CRUD conversations, sélection active |
| `useChat` | État messages, envoi, persistance, streaming |

### Interface utilisateur

- **Design system** : Verdana Health (voir `DESIGN.md`) — navy, sage, DM Sans
- **Sidebar** : sections repliables (Connexion, Historique, Configuration, Suggestions)
- **Sélecteur** : liste déroulante pour changer de conversation rapidement
- **ChatPanel** : zone messages scrollable (`overflow-y: auto`, hauteur contrainte en flex)

---

## 7. Base de données Supabase

### Modèle de données

```
auth.users (Supabase Auth)
    │
    ├── profiles (1:1)
    │     id, email, display_name, created_at, updated_at
    │
    └── conversations (1:N)
          id, user_id, title, created_at, updated_at
              │
              └── messages (1:N)
                    id, conversation_id, role, content, created_at
```

### Triggers automatiques

- **`handle_new_user`** : crée une entrée `profiles` à l'inscription
- **`set_updated_at`** : met à jour `updated_at` sur `profiles` et `conversations`
- **`touch_conversation_on_message`** : met à jour `updated_at` de la conversation à chaque nouveau message

### Row Level Security (RLS)

Toutes les tables applicatives ont RLS activé :

- Un utilisateur ne voit/modifie **que ses propres** profils, conversations et messages
- Les policies vérifient `auth.uid()` ou l'appartenance via jointure `conversations.user_id`

Le script complet est dans `rendu/devweb/supabase/schema.sql`.

---

## 8. Flux de données — diagramme de séquence

```
Utilisateur    React           Supabase         FastAPI         Ollama
    │            │                 │                │              │
    │── login ──▶│                 │                │              │
    │            │── signIn ──────▶│                │              │
    │            │◀── JWT ─────────│                │              │
    │            │                 │                │              │
    │── message ─▶│                 │                │              │
    │            │── insert msg ───▶│                │              │
    │            │── POST /chat ───────────────────▶│              │
    │            │                 │                │── infer ────▶│
    │            │◀── stream ──────────────────────│◀── chunks ───│
    │            │── insert reply ─▶│                │              │
    │◀── affichage│                 │                │              │
```

---

## 9. Dépendances

### Python (`requirements.txt`)

- `fastapi` — framework API
- `uvicorn[standard]` — serveur ASGI
- `httpx` — client HTTP async (Ollama, Triton)
- `pydantic` / `pydantic-settings` — validation et config

### Node.js (`frontend/package.json`)

- `react` / `react-dom` — UI
- `react-router-dom` — routing
- `@supabase/supabase-js` — client Supabase
- `vite` + `@vitejs/plugin-react` — build et dev server

---

## 10. Points d'extension

| Besoin | Emplacement suggéré |
|--------|---------------------|
| Nouveau backend d'inférence | `app/backends/` + factory |
| Auth backend sur `/api/chat` | Middleware FastAPI + validation JWT Supabase |
| Markdown dans les réponses | `MessageBubble.jsx` |
| Renommage conversation | `api/conversations.js` + UI sidebar |
| Dark mode | Variables CSS dans `App.css` |
| Rate limiting | Middleware FastAPI ou Supabase Edge Functions |

---

## 11. Références internes

- Code source : `rendu/devweb/`
- Schéma BDD : `rendu/devweb/supabase/schema.sql`
- Design system : `rendu/devweb/DESIGN.md`
- README opérationnel : `rendu/devweb/README.md`
