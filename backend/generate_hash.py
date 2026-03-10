from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

try:
    hash_str = pwd_context.hash("Demo@1234")
    print("SUCCESS_HASH:")
    print(hash_str)
except Exception as e:
    print("ERROR:")
    print(e)
