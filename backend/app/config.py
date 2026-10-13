from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = ROOT_DIR / ".env"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(str(ENV_PATH), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Database Configuration
    SUPABASE_DB_HOST: str = Field(default="aws-0-ap-northeast-2.pooler.supabase.com")
    SUPABASE_DB_PORT: int = Field(default=5432)
    SUPABASE_DB_NAME: str = Field(default="postgres")
    SUPABASE_DB_USER: str = Field(default="retail_readonly.ihcdxzkykufclqxmcewr")
    SUPABASE_DB_PASSWORD: str = Field(default="")
    SUPABASE_DB_SSLMODE: str = Field(default="require")

    # LLM Configuration
    OPENAI_API_KEY: str = Field(default="")
    OPENAI_BASE_URL: str = Field(default="https://api.groq.com/openai/v1")
    OPENAI_MODEL: str = Field(default="openai/gpt-oss-120b")

    # Guardrails
    MAX_ROWS_LIMIT: int = Field(default=100)
    QUERY_TIMEOUT_SECONDS: int = Field(default=10)

settings = Settings()
