import asyncio
from app.db import init_db
from app.models.user import User, UserOut
from app.core.security import verify_password, create_access_token
from datetime import timedelta

async def test_auth_impl():
    await init_db()
    email = "test@example.com" # Assuming a default patient email, change if needed
    password = "password123"
    print("Finding user...")
    user = await User.find_one(User.email == email)
    if not user:
        print("User not found")
        return
    print(f"User found: {user.id}")
    print("Verifying password...")
    try:
        ok = verify_password(password, user.hashed_password)
        print(f"Password ok: {ok}")
    except Exception as e:
        print(f"Verify crash: {e}")
        import traceback
        traceback.print_exc()

    print("Checking active...")
    if not user.is_active:
        print("Not active")

    print("Creating token...")
    try:
        token = create_access_token(
            str(user.id),
            expires_delta=timedelta(minutes=30)
        )
        print(f"Token ok: {len(token)}")
    except Exception as e:
        print(f"Token crash: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_auth_impl())
