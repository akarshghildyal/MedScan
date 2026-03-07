import asyncio
from app.db import init_db
from app.models.user import UserCreate, UserRole, User
from app.routers.auth import register

async def test_register_impl():
    await init_db()
    
    # Clean up first if exists
    existing = await User.find_one(User.email == "testakarsh@gmail.com")
    if existing:
        await existing.delete()

    req = UserCreate(
        dob="2005-03-02",
        email="testakarsh@gmail.com",
        full_name="Akarsh Testing Account",
        password="123456",
        role=UserRole.PATIENT,
        sex="male"
    )
    
    try:
        res = await register(req)
        print("Success!", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_register_impl())
