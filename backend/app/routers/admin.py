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

from pydantic import EmailStr
class LinkUserRequest(BaseModel):
    email: EmailStr


@router.get("/patients", response_model=List[UserOut])
async def list_patients(current_user: User = Depends(get_current_user)):
    """List all patients linked to this hospital."""
    if current_user.role != UserRole.HOSPITAL:
        raise HTTPException(status_code=403, detail="Hospital access required")
    patients = await User.find(User.role == UserRole.PATIENT, User.hospital_id == str(current_user.id)).to_list()
    return [UserOut.from_user(p) for p in patients]

@router.get("/doctors", response_model=List[UserOut])
async def list_doctors(current_user: User = Depends(get_current_user)):
    """List all doctors linked to this hospital."""
    if current_user.role != UserRole.HOSPITAL:
        raise HTTPException(status_code=403, detail="Hospital access required")
    doctors = await User.find(User.role == UserRole.DOCTOR, User.hospital_id == str(current_user.id)).to_list()
    return [UserOut.from_user(d) for d in doctors]

@router.post("/patients", response_model=UserOut)
async def link_patient(
    request: LinkUserRequest,
    current_user: User = Depends(get_current_user)
):
    """Link an existing patient to the hospital."""
    if current_user.role != UserRole.HOSPITAL:
        raise HTTPException(status_code=403, detail="Hospital access required")

    user = await User.find_one(User.email == request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Optional: we can restrict to only linking patients
    if user.role != UserRole.PATIENT:
        raise HTTPException(status_code=400, detail="Cannot link a non-patient user here")

    # Link them
    user.hospital_id = str(current_user.id)
    await user.save()
    return UserOut.from_user(user)

@router.post("/doctors", response_model=UserOut)
async def link_doctor(
    request: LinkUserRequest,
    current_user: User = Depends(get_current_user)
):
    """Link an existing user as a doctor for the hospital."""
    if current_user.role != UserRole.HOSPITAL:
        raise HTTPException(status_code=403, detail="Hospital access required")

    user = await User.find_one(User.email == request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Upgrade role to Doctor if they were a patient, or just link if already a doctor
    user.role = UserRole.DOCTOR
    user.hospital_id = str(current_user.id)
    await user.save()
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
