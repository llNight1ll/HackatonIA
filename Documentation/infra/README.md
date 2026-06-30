# Infrastructure — serveurs d'inférence

Documentation complète : **[DEPLOIEMENT.md](./DEPLOIEMENT.md)**

## Démarrage rapide (Ollama)

```powershell
cd ../../infra/ollama
ollama create phi3.5-financial -f Modelfile
ollama serve
```

**URL pour DEV WEB :** `http://localhost:11434` — modèle `phi3.5-financial`

## Fichiers de configuration

| Fichier | Description |
|---------|-------------|
| `../../infra/ollama/Modelfile` | Modèle Ollama Phi-3.5-Financial |
| `../../infra/triton/Dockerfile` | Image Triton Inference Server |
| `../../infra/triton/model_repository/` | Backend Python HuggingFace |
