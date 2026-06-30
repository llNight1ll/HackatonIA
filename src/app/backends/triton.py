import json
from typing import AsyncIterator

import httpx

from app.backends.base import InferenceBackend


class TritonBackend(InferenceBackend):
    def __init__(self, base_url: str, model: str, timeout: float):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    def _format_prompt(self, messages: list[dict]) -> str:
        parts: list[str] = []
        for message in messages:
            role = message.get("role", "user")
            content = message.get("content", "")
            if role == "system":
                parts.append(f"System: {content}")
            elif role == "assistant":
                parts.append(f"Assistant: {content}")
            else:
                parts.append(f"User: {content}")
        parts.append("Assistant:")
        return "\n".join(parts)

    async def health(self) -> dict:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/v2/health/ready")
                response.raise_for_status()
                return {
                    "connected": True,
                    "backend": "triton",
                    "url": self.base_url,
                    "model": self.model,
                    "model_ready": True,
                }
        except Exception as exc:
            return {
                "connected": False,
                "backend": "triton",
                "url": self.base_url,
                "model": self.model,
                "error": str(exc),
            }

    async def chat(self, messages: list[dict], stream: bool = False) -> AsyncIterator[str] | str:
        prompt = self._format_prompt(messages)
        payload = {
            "inputs": [
                {
                    "name": "text_input",
                    "shape": [1],
                    "datatype": "BYTES",
                    "data": [prompt],
                }
            ]
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/v2/models/{self.model}/infer",
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            outputs = data.get("outputs", [])
            text = ""
            if outputs:
                text = outputs[0].get("data", [""])[0]
                if isinstance(text, str) and text.startswith(prompt):
                    text = text[len(prompt) :].strip()
            return text
