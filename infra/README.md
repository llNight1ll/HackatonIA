# Infrastructure — serveurs d'inférence

Configuration centralisée pour le déploiement du modèle **Phi-3.5-Financial**.

Documentation complète : **[../rendu/infra/DEPLOIEMENT.md](../rendu/infra/DEPLOIEMENT.md)**

## Ollama (recommandé)

```powershell
cd infra/ollama
ollama create phi3.5-financial -f Modelfile
ollama run phi3.5-financial
```

Serveur : **`http://localhost:11434`**

## Triton (alternative GPU)

```powershell
cd infra/triton
docker build -t techcorp-triton .
docker run --gpus all -p 8000:8000 -p 8001:8001 -p 8002:8002 `
  -v "${PWD}/model_repository:/models" techcorp-triton `
  tritonserver --model-repository=/models --allow-http=true
```

Serveur : **`http://localhost:8000`** — modèle `phi35_financial`

## Configuration DEV WEB

```env
BACKEND=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=phi3.5-financial
```
