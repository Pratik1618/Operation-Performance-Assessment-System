# Site Visit Report & MOM Report — Implementation Plan

## Context: These are TWO SEPARATE Activities

Per the activities mapping (`activities_mapping.csv`) and activity templates (`ocrms-data.ts`):

| | Site Visit Report | MOM Report |
|---|---|---|
| **Code** | `ACT-OPS-01` | `ACT-REP-01` |
| **Template ID** | `TPL-OPS-001` | `TPL-REP-001` |
| **Category** | Site Operations | Reporting & Closure |
| **Frequency** | Daily | Monthly |
| **Assigned Roles** | oe, rm, avp, bh, dr | oe, rm, avp, bh, dr |
| **Approval Flow** | OE → RM → AVP → BH → DR | OE → RM → AVP → BH → DR |
| **Current Form Fields** | 3 basic fields (checklist score, observations textarea, client feedback textarea) | 2 basic fields (client reps present, key decisions textarea) |

Both flow through the existing `/tasks/[id]` dynamic form system — the task detail page renders form fields from `template.formSchema`.

---

## Current State (What exists now)

### Site Visit Report (`TPL-OPS-001`)
**Current formSchema** (in `ocrms-data.ts:L221-225`):
```
- checklistScore: Checklist Adherence Score (out of 34) — number
- observations: Critical Site Observations — textarea
- clientFeedback: Client Feedback Notes — textarea (optional)
```
This is extremely minimal vs. the 11-section spec from management.

### MOM Report (`TPL-REP-001`)
**Current formSchema** (in `ocrms-data.ts:L611-614`):
```
- clientRepsPresent: Client Representatives Present — text
- keyDecisions: Key Decisions & Action Points — textarea
```
This is extremely minimal vs. the 10-section spec from management.

### How tasks render forms
The `/tasks/[id]/page.tsx` renders fields dynamically from `template.formSchema` using basic field types: `text`, `number`, `checkbox`, `select`, `textarea`, `date`. 

**Problem**: The management spec requires field types that don't exist yet: star ratings (1-5), multi-select checkboxes, conditional sections, photo upload areas, dynamic action item rows, emoji selectors — far more complex than what `formSchema` currently supports.

---

## Proposed Approach

Since both activities need **complex multi-section forms** that go well beyond what the generic `formSchema` system can handle, we will:

1. **Create dedicated form components** for each activity (not rely on the generic formSchema renderer)
2. **Detect the template ID** in `/tasks/[id]/page.tsx` and render the specialized form instead of the generic one
3. **Keep the existing approval flow** — the form just produces richer `formData` that goes through the same OE → RM → AVP → BH → DR pipeline
4. **Update the formSchema** in the templates to reflect the new fields (for validation/reference)

---

## PART A — SITE VISIT REPORT (ACT-OPS-01 / TPL-OPS-001)

### 11 Sections per Management Spec

**SECTION 1: Visit Details**
- Auto-capture: Supervisor Name, Employee ID, Date & Time, GPS Location, Site Name, Client Name, Branch
- User selection: Visit Type (Routine | Surprise | Complaint | Follow-up | New Site Inspection)

**SECTION 2: Site Quality Audit**
- Star rating (1–5) for 8 parameters: Overall Cleanliness, Workstation Condition, Cabin Cleanliness, Washroom Cleanliness, Office Entrance Condition, Glass Cleaning, Furniture & Chair Condition, Housekeeping Standards
- Observation checklist (multi-select): Cobwebs, Doormat Not Maintained, Broken Fittings, Dust Accumulation, Stains/Spillage, None
- Auto-calculate: Site Quality Score

**SECTION 3: Housekeeping Associate Assessment**
- Gate: HK Associate Met? (Yes/No)
- If Yes → Compliance verification (5 checkpoints yes/no), Knowledge assessment (4 parameters rated 1-5), Discipline (3 checkpoints yes/no)

**SECTION 4: Material & Equipment Status**
- Material Availability dropdown: Fully Available | Low Stock | Critical Shortage
- Equipment Status dropdown: Fully Functional | Minor Issue | Major Breakdown
- If issue → mandatory: Equipment Name, Issue Description, Photo Upload

**SECTION 5: Training & Coaching**
- Multi-select topics (10 options)
- Training Conducted? (Yes/No) → If Yes: short remark (max 100 chars)

**SECTION 6: Client / Branch Manager Feedback**
- Gate: Client Met? (Yes/No)
- If Yes → 4 parameters rated 1-5, Material Quality feedback (Excellent/Good/Average/Poor), Service Quality feedback, Optional client remark (max 150 chars)

**SECTION 7: Photo Documentation**
- Mandatory photos (min 3): Site Overview, Washroom Area, HK Staff
- Optional photos: Store Room, Equipment, Issues, Before/After
- Min uploads: 3, Max uploads: 10

**SECTION 8: Issues Identified**
- Multi-select: Staff Shortage, Material Shortage, Equipment Breakdown, Attendance Issue, Uniform Non-Compliance, Grooming Issue, Client Complaint, Safety Concern, Cleaning Quality Issue, Other

**SECTION 9: Corrective Action** (appears only if issues identified)
- Dynamic rows: Issue, Assigned To, Priority (High/Medium/Low), Target Closure Date
- Auto-create task, auto-reminders, escalation if overdue

