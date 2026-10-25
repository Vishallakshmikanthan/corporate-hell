"""
Configuration settings for CORPORATE HELL™ backend.
Reads from environment variables and .env file.
"""
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    PROJECT_NAME: str = "CORPORATE HELL™ Backend"
    API_V1_STR: str = "/api"

    # NVIDIA AI Service (server-side only, never leaked to frontend)
    NVIDIA_API_KEY: Optional[str] = None
    NVIDIA_MODEL: str = "z-ai/glm-5.3"
    NVIDIA_BASE_URL: str = "https://integrate.api.nvidia.com/v1"

    AI_REQUEST_TIMEOUT_SECONDS: float = 8.0
    AI_MAX_RETRIES: int = 2
    AI_RATE_LIMIT_PER_MINUTE: int = 20
    AI_CACHE_SIZE: int = 256

    # Database
    DATABASE_URL: str = "sqlite:///./corporate_hell.db"
    AUTO_CREATE_TABLES: bool = True

    model_config = SettingsConfigDict(
        env_file=("../.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
