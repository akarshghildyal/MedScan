from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db import init_db
from app.routers import auth, reports, chat, trends, sharing, doctor, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Auth
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])

# Report Sharing (nested under /reports)
app.include_router(sharing.router, prefix=f"{settings.API_V1_STR}/reports", tags=["sharing"])

# Reports
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["reports"])

# Trends
app.include_router(trends.router, prefix=f"{settings.API_V1_STR}/trends", tags=["trends"])

# Chat
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])

# Doctor
app.include_router(doctor.router, prefix=f"{settings.API_V1_STR}/doctor", tags=["doctor"])

# Admin
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])


@app.get("/")
async def root():
    return {"message": "Welcome to MedScan API", "docs": "/docs"}

@app.get(f"{settings.API_V1_STR}/health")
async def health_check():
    return {"status": "ok"}
