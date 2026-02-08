from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "MedScan API"
    API_V1_STR: str = "/api/v1"

    # MongoDB Atlas - UPDATE THIS WITH YOUR CONNECTION STRING
    MONGODB_URL: str = "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/medscan?retryWrites=true&w=majority"
    MONGODB_DB_NAME: str = "medscan"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # OpenRouter LLM Configuration
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    
    # Model configurations per agent (using free models)
    LLM_MODEL_VISION: str = "google/gemini-2.0-flash-exp:free"  # For Document Analyzer
    LLM_MODEL_REASONING: str = "google/gemini-2.0-flash-exp:free"  # For In-Depth Analyzer
    LLM_MODEL_FAST: str = "meta-llama/llama-3.1-8b-instruct:free"  # For Screener, Summary, etc.

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"
    }


settings = Settings()
