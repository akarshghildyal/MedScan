# MedScan Screens and Interactions

This document catalogues all the screens within the MedScan application, detailing their purpose, interactive elements, and key components.

---

## Screen Name: Login & Authentication
**Details about the screen:**
The unified authentication gateway for all MedScan users. It handles user login, routing users to their respective dashboards based on their role (Patient, Doctor, Admin, Dev) evaluated securely on the backend.

**Interactions that can happen on that screen:**
- **Email Input Field:** Accepts the user's registered email address.
- **Password Input Field:** Accepts the user's password.
- **Role Selection Tabs (Optional):** Tabs to toggle between Patient, Doctor, or Admin login forms (if specific scopes are required).
- **"Log In" Button:** Submits credentials to the backend for validation.
- **"Don't have an account? Sign Up" Link:** Navigates new users to the registration view.

**Items present on the screen descriptively, what do they do:**
- **MedScan Logo/Branding:** Situated at the top, provides brand identity.
- **Welcome Messaging:** "Welcome back. Please sign in to your account."
- **Demo Mode Banner (Conditional):** If active, clearly indicates the app is running in restricted mock-data mode.
- **Error Banner:** Appears dynamically if authentication fails (e.g., "Invalid credentials").

---

## Screen Name: Patient Dashboard
**Details about the screen:**
The primary interface for patients to upload medical reports, view their processing status, and access completed AI-generated analysis. It provides a historical list of all their health documents.

**Interactions that can happen on that screen:**
- **"Upload Report" Dropzone:** Allows drag-and-dropping or file browsing to upload a new PDF pathology report.
- **"View" Button (on completed reports):** Opens the Report Analysis Drawer to read the full AI breakdown.
- **"Share" Button:** Opens the Share Modal to explicitly grant access to a specific doctor.
- **"Retry" Button (on failed reports):** Re-submits the document to the AI pipeline.
- **"Ask Question" / "Chat" Button:** Opens the interactive Chatbot Modal for a specific report.
- **"View Trends" Button (Global):** Opens the Trend Modal to visualize biomarker changes over time.
- **Theme Toggle Icon:** Switches between Light and Dark mode.
- **Logout Button:** Ends the session and returns to the Login screen.

**Items present on the screen descriptively, what do they do:**
- **Header Navigation:** Contains the MedScan logo, User's Name, Theme Toggle, and Logout button.
- **Upload Progress Bar (Dynamic):** Visually tracks the upload and initial processing phase.
- **Reports Data Table:** A structured list displaying:
  - **Filename:** The original uploaded PDF name.
  - **Type:** The classified report type (e.g., CBC, Lipid Panel).
  - **Date Uploaded:** When the file was added.
  - **Status Badge:** A colored pill indicating the current state (`UPLOADED`, `PROCESSING`, `ANALYZED`, `FAILED`). *Note: During PROCESSING, it displays the progressive AI agent sequence.*
  - **Summary Preview:** A quick one-sentence snippet of the AI findings.

---

## Screen Name: Report Analysis Drawer (Patient/Doctor View)
**Details about the screen:**
A slide-out panel that overlays the Dashboard, exposing the deep, in-depth AI analysis of a fully processed medical report. It translates raw data into patient-friendly insights.

**Interactions that can happen on that screen:**
- **Close (X) Button:** Dismisses the drawer and returns to the main dashboard.
- **"Download PDF" Button:** Downloads a polished, generated copy of the AI summary.
- **Tabs (Summary vs. Raw Data):** Toggles between the human-readable explanation and the structured tabular list of extracted biomarkers.

**Items present on the screen descriptively, what do they do:**
- **Report Title & Date:** Identifies the current document.
- **AI Summary Section:** A concise, plain-English overview of the patient's general health status based on the report.
- **Clinical Insights List:** Bulleted actionable findings (e.g., "Iron levels are low indicating possible anemia").
- **Detailed Explanation Text:** A multi-paragraph breakdown of complex medical terminology found in the raw text.
- **Biomarkers Table (Raw Data Tab):** Lists every identified marker, its value, the reference range, and a Status Badge (`HIGH`, `LOW`, `NORMAL`, `CRITICAL`).

---

## Screen Name: Share Modal (Patient View)
**Details about the screen:**
A pop-up dialogue enabling a patient to securely share a specific report with a registered doctor in the MedScan system.

**Interactions that can happen on that screen:**
- **Doctor Search/Select Input:** A dropdown or autocomplete field to find the target doctor by name or hospital ID.
- **"Share Report" Submit Button:** Finalizes the permission grant and updates the database.
- **Close / Cancel Button:** Aborts the share action.

**Items present on the screen descriptively, what do they do:**
- **Modal Title:** Mentions the specific filename being shared.
- **List of Currently Shared Doctors:** Shows who already has access to this document, with an option to revoke access.

---

## Screen Name: Trend Viewer Modal (Patient View)
**Details about the screen:**
A visual analytics overlay that charts a specific biomarker's longitudinal changes across multiple uploaded reports over time.

