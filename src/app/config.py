from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # ollama | triton | custom
    backend: str = "ollama"
    host: str = "0.0.0.0"
    port: int = 8080

    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "phi3.5-financial"

    triton_url: str = "http://localhost:8000"
    triton_model: str = "phi35_financial"

    custom_url: str = "http://localhost:5000"
    custom_model: str = "phi3.5-financial"

    request_timeout: float = 120.0


settings = Settings()
