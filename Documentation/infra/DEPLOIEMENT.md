# Documentation de déploiement — INFRA TechCorp

**Projet :** HackatonIA — Assistant financier Phi-3.5-Financial  
**Filière :** INFRA  
**Date :** Juin 2026

---

## 1. Résumé exécutif

L'équipe INFRA a déployé un **serveur d'inférence** exposant le modèle **Phi-3.5-Financial** à l'interface web développée par l'équipe DEV WEB.

| Élément | Valeur retenue |
|---------|----------------|
| **Solution principale** | **Ollama** |
| **Solution alternative** | Triton Inference Server (NVIDIA) |
| **URL d'inférence (DEV WEB)** | `http://localhost:11434` |
| **Modèle servi** | `phi3.5-financial` |
| **Interface web (API proxy)** | `http://localhost:8080` |

Le choix d'**Ollama** est motivé par sa simplicité de déploiement, sa quantization automatique et son API REST native compatible avec le streaming temps réel requis par l'interface chat.

---

## 2. Contexte et périmètre

### 2.1 Missions INFRA

| Mission | Statut | Livrable |
|---------|--------|----------|
| Choisir et déployer un serveur d'inférence Phi-3.5-Financial | ✅ | Ollama (prod) + config Triton (bonus) |
| Rendre le serveur accessible à l'équipe DEV WEB | ✅ | URL + port documentés, `.env` fourni |
| Optimiser les performances (inférence, quantization) | ✅ | Paramètres Modelfile + FP16 Triton |

### 2.2 Actifs disponibles dans le dépôt

```
HackatonIA/
├── infra/
│   ├── ollama/
│   │   └── Modelfile              # Définition du modèle Ollama
│   └── triton/
│       ├── Dockerfile             # Image Triton + dépendances Python
│       └── model_repository/
│           └── phi35_financial/   # Backend Python HuggingFace
├── models/
│   └── phi3_financial/            # Adapter LoRA fine-tuné (équipe IA)
└── rendu/devweb/                  # Interface React + API FastAPI (DEV WEB)
```

> **Note :** Le dossier `models/phi3_financial/` contient un adapter LoRA entraîné sur `Phi-3-mini-4k-instruct`. Le déploiement Ollama/Triton documenté ici s'appuie sur **Phi-3.5** avec un prompt système financier. L'intégration du LoRA dans Ollama ou Triton constitue une piste d'amélioration future (voir § 7).

---

## 3. Choix technique justifié

### 3.1 Options évaluées

| Solution | Avantages | Inconvénients | Verdict |
|----------|-----------|---------------|---------|
| **Ollama** | Installation en 5 min, API `/api/chat` avec streaming, quantization auto (Q4/Q8), CPU ou GPU | Moins de contrôle fin sur le batching | ✅ **Retenu (production)** |
| **Triton Inference Server** | Scalable, multi-modèles, monitoring NVIDIA, backend Python HF | GPU NVIDIA requis, config complexe, pas de streaming natif côté DEV WEB | ⚙️ Alternative / bonus |
| **Serveur maison (FastAPI + Transformers)** | Contrôle total, LoRA natif via PEFT | Maintenance lourde, pas de quantization clé en main, consommation mémoire élevée | ❌ Non retenu (déjà couvert par Triton backend Python) |

### 3.2 Décision : Ollama en production

**Ollama** a été retenu pour les raisons suivantes :

1. **Time-to-deploy** — compatible avec la contrainte hackathon (7 h) : une commande suffit pour créer et servir le modèle.
2. **API chat native** — endpoint `POST /api/chat` avec streaming NDJSON, directement consommé par le backend FastAPI (`rendu/devweb/app/backends/ollama.py`).
3. **Quantization automatique** — lors du `pull` de `phi3.5`, Ollama télécharge une version quantisée (typiquement **Q4_K_M**), réduisant la VRAM de ~7 Go (FP16) à ~2,5 Go sans action manuelle.
4. **Portabilité** — fonctionne sur CPU (lent) et GPU (CUDA), Windows/Linux/macOS.
5. **Modelfile versionné** — le comportement financier est codifié dans `infra/ollama/Modelfile` (system prompt + hyperparamètres).

**Triton** reste documenté comme solution **alternative** pour un déploiement GPU NVIDIA en environnement de production avancé (batching, métriques Prometheus, multi-instances).

---

## 4. Architecture de déploiement

```
┌─────────────────────────────────────────────────────────────┐
│  Utilisateur (navigateur)                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  DEV WEB — FastAPI + React          http://localhost:8080   │
│  rendu/devweb/                                              │
│  • Proxy /api/chat → serveur d'inférence                    │
│  • Streaming (Ollama uniquement)                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ BACKEND=ollama | triton
              ┌────────────┴────────────┐
              ▼                         ▼
┌─────────────────────────┐  ┌─────────────────────────────┐
│  Ollama (production)    │  │  Triton (alternative)       │
│  :11434                 │  │  :8000                      │
│  modèle phi3.5-financial│  │  modèle phi35_financial     │
└─────────────────────────┘  └─────────────────────────────┘
```

---

