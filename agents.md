# MedScan AI Agents Specification

Product: MedScan\
Document Type: AI Agent Architecture\
Version: MVP v1

------------------------------------------------------------------------

# 1. Overview

MedScan uses a modular agent-based processing pipeline to analyze
pathology reports and generate understandable medical insights for
patients.

Each agent performs one specific responsibility in the report processing
workflow. This modular design ensures:

-   maintainability
-   improved reliability
-   easier debugging
-   future extensibility

The pipeline processes text-based pathology PDF reports uploaded by
patients.

------------------------------------------------------------------------

# 2. Agent Pipeline

The MedScan AI workflow follows this sequence:

Report Upload\
↓\
PDF Parser Agent\
↓\
Report Type Classifier Agent\
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
Store Results in Database

Each agent receives structured output from the previous stage.

------------------------------------------------------------------------

# 3. PDF Parser Agent

## Purpose

Extract readable text from uploaded pathology report PDFs.

## Input

PDF file path

Example: uploads/report_102.pdf

## Output

Raw extracted text.

Example output:

Test Name \| Result \| Unit \| Reference Range\
WBC \| 11.3 \| x10\^9/L \| 4.0 - 10.0\
Hemoglobin \| 13.2 \| g/dL \| 13 - 17\
Platelets \| 250 \| x10\^9/L \| 150 - 400

## Implementation

Recommended libraries:

-   pdfplumber
-   PyMuPDF

------------------------------------------------------------------------

# 4. Report Type Classifier Agent

## Purpose

Identify the type of pathology report.

Correct report classification helps the system:

-   interpret markers correctly
-   improve extraction accuracy
-   provide context-aware explanations

## Supported Report Types (MVP)

-   CBC (Complete Blood Count)
-   Urine Analysis
-   Lipid Profile
-   Liver Function Test (LFT)
-   Kidney Function Test (KFT)
-   Thyroid Profile
-   General Pathology Report

## Input

Raw extracted report text.

## Output

{ "report_type": "CBC" }

## Prompt Example

You are a medical report classifier.

Based on the following pathology report text, identify the report type.

Possible types include: CBC, Urine Analysis, Lipid Profile, Liver
Function Test, Kidney Function Test, Thyroid Profile, or General
Pathology.

Return only the report type.

------------------------------------------------------------------------

# 5. Medical Data Extraction Agent

## Purpose

Convert raw report text into structured biomarker data.

## Input

Raw report text.

## Output

\[ { "name": "WBC", "value": 11.3, "unit": "x10\^9/L", "reference_min":
4.0, "reference_max": 10.0 }, { "name": "Hemoglobin", "value": 13.2,
"unit": "g/dL", "reference_min": 13, "reference_max": 17 }\]

## Prompt Example

You are a medical data extraction system.

Extract laboratory markers from the following pathology report text.

Return JSON with:

marker_name\
value\
unit\
reference_min\
reference_max

------------------------------------------------------------------------

# 6. Abnormality Detection Agent

## Purpose

Determine whether biomarker values are abnormal.

## Input

Structured marker data.

## Logic

if value \> reference_max → high\
if value \< reference_min → low\
else → normal

## Output

{ "name": "WBC", "value": 11.3, "reference_min": 4, "reference_max": 10,
"status": "high" }

This step does not require an LLM.

------------------------------------------------------------------------

# 7. Insight Generation Agent

## Purpose

Generate short insights about abnormal markers.

## Input

Marker name\
Marker value\
Reference range

## Example Output

Elevated WBC may indicate infection or inflammation.

## Prompt Example

You are a medical assistant.

Provide a short clinical insight explaining why the following marker may
be abnormal.

------------------------------------------------------------------------

# 8. Detailed Explanation Agent

## Purpose

Generate a comprehensive explanation of report results.

Used for:

-   patient report view
-   doctor report view
-   chatbot context

## Example Output

Your report indicates an elevated White Blood Cell (WBC) count of 11.3,
which is slightly above the normal range of 4--10.

WBC levels can increase due to infection, inflammation, stress, or
immune response. This value should be interpreted along with symptoms
and clinical evaluation.

## Prompt Example

You are a medical explanation assistant.

Explain the following lab report results in clear, patient-friendly
language.

Do not provide medical diagnosis.

------------------------------------------------------------------------

# 9. Summary Agent

## Purpose

Generate a concise summary of the report.

Displayed on:

-   dashboard
-   report history list
-   doctor report overview

## Example Output

Your report shows slightly elevated white blood cells which may indicate
infection or inflammation.

## Prompt Example

Summarize the following medical explanation into 1--2 simple sentences
suitable for a patient.

------------------------------------------------------------------------

# 10. Chat Agent

## Purpose

Answer patient questions about their reports.

## Context Provided

-   report summary
-   detailed explanation
-   biomarker values
-   historical trends

## Example Question

Why is my WBC high?

## Prompt Example

You are a medical report assistant helping patients understand lab
reports.

Use the provided report context to answer the user's question clearly
and safely.

Avoid giving medical diagnosis.

------------------------------------------------------------------------

# 11. Agent Orchestration

Agents execute sequentially using a backend pipeline controller.

Execution order:

1.  PDF Parser Agent\
2.  Report Type Classifier Agent\
3.  Medical Data Extraction Agent\
4.  Abnormality Detection Agent\
5.  Insight Generation Agent\
6.  Detailed Explanation Agent\
7.  Summary Agent

Results are stored in MongoDB after processing.

------------------------------------------------------------------------

# 12. Data Transformation Flow

PDF → Raw Text\
Raw Text → Structured Markers\
Markers → Abnormality Status\
Abnormalities → Insights\
Insights → Detailed Explanation\
Detailed Explanation → Summary

------------------------------------------------------------------------

# 13. Future Agent Enhancements

Potential future agents:

-   Marker Normalization Agent
-   Report Quality Validator
-   Trend Analysis Agent
-   Risk Scoring Agent
-   Medical Recommendation Agent

These are outside the MVP scope.
