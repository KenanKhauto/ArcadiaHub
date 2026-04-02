"""Application configuration."""

from pydantic import BaseModel


class Settings(BaseModel):
    """Application settings."""

    app_name: str = "Simple Games Platform"
    debug: bool = True


settings = Settings()