**SECTION 10: Positive Recognition**
- Mandatory text (max 150 chars): What was done well during this visit?

**SECTION 11: Final Site Status**
- Dropdown: Excellent | Good | Needs Improvement | Critical
- Supervisor Remarks (conditional mandatory if score < 75% OR client feedback = Poor OR critical issue)
- Auto-calculated scores: Site Quality Score, Compliance Score, Training Coverage Score, Overall Site Health Score

---

## PART B — MOM REPORT (ACT-REP-01 / TPL-REP-001)

### 10 Sections per Management Spec

**SECTION 1: Meeting Details**
- Auto-capture: Date & Time, Site Name, Client Name, Supervisor Name, Branch/Region
- User input: Client Representative Met (text), Designation (text)

**SECTION 2: Client Interaction**
- Gate: Client / Branch Manager Met? (Yes/No)
- If No → Display "No client interaction conducted" → Allow submission

**SECTION 3: Client Sentiment**
- Single select with emojis: 😀 Very Happy | 🙂 Satisfied | 😐 Neutral | ☹ Concerned | 😠 Escalated

**SECTION 4: Discussion Topics**
- Multi-select: Service Quality, Cleaning Standards, Manpower, Attendance, Material Availability, Equipment Issues, Complaint Follow-up, Additional Requirement, Contract/Commercial, Other

**SECTION 5: Issues Raised**
- Gate: Did Client Raise Any Concern? (Yes/No)
- If Yes → Multi-select: Cleaning Quality, Attendance, Staff Behaviour, Material Shortage, Equipment Breakdown, Safety Concern, Service Delay, Other

**SECTION 6: Action Required**
- Gate: Is Any Follow-up Action Required? (Yes/No)
- If Yes → Dynamic action items: Action Description, Assigned To, Target Date, Priority
- Auto-create action item, send notification, track closure

**SECTION 7: Business Opportunity**
- Gate: Additional Requirement Discussed? (Yes/No)
- If Yes → Multi-select: Additional Manpower, Deep Cleaning, Facade Cleaning, Pest Control, Landscaping, Pantry Services, Technical Services, Other
- Optional: Opportunity Value (Low/Medium/High)
- Auto-create lead for BD team

**SECTION 8: Meeting Summary**
- Text field (max 100 chars) with voice note icon placeholder
- Document upload option (for AVP+ visits)

**SECTION 9: Follow-up**
- Gate: Follow-up Required? (Yes/No)
- If Yes → Follow-up Date (date picker)
- Auto-reminder to supervisor on follow-up date

**SECTION 10: Meeting Outcome**
- Single select: No Action Required | Action Plan Created | Escalation Required | Business Opportunity Identified

---

## Technical Implementation

### Files to Create

| File | Purpose |
|---|---|
| `components/ui/star-rating.tsx` | Reusable 1-5 star rating component |
| `components/operations/site-visit-report-form.tsx` | Multi-step wizard for Site Visit Report (11 sections) |
| `components/operations/mom-report-form.tsx` | Multi-step wizard for MOM Report (10 sections) |
| `components/operations/site-visit-summary.tsx` | Read-only report summary with score gauges |
| `components/operations/mom-summary.tsx` | Read-only MOM summary view |
| `lib/data/site-visit-data.ts` | Mock data, default initializers, score calculators |

### Files to Modify

| File | Changes |
|---|---|
| `lib/types.ts` | Add ~15 new interfaces/types for Site Visit Report + MOM data structures |
| `lib/data/ocrms-data.ts` | Update `TPL-OPS-001` and `TPL-REP-001` formSchema to reflect all new fields |
| `app/tasks/[id]/page.tsx` | Detect `TPL-OPS-001` or `TPL-REP-001` template → render specialized form component instead of generic field renderer |
| `app/site-operations/page.tsx` | Replace the simple "Report Visit" dialog (L1774-L1839) with the new form; replace audit detail dialog (L1631-L1718) with rich summary view |

### Integration Architecture

```
User clicks "Report Visit" (site-operations page)
  OR navigates to /tasks/[id] for a Site Visit Report task
    ↓
Detect template === 'TPL-OPS-001'
    ↓
Render <SiteVisitReportForm /> instead of generic form
    ↓
Form produces comprehensive formData object
    ↓
formData saved via updateTask() → goes through normal approval flow
    ↓
RM/AVP/BH/DR sees <SiteVisitSummary /> in review mode

Same flow for MOM Report (TPL-REP-001 → <MOMReportForm /> → <MOMSummary />)
```

### Auto-Calculated Scores
- **Site Quality Score** = Average of Section 2 ratings × 20 (scaled to 100)
- **Compliance Score** = (Passed checkpoints / Total checkpoints) × 100
- **Training Coverage Score** = (Topics covered / Total topics) × 100
- **Overall Site Health Score** = Weighted average of above three scores

### UI/UX Design
- **Multi-step wizard** with numbered stepper at top
- **Conditional rendering** — sections show/hide based on gate questions
- **Real-time score calculation** shown in a floating sidebar/header
- **Full-screen dialog** (not the current small modal) to accommodate form complexity
- **Progress indicator** showing X/11 sections completed
- Premium styling consistent with existing OPAS design language
