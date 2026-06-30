import json
from typing import AsyncIterator

import httpx

from app.backends.base import InferenceBackend


class OllamaBackend(InferenceBackend):
    def __init__(self, base_url: str, model: str, timeout: float):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    async def health(self) -> dict:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                models = [m.get("name", "") for m in response.json().get("models", [])]
                model_ready = any(
                    self.model in name or name.startswith(self.model)
                    for name in models
                )
                return {
                    "connected": True,
                    "backend": "ollama",
                    "url": self.base_url,
                    "model": self.model,
                    "model_ready": model_ready,
                    "available_models": models,
                }
        except Exception as exc:
            return {
                "connected": False,
                "backend": "ollama",
                "url": self.base_url,
                "model": self.model,
                "error": str(exc),
            }

    async def chat(self, messages: list[dict], stream: bool = True) -> AsyncIterator[str] | str:
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": stream,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
            },
        }

        if stream:
            return self._stream_chat(payload)
        return await self._complete_chat(payload)

    async def _stream_chat(self, payload: dict) -> AsyncIterator[str]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/api/chat",
                json=payload,
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    chunk = json.loads(line)
                    if chunk.get("done"):
                        break
                    content = chunk.get("message", {}).get("content", "")
                    if content:
                        yield content

    async def _complete_chat(self, payload: dict) -> str:
        payload = {**payload, "stream": False}
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(f"{self.base_url}/api/chat", json=payload)
            response.raise_for_status()
            return response.json().get("message", {}).get("content", "")
