import asyncio
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from app.core.security import get_password_hash

# Use default local Mongo URI
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "medscan"  # standard local db name for MedScan

async def seed_demo_users():
    print("Connecting to database...")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    users_coll = db.users
    
    users_to_seed = [
        {
            "full_name": "Akarsh Mehta",
            "email": "akarsh@medscan.demo",
            "password": "Demo@1234",
            "role": "patient",
            "dob": "1992-03-14",
            "sex": "Male",
            "hospital_id": "MEDCORE-001"
        },
        {
            "full_name": "Priya Sharma",
            "email": "priya@medscan.demo",
            "password": "Demo@1234",
            "role": "patient",
            "dob": "1988-11-02",
            "sex": "Female",
            "hospital_id": "MEDCORE-001"
        },
        {
            "full_name": "David Lim",
            "email": "david@medscan.demo",
            "password": "Demo@1234",
            "role": "patient",
            "dob": "1995-07-22",
            "sex": "Male",
            "hospital_id": "MEDCORE-001"
        },
        {
            "full_name": "Dr. Sarah Collins",
            "email": "collins@medscan.demo",
            "password": "Demo@1234",
            "role": "doctor",
            "specialization": "Internal Medicine",
            "hospital_id": "MEDCORE-001"
        },
        {
            "full_name": "Dr. Raj Patel",
            "email": "patel@medscan.demo",
            "password": "Demo@1234",
            "role": "doctor",
            "specialization": "Cardiology",
            "hospital_id": "MEDCORE-001"
        },
        {
            "full_name": "MedCore Admin",
            "email": "admin@medscan.demo",
            "password": "Demo@1234",
            "role": "admin",
            "hospital_id": "MEDCORE-001"
        },
        {
            "full_name": "Dev User",
            "email": "dev@medscan.demo",
            "password": "Demo@1234",
            "role": "dev",
            "hospital_id": "MEDCORE-001"
        }
    ]
    
    for u in users_to_seed:
        u.pop("password")
        u["hashed_password"] = "$2b$12$O1LWcfKwkgjbgTEv6qMwgC0gFqv2SFgvrxpitDqaFJI7Sw"
        u["is_active"] = True
        u["_demo"] = True
        u["created_at"] = datetime.utcnow()
        
        # Upsert user based on email
        await users_coll.update_one(
            {"email": u["email"]},
            {"$set": u},
            upsert=True
        )
        print(f"Upserted {u['email']} (role: {u['role']})")
        
    print("\nAll demo users seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_demo_users())
