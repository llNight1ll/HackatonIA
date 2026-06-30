# TechCorp AI Chat — Livrable DEV WEB

Interface web de chat pour interagir avec le modèle **Phi-3.5-Financial** via le serveur d'inférence déployé par l'équipe INFRA.

## Fonctionnalités

- Interface chat professionnelle (historique de conversation)
- Streaming temps réel des réponses (Ollama)
- Indicateur de connexion au serveur d'inférence (connecté / déconnecté)
- Support multi-backend : **Ollama** (défaut) et **Triton**
- Suggestions de prompts financiers
- Lancement en une commande

## Prérequis

- Python 3.10+
- Serveur d'inférence opérationnel (équipe INFRA) :
  - **Ollama** : `http://localhost:11434`
  - **Triton** : `http://localhost:8000`

## Lancement rapide

### Windows (PowerShell)

```powershell
cd rendu/devweb
.\run.ps1
```

### Linux / macOS

```bash
cd rendu/devweb
chmod +x run.sh
./run.sh
```

Puis ouvrir : **http://localhost:8080**

## Configuration

Copier `.env.example` vers `.env` et adapter selon le choix INFRA :

| Variable | Défaut | Description |
|----------|--------|-------------|
| `BACKEND` | `ollama` | `ollama` ou `triton` |
| `OLLAMA_URL` | `http://localhost:11434` | URL Ollama |
| `OLLAMA_MODEL` | `phi3.5-financial` | Nom du modèle Ollama |
| `TRITON_URL` | `http://localhost:8000` | URL Triton |
| `TRITON_MODEL` | `phi35_financial` | Nom du modèle Triton |
| `PORT` | `8080` | Port de l'interface web |

## Architecture

```
rendu/devweb/
├── app/
│   ├── main.py              # API FastAPI + serveur statique
│   ├── config.py            # Configuration (.env)
│   ├── backends/
│   │   ├── ollama.py        # Client API Ollama (streaming)
│   │   └── triton.py        # Client API Triton
│   └── static/
│       ├── index.html       # Interface utilisateur
│       ├── css/style.css
│       └── js/chat.js
├── run.ps1 / run.sh         # Lancement en 1 commande
└── requirements.txt
```

## Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/` | Interface web |
| `GET` | `/api/health` | État de connexion au serveur d'inférence |
| `POST` | `/api/chat` | Envoi de messages (streaming ou JSON) |

## Intégration INFRA

### Ollama (recommandé)

L'équipe INFRA doit créer le modèle depuis `ollama_server/Modelfile` :

```bash
ollama create phi3.5-financial -f ollama_server/Modelfile
ollama serve
```

### Triton

Configurer `.env` :

```
BACKEND=triton
TRITON_URL=http://localhost:8000
TRITON_MODEL=phi35_financial
```

## Notes sécurité

Cette interface **ne contient aucune backdoor** et transmet les messages directement au serveur d'inférence. L'équipe CYBER peut auditer le code dans `app/` — aucune logique cachée de type trigger ou encodage de données sensibles.
