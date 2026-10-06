from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Agentic Customer Support Orchestrator"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = "sqlite:///./support.db"
    
    # AI Settings
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o"
    
    # If DEMO_MODE is true, it overrides the need for API key by providing mocked AI responses.
    DEMO_MODE: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()

# Check demo mode status based on API key presence
if not settings.OPENAI_API_KEY:
    settings.DEMO_MODE = True
