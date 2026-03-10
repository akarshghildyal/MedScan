# MedScan — Demo Branch

This branch contains a fully self-contained demo mode for MedScan.
All demo data is served from the frontend — no real reports, pipeline
runs, or database records are required beyond the demo user accounts.

## How It Works
When a demo account email is detected after login, the frontend serves
synthetic hardcoded data directly from `frontend/src/data/demoData.ts`.
All existing API logic for real users is completely unaffected.

## Demo Credentials
All accounts use password: `Demo@1234`

| Role | Email | Purpose |
|---|---|---|
| Patient | akarsh@medscan.demo | Power user — 6 reports, critical markers, trend data, chat history |
| Patient | priya@medscan.demo | Anemia presentation — LOW markers, PROCESSING state |
| Patient | david@medscan.demo | Edge case — FAILED report, retry flow, clean CBC |
| Doctor | collins@medscan.demo | Full clinical queue — reviewed and pending reports |
| Doctor | patel@medscan.demo | Pending-only queue — unreviewed reports |
| Admin | admin@medscan.demo | User management — patients, doctors, assignments |
| Dev | dev@medscan.demo | Pipeline inspection — JSON debug view |

## Setup
1. `git checkout demo`
2. `cd scripts/seed && python seed_demo_users.py` — creates the 7 demo user accounts
3. Start backend: `uvicorn app.main:app --reload`
4. Start frontend: `cd frontend && npm run dev`
5. Navigate to `/login` and use any credential above

## Resetting Demo Data
Demo data is frontend-only and stateless. Simply refresh the browser
to reset all local state to the original demo values.
No database cleanup is required.

## Branch Policy
- This branch is for demonstration purposes only
- Do not merge into `dev` or `main`
- All demo-specific code is gated on `isDemoUser()` and is inert for real users
