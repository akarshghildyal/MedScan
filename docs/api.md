# MedScan API Specification

Product: MedScan\
Backend Framework: FastAPI\
API Style: REST\
Authentication: JWT (Bearer Token)

Base URL:

/api/v1

All responses are returned in JSON format.

------------------------------------------------------------------------

# 1. Authentication APIs

## POST /auth/register

Description\
Register a new patient account.

Request Body

{ "name": "John Doe", "email": "john@example.com", "password":
"securepassword" }

Response

{ "message": "User registered successfully", "user_id": "patient_102" }

Validation

-   Email must be unique.
-   Password must meet minimum security requirements.

------------------------------------------------------------------------

## POST /auth/login

Description\
Authenticate user and return JWT token.

Request Body

{ "email": "john@example.com", "password": "securepassword" }

Response

{ "access_token": "jwt_token", "token_type": "bearer", "user_role":
"patient" }

------------------------------------------------------------------------

## GET /auth/me

Description\
Return profile information for the authenticated user.

Headers

Authorization: Bearer `<token>`{=html}

Response

{ "user_id": "patient_102", "name": "John Doe", "email":
"john@example.com", "role": "patient" }

------------------------------------------------------------------------

# 2. Report APIs

## POST /reports/upload

Description\
Upload a pathology report PDF and start the AI processing pipeline.

Headers

Authorization: Bearer `<token>`{=html}

Form Data

file: report.pdf

Response

{ "report_id": "report_201", "status": "processing" }

Processing occurs asynchronously through the agent pipeline.

------------------------------------------------------------------------

## GET /reports

Description\
Return all reports uploaded by the authenticated patient.

Headers

Authorization: Bearer `<token>`{=html}

Response

{ "reports": \[ { "report_id": "report_201", "report_type": "CBC",
"upload_date": "2026-03-06", "summary": "Slightly elevated WBC" } \] }

------------------------------------------------------------------------

## GET /reports/{report_id}

Description\
Return full analysis of a specific report.

Headers

Authorization: Bearer `<token>`{=html}

Response

{ "report_id": "report_201", "report_type": "CBC", "summary": "Slightly
elevated WBC detected.", "detailed_analysis": "Full explanation of
report findings.", "markers": \[ { "name": "WBC", "value": 11.3,
"reference_min": 4, "reference_max": 10, "status": "high" } \],
"insights": \[ "Elevated WBC may indicate infection." \] }

------------------------------------------------------------------------

# 3. Trend Analysis APIs

## GET /trends/{marker_name}

Description\
Retrieve historical biomarker values across patient reports.

Example

GET /trends/WBC

Headers

Authorization: Bearer `<token>`{=html}

Response

{ "marker": "WBC", "data": \[ { "date": "2026-01-02", "value": 7.2 }, {
"date": "2026-02-10", "value": 8.4 }, { "date": "2026-03-06", "value":
11.3 } \] }

------------------------------------------------------------------------

# 4. Chatbot APIs

## POST /chat/query

Description\
Allow patient to ask questions about their reports.

Headers

Authorization: Bearer `<token>`{=html}

Request Body

{ "report_id": "report_201", "question": "Why is my WBC high?" }

Backend Workflow

1.  Retrieve report summary
2.  Retrieve detailed explanation
3.  Retrieve markers
4.  Send context to LLM

Response

{ "answer": "Your WBC is slightly elevated which may indicate
infection." }

------------------------------------------------------------------------

# 5. Doctor APIs

## GET /doctor/reports

Description\
Return reports shared with the authenticated doctor.

Headers

Authorization: Bearer `<token>`{=html}

Response

{ "reports": \[ { "patient_name": "John Doe", "report_id": "report_201",
"report_type": "CBC", "summary": "Elevated WBC" } \] }

------------------------------------------------------------------------

## GET /doctor/report/{report_id}

Description\
Allow doctor to view full report details shared with them.

Headers

Authorization: Bearer `<token>`{=html}

Response

Same structure as GET /reports/{report_id}

------------------------------------------------------------------------

# 6. Report Sharing APIs

## POST /reports/share

Description\
Share a report with a doctor.

Headers

Authorization: Bearer `<token>`{=html}

Request Body

{ "report_id": "report_201", "doctor_id": "doctor_301" }

Response

{ "message": "Report shared successfully" }

------------------------------------------------------------------------

## DELETE /reports/share

Description\
Remove doctor's access to a report.

Headers

Authorization: Bearer `<token>`{=html}

Request Body

{ "report_id": "report_201", "doctor_id": "doctor_301" }

Response

{ "message": "Doctor access removed" }

------------------------------------------------------------------------

# 7. Hospital Admin APIs

## POST /admin/patient

Description\
Create a new patient under the hospital.

Headers

Authorization: Bearer `<token>`{=html}

Request Body

{ "name": "John Doe", "email": "john@email.com" }

Response

{ "message": "Patient created" }

------------------------------------------------------------------------

## POST /admin/doctor

Description\
Add a doctor to the hospital system.

Headers

Authorization: Bearer `<token>`{=html}

Request Body

{ "name": "Dr Sharma", "email": "dr@email.com", "specialization":
"General Physician" }

Response

{ "message": "Doctor added" }

------------------------------------------------------------------------

## POST /admin/assign-doctor

Description\
Assign a doctor to a patient.

Headers

Authorization: Bearer `<token>`{=html}

Request Body

{ "doctor_id": "doctor_301", "patient_id": "patient_102" }

Response

{ "message": "Doctor assigned to patient" }

------------------------------------------------------------------------

# 8. Error Response Format

Example

{ "error": "Invalid request", "message": "Report not found" }

Common HTTP Status Codes

200 -- Success\
400 -- Bad request\
401 -- Unauthorized\
404 -- Resource not found\
500 -- Internal server error