**Interactions that can happen on that screen:**
- **Biomarker Selector Dropdown:** Allows the user to select which specific metric to graph (e.g., "Cholesterol", "Hemoglobin").
- **Timeframe Filters:** Buttons to switch between 3 Months, 6 Months, 1 Year, or All Time views.

**Items present on the screen descriptively, what do they do:**
- **Line Chart Visualization:** Plugs the historical values onto a graph. Highlights data points that fall outside the normal reference range in red.
- **Reference Range Shading:** A styled background band on the chart indicating the "healthy" normal zone.
- **Marker Statistics:** Text blocks summarizing the highest, lowest, and most recent values recorded.

---

## Screen Name: AI Chatbot Modal (Patient View)
**Details about the screen:**
A conversational sidebar or modal where patients can ask questions specifically contextualized by the data in one of their reports.

**Interactions that can happen on that screen:**
- **Chat Input Field:** A textbox to type custom questions.
- **"Send" Button:** Dispatches the message to the QA AI Agent.
- **Suggested Questions Pills:** Clickable chips (e.g., "What does high HDL mean?") that auto-send common queries.

**Items present on the screen descriptively, what do they do:**
- **Chat History Area:** Displays alternating message bubbles between the User and the MedScan AI Assistant.
- **Context Banner:** Reminds the user that the AI is answering based *only* on the currently opened report.

---

## Screen Name: Doctor Dashboard
**Details about the screen:**
The interface for medical professionals to monitor the patients assigned to them and review the medical reports that patients have explicitly shared.

**Interactions that can happen on that screen:**
- **"Assigned Patients" Tab:** Toggles the view to show a list of patients under the doctor's care.
- **"Shared Reports" Tab:** Toggles the view to a chronological feed of incoming patient documents.
- **"View Details" Button:** Opens the Report Analysis Drawer (identical to the Patient format) for a clinical review.
- **Theme Toggle Icon / Logout:** Standard global header controls.

**Items present on the screen descriptively, what do they do:**
- **Header:** Displays the Doctor's name dynamically.
- **Top Metric Cards:** 
  - **Assigned Patients:** Total patient count.
  - **Shared Reports:** Total lifetime documents received.
  - **Critical:** Number of reports flagged with 'CRITICAL' urgency anomalies that need immediate attention.
  - **Pending Review:** Reports the doctor has not yet clicked into.
- **Assigned Patients Table (Tab 1):** Lists Patient Name, Email, Assigned Date, and Report Count.
- **Shared Reports Table (Tab 2):** Lists Patient Name, Report Type, Date Shared, Markers Flagged (with urgency badge), and an Actions column. Read reports are tagged with a muted "REVIEWED" label.

---

## Screen Name: Hospital Admin Dashboard
**Details about the screen:**
A management console for hospital administrators to oversee the organizational chart, managing doctors, patient admissions, and the assignment relationships between them.

**Interactions that can happen on that screen:**
- **"Patients" / "Doctors" Tabs:** Switches between viewing the patient roster or the doctor staff list.
- **"Add Patient" / "Add Doctor" Buttons:** Opens data entry modals to register new users into the system.
- **"Assign Patient" Button:** Opens a modal mapping an existing patient to a specific doctor.
- **"Revoke" / "Delete" Action Icons:** Removes users or breaks assignment relationships.

**Items present on the screen descriptively, what do they do:**
- **Header:** Shows "MedCore Admin" (dynamic username).
- **Metric Cards:** Displays Total Patients across the system, Total Doctors, and Active Assignments (pairs).
- **Patients Data Table:** Lists Patient ID, Name, Email, and the names of all Doctors currently assigned to them.
- **Doctors Data Table:** Lists Doctor ID, Name, Email, Hospital ID, and the raw count of patients assigned to their queue.

---

## Screen Name: Developer (Dev) Dashboard
**Details about the screen:**
An internal technical monitoring panel for system engineers to visualize the performance and logs of the MedScan AI pipeline architecture.

**Interactions that can happen on that screen:**
- **"Refresh Logs" Button:** Manually polls the backend for the latest pipeline execution traces.
- **"Clear" Button:** Purges the visual log history on the client.
- **"View Trace" Link:** Expands a dense JSON payload showing the specific inputs and outputs of a single agent step.

**Items present on the screen descriptively, what do they do:**
- **Architecture Diagram (Static/Animated):** A visual flowchart outlining the 7-agent pipeline (PDF Parser -> Classifier -> Extractor -> ... -> Summary Generator).
- **System Metrics Cards:** Displays Uptime, average Pipeline Latency, and API Success/Error Rate percentages.
- **Live Pipeline Ledger (Table):** A scrolling list of recent background jobs detailing:
  - **Job ID / Report ID:** The execution trace reference.
  - **Agent Step:** Which specific AI service ran.
  - **Duration:** Execution time in milliseconds.
  - **Status:** Success (green) or Failed (red) badges.
