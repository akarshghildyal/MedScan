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
from app.models.assignment import Assignment
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

@router.get("/assignments")
async def list_assignments(current_user: User = Depends(get_current_user)):
    """List all doctor-patient assignments for this hospital."""
    if current_user.role != UserRole.HOSPITAL:
        raise HTTPException(status_code=403, detail="Hospital access required")
    
    assignments = await Assignment.find(
        Assignment.hospital_id == str(current_user.id)
    ).to_list()
    
    result = []
    for a in assignments:
        try:
            patient = await User.get(PydanticObjectId(a.patient_id))
            doctor = await User.get(PydanticObjectId(a.doctor_id))
            result.append({
                "id": str(a.id),
                "patient_id": a.patient_id,
                "patient_name": patient.full_name or patient.email if patient else "Unknown",
                "doctor_id": a.doctor_id,
                "doctor_name": doctor.full_name or doctor.email if doctor else "Unknown",
                "assigned_at": a.assigned_at.isoformat()
            })
        except Exception:
            continue
    return result

@router.post("/assign")
async def assign_doctor_to_patient(
    assignment: AssignRequest,
    current_user: User = Depends(get_current_user)
):
    """Assign a doctor to a patient."""
    if current_user.role != UserRole.HOSPITAL:
        raise HTTPException(status_code=403, detail="Hospital access required")

    try:
        patient = await User.get(PydanticObjectId(assignment.patient_id))
        doctor = await User.get(PydanticObjectId(assignment.doctor_id))
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    if not patient or patient.role != UserRole.PATIENT:
        raise HTTPException(status_code=404, detail="Patient not found or invalid role")
    if not doctor or doctor.role != UserRole.DOCTOR:
        raise HTTPException(status_code=404, detail="Doctor not found or invalid role")

    # Check if assignment already exists
    existing = await Assignment.find_one(
        Assignment.patient_id == assignment.patient_id,
        Assignment.doctor_id == assignment.doctor_id
    )
    if existing:
        raise HTTPException(status_code=400, detail="Assignment already exists")

    # Create assignment
    new_assignment = Assignment(
        patient_id=assignment.patient_id,
        doctor_id=assignment.doctor_id,
        hospital_id=str(current_user.id)
    )
    await new_assignment.create()

    return {"message": f"Doctor {doctor.full_name or doctor.email} assigned to patient {patient.full_name or patient.email}"}

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
