# MedScan System Architecture Document (SAD)

**Product:** MedScan\
**Version:** MVP v1\
**Architecture Type:** Modular AI-enabled Web Platform

------------------------------------------------------------------------

# 1. System Overview

MedScan is an AI-powered platform that analyzes medical pathology
reports and generates simplified explanations for patients while
enabling doctors to view shared reports and insights.

The system processes **text-based pathology reports (PDF)** and extracts
structured clinical data such as biomarker values and reference ranges.
This data is analyzed to identify abnormalities, generate explanations,
and create summaries for easy interpretation.

The architecture follows a **modular service-based design with an AI
agent pipeline** responsible for processing uploaded reports.

The system also supports:

-   Historical report storage
-   Biomarker trend analysis
-   Contextual chatbot interactions
-   Controlled report sharing with doctors

------------------------------------------------------------------------

# 2. High-Level Architecture

System architecture layers:

Client Layer\
↓\
API Layer\
↓\
Application Services Layer\
↓\
AI Agent Processing Pipeline\
↓\
Data Storage Layer\
↓\
External AI Services

------------------------------------------------------------------------

# 3. Core System Components

The MedScan system consists of five major components:

1.  Frontend Interface
2.  Backend API
3.  Application Services
4.  AI Agent Processing Pipeline
5.  Data Storage Layer
6.  External AI Services

------------------------------------------------------------------------

# 4. Frontend Architecture

## Technology

-   React / Next.js
-   Recharts (trend visualization)
-   Secure authentication handling

## Responsibilities

-   Patient dashboard
-   Doctor portal
-   Report upload interface
-   Report analysis viewer
-   Biomarker trend charts
-   Chat assistant interface
-   Doctor sharing interface

The frontend communicates with the backend using REST APIs.

------------------------------------------------------------------------

# 5. Backend API Layer

## Technology

FastAPI

## Responsibilities

-   API routing
-   request validation
-   authentication verification
-   service invocation
-   response formatting

## Example Endpoints

Authentication

POST /auth/login\
POST /auth/register

Reports

POST /reports/upload\
GET /reports\
GET /reports/{report_id}

Trends

GET /trends/{marker_name}

Chatbot

POST /chat/query

Sharing

POST /reports/share

Doctor Access

GET /doctor/reports

------------------------------------------------------------------------

# 6. Application Services Layer

This layer contains the core business logic.

### Report Processing Service

Responsible for:

-   storing uploaded reports
-   triggering the AI agent pipeline
-   saving analysis results

### Trend Analysis Service

Responsible for:

-   retrieving biomarker values across reports
-   generating datasets for trend charts

### Chat Context Service

Responsible for:

-   assembling report context
-   preparing prompts for the chatbot

### Sharing Service

Responsible for:

-   report access control
-   doctor sharing permissions

### Authentication Service

Responsible for:

-   login verification
-   password hashing
-   JWT token generation

------------------------------------------------------------------------

# 7. AI Agent Processing Pipeline

Uploaded reports are processed using a sequential agent workflow.

Pipeline:

Upload\
↓\
PDF Parser Agent\
↓\
Medical Data Extraction Agent\
↓\
Abnormality Detection Agent\
↓\
Insight Generation Agent\
↓\
Detailed Explanation Agent\
↓\
Summary Agent\
↓\
Store Results

Each agent performs a single specialized task.

------------------------------------------------------------------------

# 8. AI Agent Specifications

## PDF Parser Agent

Purpose:

Extract readable text from uploaded PDF reports.

Technology:

pdfplumber or PyMuPDF

Output:

Raw report text.

------------------------------------------------------------------------

## Medical Data Extraction Agent

Purpose:

Convert raw report text into structured clinical data.

Example Output:

-   marker name
-   value
-   reference range

Uses LLM interpretation to handle report format variations.

------------------------------------------------------------------------

## Abnormality Detection Agent

Purpose:

Identify abnormal markers using deterministic logic.

Rules:

