import asyncio
import traceback
from fastapi import Request
from app.main import app
import uvicorn

@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        print("EXCEPTION CAUGHT!")
        traceback.print_exc()
        raise

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
