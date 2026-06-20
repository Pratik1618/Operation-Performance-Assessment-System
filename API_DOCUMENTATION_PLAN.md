# API Documentation Plan: OPAS / OCRMS Backend Specification

This document maps out the backend API specifications required to support the frontend-only **Operations Performance Assessment System (OPAS)** (also referred to as **OCRMS**). The APIs have been designed to replicate the precision, structure, and tabular schema definitions seen in the Commercial API Specifications document.

---

## 1. Document Structure & Blueprint
To support the backend development of the OPAS/OCRMS application, the final API documentation will be structured into the following sections:

1. **Introduction & Architectural Overview**: System design, dataflow, and hierarchical role-based permissions (`UserRole`).
2. **Core Schema Definitions**: Typescript to relational/document mapping guidelines.
3. **Module 1: Dynamic Activity & Compliance Engine (OCRMS)** (10 Endpoints)
4. **Module 2: Attendance Resolution & Roster Verification** (6 Endpoints)
5. **Module 3: Site Visit Planner & Report Suite (MOM/SVR)** (6 Endpoints)
6. **Module 4: Incident, Grievance, and Procurement Management** (6 Endpoints)
7. **Module 5: Performance Review & Multi-Tier Approvals** (4 Endpoints)
8. **Statutory Calculations & Validation Business Rules**: Replicating the detailed formulas for scoring policy recomputations.

---

## 2. Inventory of Proposed Endpoints
The following endpoints will be documented with exact field validations, authorization headers, request/response body schemas, and backend processing rules:

### A. Auth, Master Data & Context
* **`GET /api/users/me`**: Retrieves current logged-in user profile, role configurations (`RoleConfig`), and geographics.
* **`GET /api/masters/sites`**: Retrieves list of all active sites, employee counts, and manager associations.
* **`GET /api/masters/clients`**: Retrieves active client companies.
* **`GET /api/masters/employees`**: Retrieves employee registry (guards, supervisors, housekeepers) for rosters.

### B. Dynamic Activity & Compliance Engine (OCRMS)
* **`GET /api/tasks`**: Returns all assigned operational tasks filtered by role-based queues, frequency, and status.
* **`GET /api/tasks/{id}`**: Fetches a single operational task with its associated dynamic form schema, remarks, rating, and files.
* **`POST /api/tasks/{id}/save-draft`**: Allows OEs to save in-progress forms as draft status (`in_progress`).
* **`POST /api/tasks/{id}/submit`**: Form submission for manager review (moves status to `oe_submitted` / `submitted`).
* **`POST /api/tasks/generate`**: System scheduler trigger to run the task generation engine for a target date (Daily, Weekly, Fortnightly, Monthly, One-Time).
* **`GET /api/templates`**: Fetch all active compliance activity templates.
* **`POST /api/templates`**: Add new activity templates with custom form schema JSON.
* **`PUT /api/templates/{id}`**: Edit configurations, weightage, active status, or approval flow of existing templates.

### C. Attendance & Resolution Anomaly Pipeline
* **`GET /api/attendance/anomalies`**: Fetches daily attendance verification anomalies (absentees, missing punches, non-app usage).
* **`POST /api/attendance/anomalies/{id}/resolve`**: Submits a resolution case details (reliever deployment, HR vacancy raise, client countersigned regularization).
* **`GET /api/attendance/verification-cases`**: Returns multi-tier rating sheets for audits.

### D. Site Visit Planner & Report Suite
* **`GET /api/site-visits`**: Fetch planned and completed site visits.
* **`POST /api/site-visits/plan`**: Create new site visit schedule.
* **`POST /api/site-visits/bulk-import`**: Bulk uploads visit schedule via Excel template.
* **`POST /api/site-visits/{id}/report`**: Submits the 11-section Site Visit Report (site quality score, HK assessment compliance/discipline, material checks, training conducted, client feedback, photos, corrective action list).
* **`POST /api/site-visits/{id}/mom`**: Submits the 10-section Minutes of Meeting report (client sentiment, topics discussed, issues raised, action items, business opportunities).

### E. Incidents, Grievances & Procurements
* **`GET /api/grievances`** / **`POST /api/grievances`**: Submits and tracks employee grievance tickets (pf, salary, safety, workplace).
* **`GET /api/incidents`** / **`POST /api/incidents`**: Logs physical incidents (theft, fire, accident) and tracks corrective action status.
* **`GET /api/procurements`** / **`POST /api/procurements`**: Requests chemical, uniforms, safety shoes, or equipment materials.

### F. Performance Review & Approvals Queue
* **`GET /api/approvals`**: Returns pending review items segregated by manager role stage (`rm_review`, `avp_review`, `bh_approval`, etc.).
* **`POST /api/tasks/{id}/review`**: Approves or returns a task. Applies scoring recalculation logic.

---

## 3. Calculation & Business Rule Specification Blueprint
The final document will specify mathematical logic for:
1. **Dynamic Task Performance Score**:
   - `AVP_ONLY` Policy: Base score on AVP rating.
   - `AVERAGE` Policy: Base score on average rating across all reviewer tiers.
   - `WEIGHTED` Policy: `(0.1 * oe) + (0.15 * rm) + (0.2 * zh) + (0.25 * avp) + (0.3 * bh)`.
2. **Site Visit Overall Health Score**:
   - Weighted average of Checklist Score, HK Compliance Check (uniform, safety shoes), Training Coverage, and Client Feedback rating.
3. **Attendance Compliance KPI**:
   - `(Reconciled Hours / Planned Hours) * 100` minus absenteeism penalty coefficients.

---

## 4. Next Steps
Upon approval of this plan, I will generate the complete API specification document `API_DOCUMENTATION.md` matching this blueprint with exact JSON examples, payload schemas, and backend processing steps.
