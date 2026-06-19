# Product Requirements Document (PRD)

## 1. Product Overview
**Product Name**: Operations Performance Assessment System (OPAS)
**Product Vision**: To provide a unified, highly automated, and fully auditable platform for facility management and security operations. OPAS replaces fragmented WhatsApp groups, Excel sheets, and email chains with a centralized system that tracks compliance, resolves workforce anomalies, schedules site visits, and executes hierarchical performance scoring.

---

## 2. Target Audience & User Personas
OPAS is designed around a strict hierarchical access and approval model:

| Persona | Role Description | Key Responsibilities in OPAS |
| :--- | :--- | :--- |
| **Operation Executive (OE)** | Ground-level portfolio manager. | Executes daily operations, submits audits/proofs, plans site visits, resolves attendance anomalies, and initiates workflows. |
| **Regional Manager (RM)** | Mid-level supervisor. | Reviews and approves OE submissions, validates reliever deployments, and scores OE performance. |
| **Zonal Head (ZH) / AVP / BH** | Senior Management. | Multi-tier escalation and final approval matrix for critical tasks and compliance scoring. |
| **Director (DR)** | Executive Leadership. | Ultimate sign-off for financial/business decisions (e.g., major R&R events, high-impact grievances). |
| **HR / Procurement** | Specialized Support. | Handles uniform/shoe issuance, recruitment for vacant spots, and employee grievance tracking. |

---

## 3. Core Features & Capabilities

### 3.1. Dynamic Activity & Compliance Engine (OCRMS)
* **Description**: A highly flexible task generation engine that creates operational tasks for OEs based on a predefined master list.
* **Capabilities**:
  * **Frequency-based Triggers**: Tasks can be Daily, Weekly, Fortnightly, Monthly, or One-Time.
  * **Dynamic Form Schemas**: Each task template has a specific form schema (e.g., "Uniform Issuance" asks for 'Total Employees', 'Issued Count', 'Remaining').
  * **Evidence Requirements**: Tasks enforce mandatory evidence uploads (e.g., Images, PDFs, Signatures) before submission.
  * **Automated Routing**: Tasks automatically route through a defined approval flow (e.g., `OE → RM → AVP → BH`).

### 3.2. Attendance Resolution & Roster Management
* **Description**: A dedicated workflow to handle workforce anomalies (absentees, missing punches, non-app usage).
* **Capabilities**:
  * **Anomaly Flagging**: The system flags employees who are absent, have missing In/Out punches, or fail to use the mobile attendance app.
  * **Reliever Deployment**: OEs can dynamically assign a 'Reliever' from the bench to cover an absent employee.
  * **Approval Constraints**: If an employee is marked "Left", the system forces the creation of a recruitment ticket for HR.
  * **Visual Calendar**: A 7-day horizontal calendar strip for each employee, showing exact punch-in/out timings and daily status.

### 3.3. Site Visit Planner & Minutes of Meeting (MOM)
* **Description**: An interactive tool for OEs to plan their physical site visits and document client interactions.
* **Capabilities**:
  * **Drag & Drop Calendar**: OEs can drag unassigned sites from their portfolio onto a calendar to schedule visits.
  * **MOM Generation**: Converting a completed visit into a structured MOM report, capturing client sentiment, open queries, and action items.
  * **Excel Integration**: Ability to bulk-upload visit plans via Excel.

### 3.4. Site Operations Dashboard (360° View)
* **Description**: A consolidated dashboard detailing the complete health of a specific site.
* **Capabilities**:
  * **Employee Roster**: Live list of employees assigned to the site with their shifts and designations.
  * **Training Planner**: A calendar UI to schedule and track offline/online training sessions (e.g., Fire Safety Drill).
  * **Material & Uniform Requests**: Tracking the supply chain of uniforms, shoes, and operational materials per site.

### 3.5. Multi-Tier Review & Approval Queues
* **Description**: A dedicated interface for managers to review tasks submitted by subordinates.
* **Capabilities**:
  * **Queue Segregation**: RMs only see tasks in the `rm_review` stage. AVPs only see tasks in the `avp_review` stage.
  * **Split-Screen UX**: A detailed modal showing the full historical context (OE remarks, RM remarks, attached files) on the left, and the action area (scoring, feedback) on the right.
  * **Performance Scoring Policy**: Calculating the final score based on configurable policies (e.g., `AVP_ONLY` vs. `AVERAGE_SCORE`).

---

## 4. Technical Architecture & Constraints

* **Frontend Framework**: Next.js (App Router), React 18
* **Styling**: Tailwind CSS + Shadcn UI components
* **Icons**: Lucide React
* **State Management**: React Context (`useOCRMS`)
* **Responsive Design**: Mobile-first architecture, highly optimized for iPads/Tablets (which OEs use on the field).

---

## 5. Future Roadmap (Phase 2)
1. **Real-time Geofencing**: Enforcing that OEs can only submit "Site Visit" reports if their GPS coordinates match the site's geofence.
2. **AI-Powered OCR**: Automatically scanning uploaded Challans and Sign-off sheets to verify the extracted text against the form submission data.
3. **Push Notifications**: Integrating a WebSocket layer for real-time push notifications when a task is rejected or escalated.
