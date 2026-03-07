# MedScan — Single Source of Truth (CONTEXT.md)

**Product:** MedScan — AI-Powered Medical Report Interpreter
**Version:** MVP v1
**Stack:** FastAPI · MongoDB (Beanie ODM) · OpenRouter LLMs · pdfplumber · React (Vite)

---

## Mission

Upload a PDF pathology report → run a 7-agent AI pipeline → return structured JSON with extracted markers, abnormality flags, insights, detailed explanation, and a patient-friendly summary. Store everything in MongoDB for trend tracking and chatbot context.

---

## Architecture Layers

```
Client (React Dev Dashboard) → API (FastAPI /api/v1) → Services → Agent Pipeline → MongoDB + OpenRouter
```

## Agent Pipeline (Sequential)

| # | Agent | Tech | Input | Output |
|---|-------|------|-------|--------|
| 1 | PDF Parser | pdfplumber | PDF file path | Raw text |
| 2 | Report Type Classifier | OpenRouter LLM | Raw text | `{ report_type }` |
| 3 | Medical Data Extraction | OpenRouter LLM | Raw text + report_type | `[{ name, value, unit, reference_min, reference_max }]` |
| 4 | Abnormality Detection | **Deterministic** | Markers array | Markers + `status` (high/low/normal) |
| 5 | Insight Generation | OpenRouter LLM | Flagged markers | `["insight string", ...]` |
| 6 | Detailed Explanation | OpenRouter LLM | All markers + insights | Detailed text |
| 7 | Summary | OpenRouter LLM | Detailed explanation | 1–2 sentence summary |

## Data Model (MongoDB Collections)

**Users:** `_id, email, hashed_password, role (patient|doctor|hospital), full_name, created_at`
**Reports:** `_id, patient_id, file_url, report_type, upload_date, summary, detailed_analysis, markers[], insights[]`
**Report Shares:** `_id, report_id, patient_id, doctor_id, shared_at`
**Chat History:** `_id, patient_id, report_id, question, answer, timestamp`

### Marker Schema
```json
{ "name": "WBC", "value": 11.3, "unit": "x10^9/L", "reference_min": 4.0, "reference_max": 10.0, "status": "high" }
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register patient |
| POST | `/auth/login` | Login → JWT |
| GET | `/auth/me` | Current user profile |
| POST | `/reports/upload` | Upload PDF → trigger pipeline |
| GET | `/reports` | List user's reports |
| GET | `/reports/{id}` | Full report with markers, insights, summary |
| GET | `/trends/{marker_name}` | Biomarker trend data |
| POST | `/chat/query` | Chatbot Q&A with report context |
| POST | `/reports/share` | Share report with doctor |
| GET | `/doctor/reports` | Reports shared with doctor |

## Key Design Decisions

1. **pdfplumber** for PDF parsing (not PyMuPDF) — better table extraction.
2. **Deterministic abnormality detection** — no LLM needed, just `value > max → high`.
3. **OpenRouter** as the single LLM gateway.
4. **Beanie ODM** for MongoDB async operations.
5. **JWT Bearer tokens** for auth.
6. **Background processing** — upload returns immediately, pipeline runs async.

## Source Documents

- [medscan_prd.md](../medscan_prd.md) — Product requirements
- [medscan_sad.md](../medscan_sad.md) — System architecture
- [api.md](../api.md) — API specification
- [agents.md](../agents.md) — Agent pipeline spec
