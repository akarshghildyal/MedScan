import asyncio
from app.db import init_db
from app.models.user import User, UserRole
from app.core.security import get_password_hash

async def create_hospital():
    await init_db()
    email = "admin@hospital.com"
    existing = await User.find_one(User.email == email)
    if existing:
        print(f"Hospital user {email} already exists.")
        return

    user = User(
        email=email,
        hashed_password=get_password_hash("hospital123"),
        role=UserRole.HOSPITAL,
        full_name="Main Hospital Admin"
    )
    await user.create()
    print(f"Hospital user created successfully: {email} / hospital123")

if __name__ == "__main__":
    asyncio.run(create_hospital())
