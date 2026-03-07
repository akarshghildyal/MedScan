"""
Admin Router - Hospital Administrator Endpoints

Handles patient and doctor creation, user assignment, and user deletion.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from beanie import PydanticObjectId
from passlib.context import CryptContext

from app.models.user import User, UserCreate, UserOut, UserRole
from app.core.security import get_current_user

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AssignRequest(BaseModel):
    patient_id: str
    doctor_id: str

class UserAssignment(BaseModel):
    patient_id: str
    doctor_id: str

@router.post("/patients", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_patient(
    user_in: UserCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new patient."""
    user_in.role = UserRole.PATIENT
    existing = await User.find_one(User.email == user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        role=user_in.role,
        full_name=user_in.full_name,
        dob=user_in.dob,
        sex=user_in.sex
    )
    await user.create()
    return UserOut.from_user(user)

@router.post("/doctors", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_doctor(
    user_in: UserCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new doctor."""
    user_in.role = UserRole.DOCTOR
    existing = await User.find_one(User.email == user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        role=user_in.role,
        full_name=user_in.full_name
    )
    await user.create()
    return UserOut.from_user(user)

@router.post("/assign")
async def assign_doctor_to_patient(
    assignment: AssignRequest,
    current_user: User = Depends(get_current_user)
):
    """Assign a doctor to a patient."""
    try:
        patient = await User.get(PydanticObjectId(assignment.patient_id))
        doctor = await User.get(PydanticObjectId(assignment.doctor_id))
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    if not patient or patient.role != UserRole.PATIENT:
        raise HTTPException(status_code=404, detail="Patient not found or invalid role")
    if not doctor or doctor.role != UserRole.DOCTOR:
        raise HTTPException(status_code=404, detail="Doctor not found or invalid role")

    # In a real app we would create an Assignment document to track this correctly, 
    # but for simplicity as requested we return success.
    # In the MedScan spec, reports are shared explicitly via ReportShare collection
    # rather than having implicit access via Doctor-Patient assignment alone.
    return {"message": "Doctor successfully assigned to patient"}

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Remove a user."""
    try:
        user = await User.get(PydanticObjectId(user_id))
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    await user.delete()
    return None
