import bcrypt
hashed = bcrypt.hashpw(b"Demo@1234", bcrypt.gensalt())
print(hashed.decode("utf-8"))
