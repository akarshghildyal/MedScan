# MedScan Product Requirements Document (PRD)

**Product Name:** MedScan\
**Version:** MVP v1\
**Product Type:** AI‑Powered Medical Report Interpretation and Management Platform

------------------------------------------------------------------------

# 1. Product Overview

MedScan is an AI-powered platform that helps patients understand their
medical reports by converting complex clinical data into simplified
explanations.

Medical reports such as Complete Blood Count (CBC), urine analysis, and
other pathology reports often contain numerical values, reference
ranges, and medical terminology that are difficult for patients to
interpret without medical knowledge.

MedScan allows patients to upload their pathology reports and receive
AI-generated explanations that highlight abnormal values, explain
medical markers, and summarize the overall findings of the report in
clear language.

The system also stores reports historically, enabling patients to track
trends of specific biomarkers over time and ask questions about their
reports through a contextual chatbot.

Hospitals can onboard patients and doctors into the platform, allowing
doctors to view reports shared by patients and access the same
AI-generated summaries and explanations.

The MVP focuses on demonstrating the full workflow of:

Upload report → AI analysis → simplified explanation → trend tracking →
doctor sharing. 
Also the management part from the Doctor and Hospital View.

------------------------------------------------------------------------

# 2. Problem Statement

Medical diagnostic reports are designed for healthcare professionals and
are often difficult for patients to interpret.

Patients frequently encounter the following issues:

-   Medical terminology is difficult to understand.
-   Numerical values and reference ranges are confusing.
-   Patients rely on internet searches that may produce incorrect
    interpretations.
-   Doctors spend significant time explaining basic report details.

There is a need for a system that can translate complex diagnostic
reports into understandable insights for patients while preserving the
accuracy of the medical information.

------------------------------------------------------------------------

# 3. Product Goals (MVP)

The MVP aims to demonstrate the following capabilities:

1.  Upload pathology reports in PDF format.
2.  Extract structured medical values from the report.
3.  Identify abnormal markers using reference ranges.
4.  Generate simplified explanations of the report.
5.  Provide a short summary and a detailed explanation.
6.  Store reports for historical reference.
7.  Allow users to track biomarker trends across reports.
8.  Allow patients to share reports with doctors.
9.  Provide a chatbot that answers questions about uploaded reports.

The system does not provide medical diagnosis and is intended only for
informational purposes.

------------------------------------------------------------------------

# 4. Supported Report Types (MVP)

The system will support only **text-based pathology reports** for the
MVP.

Supported examples include:

-   Complete Blood Count (CBC)
-   Urine Analysis
-   Lipid Profile
-   Liver Function Test (LFT)
-   Kidney Function Test (KFT)
-   Thyroid Profile
-   Other structured pathology reports

All reports must be uploaded as **machine-readable PDF files**.

The system will not support:

-   scanned PDFs
-   image uploads
-   radiology images
-   X-ray or MRI reports

------------------------------------------------------------------------

# 5. User Roles

## Patient

Capabilities:

-   Create account and log in
-   Upload pathology reports
-   View report summaries
-   View detailed explanations
-   View abnormal markers
-   Track trends of medical markers
-   Ask questions using a chatbot
-   Share reports with doctors
-   View previously uploaded reports

## Doctor

Capabilities:

-   Login to the platform
-   View reports shared by patients
-   See summaries
-   Access detailed explanations
-   View abnormal markers
-   View biomarker trend charts

Doctors cannot modify patient reports.

## Hospital Admin

Capabilities:

-   Add patients
-   Add doctors
-   Assign doctors to patients
-   Manage organization users

Admins cannot view reports unless shared.

------------------------------------------------------------------------

# 6. Patient User Journey

1.  Patient logs into MedScan.
2.  Dashboard displays previously uploaded reports and summaries.
3.  Patient uploads a new report (PDF).
4.  Backend processes report through the AI pipeline.
5.  Patient receives summary, abnormal markers, insights, and detailed
    explanation.
6.  Report is stored in history.
7.  Patient can view trends, chat with AI, or share reports with
    doctors.

------------------------------------------------------------------------

# 7. Doctor User Journey

1.  Doctor logs in.
2.  Dashboard displays reports shared by patients.
3.  Doctor opens a report.
4.  Doctor views summary, abnormal markers, explanations, and trend
    charts.

------------------------------------------------------------------------

# 8. Core Features (MVP)

## Authentication

-   Sign up
-   Login
-   Secure password storage
-   Token-based sessions

## Report Upload

-   PDF-only upload
-   Machine-readable text validation

## AI Report Processing

Sequential AI agent workflow processes uploaded reports.

## Report Summary

Short patient-friendly summary stored with report.

## Detailed Explanation

Expanded interpretation explaining markers and abnormalities.

## Abnormal Marker Identification

Markers labeled as:

-   Normal
-   High
-   Low

Calculated using deterministic logic.

## Report History

Users can view previously uploaded reports.

## Trend Charts

Users can track biomarker values across multiple reports.

Example workflow:

User enters marker → system retrieves values → chart displayed.

## Chatbot

Users can ask questions related to their reports.

Chatbot context includes:

-   report summary
-   detailed explanation
-   marker values
-   historical trends

## Report Sharing

Patients can share reports with:

-   doctors within hospital
-   external doctors

------------------------------------------------------------------------

# 9. AI Processing Pipeline

Report processing follows a sequential agent pipeline.

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
Store Results in MongoDB

Each stage performs a specific task and passes structured data forward.

------------------------------------------------------------------------

# 10. Data Storage

Database: **MongoDB**

Each report document stores:

-   patient id
-   report metadata
-   summary
-   detailed explanation
-   extracted markers
-   insights

This structure supports fast dashboard loading and chatbot context
retrieval.

------------------------------------------------------------------------

# 11. Technology Stack

Frontend\
React / Next.js

Backend\
FastAPI

Database\
MongoDB

AI Models\
OpenRouter LLMs

PDF Processing\
pdfplumber or PyMuPDF

Charts\
Recharts

------------------------------------------------------------------------

# 12. Non‑Functional Requirements

**Performance**

-   Report processing: 10--20 seconds
-   Dashboard loading: \<2 seconds

**Security**

-   Encrypted passwords
-   Token authentication
-   Role-based access control

**Privacy**

Reports accessible only to patient and authorized doctors.

**Usability**

Clear UI suitable for non‑technical users.

------------------------------------------------------------------------

# 13. MVP Scope

Included:

-   authentication
-   report upload
-   AI analysis
-   summaries and explanations
-   abnormal marker detection
-   trend charts
-   chatbot
-   report sharing

Excluded:

-   hospital EHR integrations
-   OCR for scanned reports
-   radiology analysis
-   automated diagnosis

------------------------------------------------------------------------

# 14. Success Metrics

The MVP will be considered successful if it demonstrates:

1.  Successful upload and analysis of pathology reports.
2.  Accurate extraction of biomarkers.
3.  Clear summaries and explanations.
4.  Functional biomarker trend charts.
5.  Chatbot answering report-related questions.

------------------------------------------------------------------------

# 15. Future Roadmap

Possible future enhancements:

-   OCR for scanned reports
-   Radiology analysis
-   Hospital LIS integrations
-   Predictive health insights
-   Multilingual explanations
