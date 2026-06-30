from abc import ABC, abstractmethod
from typing import AsyncIterator


class InferenceBackend(ABC):
    @abstractmethod
    async def health(self) -> dict:
        pass

    @abstractmethod
    async def chat(self, messages: list[dict], stream: bool = True) -> AsyncIterator[str] | str:
        pass
