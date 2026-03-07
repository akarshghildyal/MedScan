from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.user import User
from app.models.report import Report
from app.models.chat import ChatHistory
from app.models.share import ReportShare
from app.models.assignment import Assignment
import certifi

async def init_db():
    """Initialize MongoDB connection and register Beanie document models."""
    client = AsyncIOMotorClient(
        settings.MONGODB_URL,
        serverSelectionTimeoutMS=30000,
        tlsCAFile=certifi.where()
    )
    await init_beanie(
        database=client[settings.MONGODB_DB_NAME],
        document_models=[User, Report, ChatHistory, ReportShare, Assignment]
    )
