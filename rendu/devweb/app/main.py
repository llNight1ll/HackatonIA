from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app.backends import get_backend
from app.config import settings

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(
    title="TechCorp AI Chat",
    description="Interface web pour Phi-3.5-Financial",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1)
    stream: bool = True


@app.get("/")
async def index():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/health")
async def health():
    backend = get_backend(settings)
    status = await backend.health()
    status["app"] = "TechCorp AI Chat"
    status["configured_backend"] = settings.backend
    return status


@app.post("/api/chat")
async def chat(request: ChatRequest):
    backend = get_backend(settings)
    messages = [message.model_dump() for message in request.messages]

    health = await backend.health()
    if not health.get("connected"):
        raise HTTPException(
            status_code=503,
            detail=health.get("error", "Serveur d'inférence indisponible"),
        )

    if request.stream and settings.backend == "ollama":
        async def event_stream():
            stream = await backend.chat(messages, stream=True)
            async for chunk in stream:
                yield chunk

        return StreamingResponse(event_stream(), media_type="text/plain; charset=utf-8")

    response = await backend.chat(messages, stream=False)
    if hasattr(response, "__aiter__"):
        text = ""
        async for chunk in response:
            text += chunk
        return {"message": {"role": "assistant", "content": text}}
    return {"message": {"role": "assistant", "content": response}}


def main():
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=False,
    )


if __name__ == "__main__":
    main()
