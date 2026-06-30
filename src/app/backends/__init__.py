from app.backends.ollama import OllamaBackend
from app.backends.triton import TritonBackend
from app.config import Settings


def get_backend(settings: Settings):
    if settings.backend == "triton":
        return TritonBackend(settings.triton_url, settings.triton_model, settings.request_timeout)
    return OllamaBackend(settings.ollama_url, settings.ollama_model, settings.request_timeout)
