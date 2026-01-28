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

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"
    }


settings = Settings()
