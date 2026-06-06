"""AlphaMind Config - Simplified for dev"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App
    app_name: str = "AlphaMind"
    app_env: str = "development"
    debug: bool = True
    api_prefix: str = "/api/v1"
    cors_origins: list[str] = ["http://localhost:3000"]
    default_market: str = "A"

    # DB
    database_url: str = "sqlite+aiosqlite:///alphamind.db"
    database_pool_size: int = 5

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    jwt_secret_key: str = "dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"

    # OpenAI
    openai_api_key: str = "sk-placeholder"
    openai_model: str = "gpt-4o"
    openai_embedding_model: str = "text-embedding-3-small"

    # Celery
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # External APIs
    yahoo_finance_api_key: str = ""
    alpha_vantage_api_key: str = ""
    newsapi_key: str = ""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "allow"}

settings = Settings()
