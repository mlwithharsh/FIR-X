from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "FIR.ai V2"
    app_env: str = "development"
    database_url: str = "sqlite:///./generated/firai.db"
    openai_api_key: str | None = None
    openai_model: str = "gpt-4.1-mini"
    cors_origins: str | list[str] = ["http://localhost:3000"]
    generated_dir: str = "generated"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @property
    def base_dir(self) -> Path:
        return Path(__file__).resolve().parents[1]

    @property
    def template_dir(self) -> Path:
        return self.base_dir / "app" / "templates"

    @property
    def generated_path(self) -> Path:
        return self.base_dir / self.generated_dir


@lru_cache
def get_settings() -> Settings:
    return Settings()