value \> reference_max → high\
value \< reference_min → low\
otherwise → normal

------------------------------------------------------------------------

## Insight Generation Agent

Purpose:

Generate contextual insights about abnormal markers.

Example:

"Elevated WBC may indicate infection or inflammation."

Uses controlled LLM prompts.

------------------------------------------------------------------------

## Detailed Explanation Agent

Purpose:

Generate detailed interpretation of report findings.

Includes:

-   marker descriptions
-   clinical interpretation
-   contextual explanations

------------------------------------------------------------------------

## Summary Agent

Purpose:

Generate short patient-friendly summary.

Input:

Detailed explanation.

Output:

Concise report overview.

------------------------------------------------------------------------

# 9. Data Storage Architecture

Database: **MongoDB**

Document-based schema supports flexible report storage.

------------------------------------------------------------------------

## Patients Collection

Fields:

-   \_id
-   name
-   email
-   password_hash
-   hospital_id
-   created_at

------------------------------------------------------------------------

## Reports Collection

Fields:

-   \_id
-   patient_id
-   file_url
-   report_type
-   upload_date
-   summary
-   detailed_analysis
-   markers
-   insights

Markers example:

name\
value\
reference_min\
reference_max\
status

------------------------------------------------------------------------

## Doctors Collection

Fields:

-   \_id
-   name
-   email
-   hospital_id

------------------------------------------------------------------------

## Report Shares Collection

Fields:

-   \_id
-   report_id
-   patient_id
-   doctor_id
-   shared_at

------------------------------------------------------------------------

## Chat History Collection

Fields:

-   \_id
-   patient_id
-   report_id
-   question
-   answer
-   timestamp

------------------------------------------------------------------------

# 10. Trend Analysis Architecture

Trend analysis retrieves biomarker values across historical reports.

Workflow:

User inputs marker name\
↓\
Query reports collection\
↓\
Extract marker values\
↓\
Sort by report date\
↓\
Return dataset

Example output:

Jan → 7.2\
Feb → 8.4\
Mar → 11.3

------------------------------------------------------------------------

# 11. Chatbot Architecture

The chatbot answers questions using report-derived context.

Context provided to LLM:

-   report summary
-   detailed explanation
-   marker values
-   trend data

The chatbot does **not access raw PDFs**.

This reduces token usage and improves response reliability.

------------------------------------------------------------------------

# 12. Authentication Architecture

Authentication uses **JWT tokens**.

Workflow:

User login\
↓\
Verify credentials\
↓\
Generate JWT token\
↓\
Return token to client

Protected routes require token validation.

------------------------------------------------------------------------

# 13. Security Architecture

Security principles include:

-   role-based access control
-   encrypted password storage
-   controlled report sharing
-   authenticated API requests

Patients remain owners of their data.

Doctors can only view reports shared with them.

------------------------------------------------------------------------

# 14. Performance Targets

Report Processing: 10--20 seconds\
Dashboard Load: \<2 seconds\
Chatbot Response: \<5 seconds

------------------------------------------------------------------------

# 15. Deployment Architecture

Frontend

Hosted on Vercel or similar platform.

Backend

FastAPI server deployed on cloud VM.

Database

MongoDB Atlas.

AI Services

OpenRouter LLM APIs.

------------------------------------------------------------------------

# 16. Technology Stack

Frontend\
React / Next.js

Backend\
FastAPI

Database\
MongoDB

AI Models\
OpenRouter LLM APIs

PDF Parsing\
pdfplumber / PyMuPDF

Charts\
Recharts

------------------------------------------------------------------------

# 17. Logging and Monitoring

System logs should capture:

-   report processing events
-   API errors
-   authentication attempts
-   agent pipeline failures

Logs assist debugging and system monitoring.

------------------------------------------------------------------------

# 18. Future Architecture Enhancements

Potential future improvements:

-   OCR support for scanned reports
-   Radiology image analysis
-   Hospital EHR/LIS integration
-   Predictive health insights
-   Multi-language report explanations