## 5. Déploiement Ollama (solution retenue)

### 5.1 Prérequis

- [Ollama](https://ollama.com/download) installé (Windows, Linux ou macOS)
- **8 Go RAM minimum** (16 Go recommandé)
- GPU NVIDIA optionnel (accélération CUDA automatique si disponible)
- Connexion internet pour le premier téléchargement du modèle de base

### 5.2 Installation

```powershell
# 1. Vérifier qu'Ollama est installé
ollama --version

# 2. Démarrer le serveur (si non lancé automatiquement)
ollama serve
```

Par défaut, Ollama écoute sur **`http://127.0.0.1:11434`**.

### 5.3 Création du modèle Phi-3.5-Financial

Depuis la racine du dépôt :

```powershell
cd infra/ollama
ollama create phi3.5-financial -f Modelfile
```

Le **Modelfile** (`infra/ollama/Modelfile`) définit :

| Paramètre | Valeur | Rôle |
|-----------|--------|------|
| `FROM phi3.5` | Modèle de base Microsoft Phi-3.5 | Base quantisée automatiquement par Ollama |
| `SYSTEM` | Prompt assistant financier TechCorp | Spécialisation domaine finance |
| `temperature` | `0.2` | Réponses factuelles, faible créativité |
| `top_p` | `0.9` | Nucleus sampling |
| `num_ctx` | `4096` | Fenêtre de contexte (tokens) |
| `stop` | `[INST]` | Token d'arrêt Phi-3 |

### 5.4 Vérification

```powershell
# Santé du serveur
curl http://localhost:11434/api/tags

# Test conversationnel
ollama run phi3.5-financial "Qu'est-ce qu'un ETF ?"
```

Réponse attendue : contenu financier cohérent, en français ou anglais selon la question.

### 5.5 Exposer le serveur au réseau local (équipe DEV WEB)

Par défaut, Ollama n'écoute que sur `127.0.0.1`. Pour un accès depuis d'autres machines du groupe :

**Windows (PowerShell admin) :**
```powershell
$env:OLLAMA_HOST = "0.0.0.0:11434"
ollama serve
```

**Linux/macOS :**
```bash
export OLLAMA_HOST=0.0.0.0:11434
ollama serve
```

Communiquer à l'équipe DEV WEB l'URL : **`http://<IP-machine-infra>:11434`**

> ⚠️ En hackathon, rester sur le réseau local du groupe. Ne pas exposer Ollama sur Internet sans authentification.

---

## 6. Déploiement Triton (alternative / bonus)

### 6.1 Prérequis

- Docker + [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)
- GPU NVIDIA avec **≥ 8 Go VRAM** (Phi-3.5-mini en FP16)
- Première exécution : téléchargement du modèle HuggingFace (~7 Go)

### 6.2 Construction de l'image

```powershell
cd infra/triton
docker build -t techcorp-triton .
```

L'image repose sur `nvcr.io/nvidia/tritonserver:24.08-pyt-python-py3` avec :
- `transformers==4.45.2`
- `accelerate`, `sentencepiece`, `einops`

### 6.3 Lancement

```powershell
docker run --gpus all `
  -p 8000:8000 -p 8001:8001 -p 8002:8002 `
  -v "${PWD}/model_repository:/models" `
  techcorp-triton `
  tritonserver --model-repository=/models --allow-http=true
```

| Port | Protocole | Usage |
|------|-----------|-------|
| **8000** | HTTP REST | Inférence (`/v2/models/phi35_financial/infer`) |
| **8001** | gRPC | Clients gRPC |
| **8002** | HTTP | Métriques Prometheus |

### 6.4 Vérification Triton

```powershell
curl http://localhost:8000/v2/health/ready
```

Modèle configuré dans `config.pbtxt` :
- **Backend :** Python
- **Modèle HF :** `microsoft/Phi-3.5-mini-instruct`
- **Précision :** FP16 (`torch.float16`)
- **Max tokens générés :** 512

---

## 7. Connexion avec l'équipe DEV WEB

### 7.1 Informations à transmettre

| Paramètre | Ollama (défaut) | Triton |
|-----------|-----------------|--------|
| **URL** | `http://localhost:11434` | `http://localhost:8000` |
| **Nom du modèle** | `phi3.5-financial` | `phi35_financial` |
| **Endpoint chat** | `POST /api/chat` | `POST /v2/models/phi35_financial/infer` |
| **Streaming** | ✅ Oui | ❌ Non (réponse JSON complète) |

### 7.2 Configuration côté DEV WEB

Fichier `rendu/devweb/.env` :

```env
# Backend d'inférence : ollama | triton
BACKEND=ollama

# Serveur web (API + frontend buildé)
HOST=0.0.0.0
PORT=8080

# Ollama — valeurs INFRA
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=phi3.5-financial

# Triton — si bascule
TRITON_URL=http://localhost:8000
TRITON_MODEL=phi35_financial
```

Si INFRA et DEV WEB sont sur **des machines différentes**, remplacer `localhost` par l'IP de la machine INFRA :

```env
OLLAMA_URL=http://192.168.1.42:11434
```

### 7.3 Lancement de l'interface

```powershell
cd rendu/devweb
.\run.ps1
```

- Interface utilisateur : **http://localhost:8080**
- API santé : **http://localhost:8080/api/health** (indique si le serveur d'inférence est connecté et si le modèle est chargé)

### 7.4 Critères d'acceptation DEV WEB

| Test | Résultat attendu |
|------|------------------|
| `GET /api/health` | `"connected": true`, `"model_ready": true` |
| Envoi d'un message chat | Réponse streaming (Ollama) ou JSON (Triton) |
| Sidebar statut | Chip **CONNECTÉ** affiché |

---

## 8. Optimisations des performances

### 8.1 Ollama — Quantization

Ollama applique automatiquement une **quantization GGUF** lors du téléchargement de `phi3.5`. Aucune configuration manuelle n'est requise.

| Précision | VRAM approx. | Latence | Qualité |
|-----------|--------------|---------|---------|
| FP16 (non utilisé par défaut) | ~7 Go | Basse | Maximale |
| **Q4_K_M (défaut Ollama)** | **~2,5 Go** | **Moyenne** | **Bonne** |
| Q8_0 | ~4 Go | Moyenne+ | Très bonne |

Pour forcer une variante (GPU puissant) :
```powershell
ollama pull phi3.5:Q8_0
# Puis adapter le Modelfile : FROM phi3.5:Q8_0
```

### 8.2 Ollama — Paramètres d'inférence (Modelfile)

Paramètres retenus pour un assistant **financier factuel** :

```
PARAMETER temperature 0.2    # Faible → moins d'hallucinations
PARAMETER top_p 0.9          # Diversité contrôlée
PARAMETER num_ctx 4096       # Historique conversationnel suffisant
```

**Justification :**
- `temperature 0.2` : domaine finance = précision > créativité
- `num_ctx 4096` : compromis mémoire / contexte multi-tours
- Le backend DEV WEB envoie également `temperature: 0.7` dans les requêtes API — **recommandation :** aligner sur `0.2` côté API pour cohérence

### 8.3 Triton — Optimisations GPU

| Optimisation | Implémentation | Gain |
|--------------|----------------|------|
| **FP16** | `torch_dtype=torch.float16` dans `model.py` | −50 % VRAM vs FP32 |
| **device_map="auto"** | Répartition automatique multi-GPU | Scalabilité |
| **max_output_length=512** | Limite dans `config.pbtxt` | Latence prévisible |

Pistes non implémentées (production) :
- **TensorRT** backend pour latence minimale
- **Dynamic batching** Triton pour requêtes concurrentes
- Chargement du **LoRA** `models/phi3_financial/` via PEFT dans le backend Python

### 8.4 Recommandations matérielles

| Scénario | CPU | RAM | GPU |
|----------|-----|-----|-----|
| Démo hackathon (Ollama Q4) | 4 cœurs | 8 Go | Optionnel |
| Usage confortable | 8 cœurs | 16 Go | GTX 1660+ / RTX série |
| Triton FP16 | 8 cœurs | 16 Go | **RTX 3060 12 Go minimum** |

---

## 9. Procédure de bascule Ollama → Triton

1. Déployer Triton (§ 6) et vérifier `/v2/health/ready`
2. Modifier `rendu/devweb/.env` :
   ```env
   BACKEND=triton
   TRITON_URL=http://localhost:8000
   TRITON_MODEL=phi35_financial
   ```
3. Redémarrer le backend DEV WEB
4. **Attention :** le streaming temps réel est désactivé en mode Triton (réponses en bloc JSON)

---

## 10. Dépannage

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| `connected: false` dans `/api/health` | Ollama non démarré | `ollama serve` |
| `model_ready: false` | Modèle non créé | `ollama create phi3.5-financial -f infra/ollama/Modelfile` |
| Réponses lentes | CPU seul, modèle lourd | Activer GPU ou réduire `num_ctx` |
| Triton `CUDA out of memory` | VRAM insuffisante | Réduire `max_output_length` ou utiliser Ollama Q4 |
| DEV WEB ne joint pas INFRA | `localhost` vs IP réseau | Mettre l'IP INFRA dans `OLLAMA_URL` |
| Erreur CORS | Backend non démarré | Lancer `.\run.ps1` depuis `rendu/devweb` |

---

## 11. Synthèse des livrables INFRA

| Livrable | Emplacement |
|----------|-------------|
| Modelfile Ollama | `infra/ollama/Modelfile` |
| Config Triton + backend Python | `infra/triton/model_repository/` |
| Dockerfile Triton | `infra/triton/Dockerfile` |
| Documentation de déploiement | `rendu/infra/DEPLOIEMENT.md` (ce document) |
| URL / port pour DEV WEB | `http://localhost:11434` — modèle `phi3.5-financial` |

**Choix technique :** Ollama en production pour rapidité, quantization native et streaming. Triton documenté comme alternative GPU pour montée en charge.

**Optimisations appliquées :** quantization Q4 automatique (Ollama), temperature 0.2, contexte 4096 tokens, FP16 sur Triton.

---

*TechCorp Industries — Équipe INFRA HackatonIA*
