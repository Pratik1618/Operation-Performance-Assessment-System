# Operations Performance Assessment System (OPAS / OCRMS)
## API Specifications & Schema Documentation

---

# Introduction

The **Operations Performance Assessment System (OPAS)** (also referred to as the **Operations Compliance & Reporting Management System, OCRMS**) is an enterprise application designed to streamline, track, and audit operational compliance and field team performance for facility management and security operations.

This application replaces unstructured manual tracking (such as email chains, WhatsApp updates, and spreadsheet logs) with a standardized, hierarchical, and auditable digital workflow spanning portfolios of Clients, Sites, Compliance Tasks, and Roster Anomalies.

## Key Functionalities:

1. **Dynamic Compliance & Activity Engine (OCRMS)**: A flexible scheduler that generates daily, weekly, fortnightly, or monthly operational tasks for portfolio managers (Operations Executives) based on active master templates. Tasks support dynamic forms, file attachments, and mandatory evidence upload.
2. **Attendance Resolution Pipeline**: Real-time tracking and resolution of roster anomalies (absentees, missing punches, and non-app usage). Features reliever deployment, automated vacancy posting, and client-approved regularization submissions.
3. **Site Visit Planner & MOM Suite**: Interactive calendar for planning field visits, bulk importing schedules via Excel, and generating 11-section Site Quality/Health Reports and 10-section Minutes of Meeting (MOM) documents on visit completion.
4. **Hierarchical Multi-Tier Review Queues**: Systematized routing of task audits through validation stages (e.g., `OE → RM → ZH → AVP → BH → DR`). Reviewers can rate and comment, triggering custom scoring policies (e.g., Weighted, Average, or AVP-Only).
5. **Support Operations Tracking**: Fully integrated ticket lifecycles for uniform/shoe issuance, procurement supply chains, physical safety incidents, and employee grievances.

---

# API Specifications

## 1. API Specification: User Authentication (Login)

This API is called when a user submits credentials on the login screen. It authenticates the user and returns an access token along with their user profile (including their role within the system hierarchy).

### 1. Endpoint: `POST /api/auth/login`

### 2. Authorization:
* Public endpoint. No credentials required in headers.

### 3. Request Body: A JSON object with the following structure:

| Field Name | Data Type | Required | Notes/Validation |
| :--- | :--- | :--- | :--- |
| email | String | Yes | Must be a valid email format. |
| password | String | Yes | Minimum 6 characters. |

### 4. Example JSON Payload:
```json
{
  "email": "ravi.shankar@company.com",
  "password": "securepassword123"
}
```

### 5. Response Structure: A JSON object with the following structure on success:

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| token | String | JWT access token to be passed in subsequent request headers. |
| user | Object | The authenticated user's profile info. |
| user.id | String | Unique user ID. |
| user.name | String | User's full name (e.g., "Ravi Shankar"). |
| user.code | String | Custom employee/role code (e.g., "OE-001"). |
| user.designation | String | Professional designation title. |
| user.role | String | Hierarchical user role (e.g., 'oe', 'rm', 'zh', 'avp', 'bh', 'dr', 'hr', 'th', 'trainers', 'commerical', 'hod', 'hr_dr'). |
| user.email | String | Contact email address. |
| user.phone | String | Contact phone number. |

### 6. Example JSON Response (Success):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ik1PQ0tfT0VfMDAxIiwicm9sZSI6Im9lIn0...",
  "user": {
    "id": "USR_OE1",
    "name": "Ravi Shankar",
    "code": "OE-001",
    "designation": "Operation Executive",
    "role": "oe",
    "email": "ravi.shankar@company.com",
    "phone": "9876543210"
  }
}
```

### 7. Example JSON Response (Error - 401 Unauthorized):
```json
{
  "error": "Authentication Failed",
  "message": "Invalid email address or password configuration."
}
```

---

## 2. API Specification: Get Scheduled Visits

This API fetches all scheduled audit visits, supporting filtering by date/month, status, site, and assigned Operations Executive.

### 1. Endpoint: `GET /api/site-visits`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Accessible by Roles: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`.

### 3. Query Parameters:
| Parameter Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| month | String | No | Year-Month format (e.g., `2026-06`) to filter by month. |
| status | String | No | Filter by status (`planned`, `completed`, `missed`). |
| siteId | String | No | Filter schedules by a specific site ID. |
| assignedTo | String | No | Filter by assigned OE name/username. |

### 4. Response Structure: Array of objects with the following structure:
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| id | String | Unique schedule identifier. |
| siteId | String | Target site identifier. |
| siteName | String | Name of the site. |
| clientName | String | Name of the client company. |
| dateStr | String | Date of scheduled visit (`YYYY-MM-DD`). |
| time | String | Scheduled time of visit (e.g., `10:00 AM`). |
| status | String | Current visit status (`planned`, `completed`, `missed`). |
| assignedTo | String | Name of the Operations Executive assigned to perform the audit. |

### 5. Example JSON Response:
```json
[
  {
    "id": "SCH_001",
    "siteId": "SITE_003",
    "siteName": "Wipro Hinjewadi Campus",
    "clientName": "Wipro Technologies",
    "dateStr": "2026-06-20",
    "time": "11:00 AM",
    "status": "planned",
    "assignedTo": "Ravi Shankar"
  }
]
```

---

## 3. API Specification: Add/Schedule Site Visit (Manual)

This API is called when a manager or Operations Executive manually schedules a site visit in the planner calendar.

### 1. Endpoint: `POST /api/site-visits`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Lock restriction: Blocked if the planner for the target month is already locked.

### 3. Request Body: A JSON object with the following structure:
| Field Name | Data Type | Required | Notes/Validation |
| :--- | :--- | :--- | :--- |
| siteId | String | Yes | Valid site identifier in the master database. |
| dateStr | String | Yes | Scheduled date of visit (`YYYY-MM-DD`). Must not be in the past. |
| time | String | Yes | Scheduled time format (e.g., `10:00 AM`). |
| assignedTo | String | Yes | Name of the Operations Executive conducting the visit. |

### 4. Example JSON Payload:
```json
{
  "siteId": "SITE_003",
  "dateStr": "2026-06-25",
  "time": "02:30 PM",
  "assignedTo": "Ravi Shankar"
}
```

### 5. Response Structure: A JSON object with the following structure on success:

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| id | String | System generated unique schedule identifier. |
| siteId | String | Target site identifier. |
| siteName | String | Resolved name of the site. |
| clientName | String | Resolved name of the client. |
| dateStr | String | Scheduled date of visit (`YYYY-MM-DD`). |
| time | String | Scheduled time of visit (e.g., `10:00 AM`). |
| status | String | Initial visit status (`planned`). |
| assignedTo | String | Operations Executive assigned to perform the audit. |

### 6. Example JSON Response (Success):
```json
{
  "id": "SCH_1002",
  "siteId": "SITE_003",
  "siteName": "Wipro Hinjewadi Campus",
  "clientName": "Wipro Technologies",
  "dateStr": "2026-06-25",
  "time": "02:30 PM",
  "status": "planned",
  "assignedTo": "Ravi Shankar"
}
```


---

## 4. API Specification: Update/Reschedule Site Visit

This API is triggered when a scheduled visit is dragged to a new calendar date or edited via the schedule details modal.

### 1. Endpoint: `PUT /api/site-visits/{id}`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Lock restriction: Blocked if the planner for the target month is already locked.

### 3. Request Body: A JSON object with the following structure:
| Field Name | Data Type | Required | Notes/Validation |
| :--- | :--- | :--- | :--- |
| dateStr | String | No | New scheduled date (`YYYY-MM-DD`). |
| time | String | No | New scheduled time (e.g., `04:00 PM`). |
| assignedTo | String | No | Reassigned Operations Executive. |

### 4. Example JSON Payload:
```json
{
  "dateStr": "2026-06-28",
  "time": "11:30 AM"
}
```

### 5. Response Structure: A JSON object with the following structure on success:

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| id | String | Unique schedule identifier. |
| siteId | String | Target site identifier. |
| siteName | String | Name of the site. |
| clientName | String | Name of the client. |
| dateStr | String | Updated scheduled date of visit (`YYYY-MM-DD`). |
| time | String | Updated scheduled time of visit (e.g., `10:00 AM`). |
| status | String | Current visit status (`planned`). |
| assignedTo | String | Operations Executive assigned to perform the audit. |

### 6. Example JSON Response (Success):
```json
{
  "id": "SCH_1002",
  "siteId": "SITE_003",
  "siteName": "Wipro Hinjewadi Campus",
  "clientName": "Wipro Technologies",
  "dateStr": "2026-06-28",
  "time": "11:30 AM",
  "status": "planned",
  "assignedTo": "Ravi Shankar"
}
```

---

## 5. API Specification: Delete Scheduled Visit

This API is triggered when a planned schedule is removed from the calendar.

### 1. Endpoint: `DELETE /api/site-visits/{id}`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Lock restriction: Blocked if the planner for the target month is already locked.

### 3. Response Structure: A JSON object with the following structure on success:

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| success | Boolean | State indicator of deletion (`true` or `false`). |
| message | String | Execution feedback message. |

### 4. Example JSON Response (Success):
```json
{
  "success": true,
  "message": "Site visit schedule record has been deleted successfully."
}
```

---

## 6. API Specification: Lock & Submit Monthly Planner

This API is called when the user locks the month's planner (Lock & Submit button). This freezes all scheduled visits for that month to prevent modifications.

### 1. Endpoint: `POST /api/site-visits/lock`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.

### 3. Request Body: A JSON object with the following structure:
| Field Name | Data Type | Required | Notes/Validation |
| :--- | :--- | :--- | :--- |
| monthKey | String | Yes | Unique month identifier (e.g., `2026-5` representing June 2026). |
| isLocked | Boolean | Yes | `true` to lock schedules, `false` to unlock (restricted by role). |

### 4. Example JSON Payload:
```json
{
  "monthKey": "2026-5",
  "isLocked": true
}
```

### 5. Response Structure: A JSON object with the following structure on success:

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| success | Boolean | Status of operations confirmation. |
| monthKey | String | Target month identifier. |
| isLocked | Boolean | Lock status state indicator. |
| message | String | Status text message. |

### 6. Example JSON Response (Success):
```json
{
  "success": true,
  "monthKey": "2026-5",
  "isLocked": true,
  "message": "Monthly schedule planner locked successfully."
}
```

---

## 7. API Specification: Download Planner Import Template

Provides the sample template layout structure (CSV/Excel) for bulk uploading schedules.

### 1. Endpoint: `GET /api/site-visits/import/template`

### 2. Authorization: Protected Route.

### 3. Response:
* **Content-Type**: `text/csv`
* **File Content**: Return sample CSV headers: `Date,Time,Site ID,Assigned OE Name` with dummy rows.

---

## 8. API Specification: Bulk Import Planner Schedules

Called when a user drops or uploads a scheduler spreadsheet. The backend parses the layout, maps sites, validates dates/OEs, and bulk creates the schedules.

### 1. Endpoint: `POST /api/site-visits/import`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Request Format: `multipart/form-data`

### 3. Request Payload:
| Field Name | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| file | File (Binary) | Yes | Allowed extensions: `.xlsx`, `.csv`. Max size: 5MB. |

### 4. Processing & Validation Logic:
* The backend parses each row of the spreadsheet and verifies:
  1. **Site ID Existence**: Valid site ID in the database.
  2. **OE Mapping**: The assigned Operations Executive exists and is mapped to the target site. If not, sets status to `Warning` with feedback.
* Returns a validation array of row validation results showing validation status (`Valid` / `Warning` / `Error`).

### 5. Example JSON Response (Validation Preview):
```json
{
  "totalRows": 4,
  "validRows": 3,
  "warningRows": 1,
  "preview": [
    {
      "date": "2026-07-02",
      "time": "10:00 AM",
      "siteId": "SITE_001",
      "siteName": "Infosys Gurgaon Tower A",
      "oeName": "Ravi Shankar",
      "status": "Valid",
      "msg": "Matches OE mapping."
    },
{
      "date": "2026-07-12",
      "time": "09:00 AM",
      "siteId": "SITE_004",
      "siteName": "TCS Hyderabad Gachibowli",
      "oeName": "Anjali Desai",
      "status": "Warning",
      "msg": "Roster mapped to Priya Sen; verify shift cover."
    }
  ]
}
```

---

## 9. API Specification: Get Site Master List (Mapping)

This API retrieves all site profiles mapped within the Operations division, including geo-locations, staff headcounts, and hierarchical manager mappings (OEs, RMs, AVPs).

### 1. Endpoint: `GET /api/mapping/sites`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Accessible by Roles: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`.

### 3. Query Parameters:
| Parameter Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| search | String | No | Search query matching site name, site code, or client account. |
| region | String | No | Filter sites by geographical region (e.g., `West`, `North`). |
| state | String | No | Filter sites by state (e.g., `Maharashtra`). |
| status | String | No | Filter by active status (`active`, `inactive`). |

### 4. Response Structure: Array of objects with the following structure:
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| id | String | Unique site ID. |
| code | String | Custom site identifier code (e.g., `WIPRO-PUN-01`). |
| name | String | Name of the site location. |
| client | String | Client corporate name. |
| clientId | String | Associated Client ID. |
| region | String | Geographical region. |
| state | String | State. |
| zone | String | Operational zone. |
| address | String | Full physical street address. |
| assignedOE | String (Nullable) | Name of the assigned Operations Executive. Returns `null` (or empty/`"Unassigned"`) if no OE is currently mapped to the site. |
| assignedRM | String | Name of the assigned Regional Manager. |
| assignedAVP | String | Name of the assigned AVP Operations. |
| employeeCount | Number | Deployed manpower headcount. |
| status | String | Active status (`active`, `inactive`). |

### 5. Example JSON Response:
```json
[
  {
    "id": "SITE_003",
    "code": "WIPRO-PUN-01",
    "name": "Wipro Hinjewadi Campus",
    "client": "Wipro Technologies",
    "clientId": "CLT_002",
    "region": "West",
    "state": "Maharashtra",
    "zone": "Pune",
    "address": "Hinjewadi Phase 2, Pune",
    "assignedOE": "Ravi Shankar",
    "assignedRM": "Suresh Kumar",
    "assignedAVP": "Venkat Raman",
    "employeeCount": 38,
    "status": "active"
  }
]
```

---

## 10. API Specification: Request Site OE Transfer (or Assignment)

This API is triggered when a Regional Manager (RM) requests a change in the Operations Executive mapped to a specific site.

> [!NOTE]
> **Initial OE Assignment (No Previous OE Mapped):**
> If a site is currently unassigned (i.e., `assignedOE` is empty, `null`, or `"Unassigned"` in the database), the RM uses this same endpoint to assign a new OE. In this case, the `previousOE` field in the response will return `null` or `"Unassigned"`. Once approved/verified by the AVP Operations, the site master's `assignedOE` is updated with the new assignment.

### 1. Endpoint: `POST /api/mapping/transfers`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to Role: `rm`.

### 3. Request Body: A JSON object with the following structure:
| Field Name | Data Type | Required | Notes/Validation |
| :--- | :--- | :--- | :--- |
| siteId | String | Yes | Valid site identifier. |
| assignedOE | String | Yes | Name of the new Operations Executive to assign. |

### 4. Example JSON Payload:
```json
{
  "siteId": "SITE_003",
  "assignedOE": "Kiran Nair"
}
```

### 5. Response Structure: A JSON object with the following structure on success:
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| id | String | Unique transfer request identifier. |
| siteId | String | Target site ID. |
| siteName | String | Name of the site. |
| siteCode | String | Site identification code. |
| previousOE | String (Nullable) | Name of the OE currently assigned to the site. Returns `null` or `"Unassigned"` if the site is currently unassigned. |
| assignedOE | String | Name of the proposed new OE. |
| assignedRM | String | Name of the RM who submitted the transfer request. |
| requestedDate | String | Request submission date (`YYYY-MM-DD`). |
| status | String | Initial status (`pending_avp`). |

### 6. Example JSON Response (Success - OE Transfer):
```json
{
  "id": "REQ_MAPPING_2004",
  "siteId": "SITE_003",
  "siteName": "Wipro Hinjewadi Campus",
  "siteCode": "WIPRO-PUN-01",
  "previousOE": "Ravi Shankar",
  "assignedOE": "Kiran Nair",
  "assignedRM": "Suresh Kumar",
  "requestedDate": "2026-06-19",
  "status": "pending_avp"
}
```

### 7. Example JSON Response (Success - Initial Assignment):
```json
{
  "id": "REQ_MAPPING_2005",
  "siteId": "SITE_004",
  "siteName": "TCS Hyderabad Gachibowli",
  "siteCode": "TCS-HYD-02",
  "previousOE": null,
  "assignedOE": "Anjali Desai",
  "assignedRM": "Suresh Kumar",
  "requestedDate": "2026-06-19",
  "status": "pending_avp"
}
```

---

## 11. API Specification: Get Site OE Transfer Requests

Retrieves all logged transfer mapping requests. Used by Regional Managers to track requests and by AVPs to action pending transfers.

### 1. Endpoint: `GET /api/mapping/transfers`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Accessible by Roles: `rm`, `avp`.

### 3. Query Parameters:
| Parameter Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| status | String | No | Filter requests by status (`pending_avp`, `verified_avp`, `rejected_avp`). |

### 4. Response Structure: Array of transfer request objects.

### 5. Example JSON Response:
```json
[
  {
    "id": "REQ_MAPPING_2004",
    "siteId": "SITE_003",
    "siteName": "Wipro Hinjewadi Campus",
    "siteCode": "WIPRO-PUN-01",
    "previousOE": "Ravi Shankar",
    "assignedOE": "Kiran Nair",
    "assignedRM": "Suresh Kumar",
    "requestedDate": "2026-06-19",
    "status": "pending_avp",
    "avpRemarks": null
  }
]
```

---

## 12. API Specification: Approve/Reject Site OE Transfer Request

Triggered when the AVP Operations reviews and signs off on a pending mapping request.

### 1. Endpoint: `PUT /api/mapping/transfers/{requestId}`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to Role: `avp`.

### 3. Request Body: A JSON object with the following structure:
| Field Name | Data Type | Required | Notes/Validation |
| :--- | :--- | :--- | :--- |
| status | String | Yes | Action status decision (`verified_avp` for approve, `rejected_avp` for reject). |
| remarks | String | Yes | Remarks explanation explaining the approval or rejection. |

### 4. Example JSON Payload:
```json
{
  "status": "verified_avp",
  "remarks": "Approved. Kiran Nair has taken over the portfolio."
}
```

### 5. Response Structure: A JSON object with the following structure on success:
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| id | String | Request identifier. |
| status | String | Updated request status (`verified_avp` or `rejected_avp`). |
| avpRemarks | String | Logged review remarks. |
| message | String | Execution feedback message. |

### 6. Example JSON Response (Success):
```json
{
  "id": "REQ_MAPPING_2004",
  "status": "verified_avp",
  "avpRemarks": "Approved. Kiran Nair has taken over the portfolio.",
  "message": "Transfer request approved. Master site database OE mapping has been updated."
}
```

---

## 13. API Specification: Get Operational Tasks (Role-Based Queue Filter)

This API retrieves the list of concrete operational tasks. Because the system manages tasks across multiple roles with a multi-tier review flow (OE, HR, Procurement, RM, ZH, AVP, BH, DR), this endpoint uses role-based routing query parameters to slice and filter tasks into specific actionable queues.

### 1. Endpoint: `GET /api/tasks`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Accessible by Roles: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`, `hr`, `procurement`, `commerical`, `hod`, `hr_dr`.

### 3. Query Parameters:
| Parameter Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| role | String | Yes | The role of the user querying the queue (`oe`, `rm`, `zh`, `avp`, `bh`, `dr`, `hr`, `procurement`, etc.). |
| username | String | Yes | Name or identifier of the user (used to filter geographical assignments). |
| status | String | No | Filter by explicit workflow status. |
| siteId | String | No | Filter tasks by a specific Site ID. |
| frequency | String | No | Filter tasks by frequency (`daily`, `weekly`, `fortnightly`, `monthly`, `one-time`). |
| dateStr | String | No | Filter tasks by due date (`YYYY-MM-DD`). |

### 4. Backend Queue Filtering Logic:
When `role` and `username` are supplied, the backend filters the master tasks array as follows:
1. **Operations Executive (`role=oe`)**:
   * Returns tasks where the template's `assignedRoles` includes `OE`, `assignedTo === username`, and the task `status` is `pending`, `in_progress`, or `rejected`.
2. **Regional Manager (`role=rm`)**:
   * Returns tasks where `status` is `oe_submitted` (or `submitted` with `rmRating` undefined), the template contains `rm` in its `approvalFlow`, and the site's `assignedRM === username`.
3. **Zonal Head (`role=zh`)**:
   * Returns tasks where `status` is `rm_approved`, the template contains `zh` in its `approvalFlow`, and the site's `assignedZH === username`.
4. **AVP Operations (`role=avp`)**:
   * Returns tasks where `status` is `zh_approved` (or `submitted` with `rmRating`/`zhRating` defined but `avpRating` undefined), the template contains `avp` in its `approvalFlow`, and the site's `assignedAVP === username`.
5. **Business Head (`role=bh`)**:
   * Returns tasks where `status` is `avp_approved` and `bhRating` is undefined (Business Head approvals are national/multi-region).
6. **Operations Director (`role=dr`)**:
   * Returns tasks where `status` is `bh_approved` and `drRating` is undefined.
7. **Support/Non-OE Roles (`hr`, `procurement`, `commerical`, `hod`, etc.)**:
   * Returns tasks where the template's `assignedRoles` matches the querying role (e.g. `hrbp` or `procurement`), and the task `status` is `submitted`, `pending`, `in_progress`, or `rejected`.

### 5. Response Structure: Array of objects with the following structure:
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| id | String | Unique task instance identifier. |
| templateId | String | Associated master template identifier. |
| taskName | String | Name of the task template. |
| category | String | Task category group. |
| frequency | String | Recurrence frequency interval. |
| weightage | Number | Assessment weight/score allocation. |
| dueDate | String | Task completion deadline (`YYYY-MM-DD`). |
| siteId | String | Site location identifier. |
| siteName | String | Resolved name of the site. |
| clientName | String | Resolved client company name. |
| status | String | Current task workflow status. |
| assignedTo | String | The Operations Executive/Staff assigned to execute the task. |
| oeRating | Number | Self-rating submitted by the OE. |
| rmRating | Number | First-tier review rating by RM. |
| zhRating | Number | Second-tier review rating by ZH. |
| avpRating | Number | Third-tier review rating by AVP. |
| bhRating | Number | Fourth-tier approval rating by BH. |
| drRating | Number | Final approval rating by DR. |
| evidenceCount | Number | Count of uploaded proof attachments. |

### 6. Example JSON Response (RM Queue - `role=rm` & `username=Suresh Kumar`):
```json
[
  {
    "id": "TSK_1001",
    "templateId": "TPL-ATT-001",
    "taskName": "Absent Report",
    "category": "Attendance Verification",
    "frequency": "daily",
    "weightage": 5,
    "dueDate": "2026-06-20",
    "siteId": "SITE_003",
    "siteName": "Wipro Hinjewadi Campus",
    "clientName": "Wipro Technologies",
    "status": "oe_submitted",
    "assignedTo": "Ravi Shankar",
    "oeRating": 5,
    "oeRemarks": "Reliever Ramesh Yadav deployed for absent staff.",
    "oeSubmittedDate": "2026-06-20",
    "evidenceCount": 1
  }
]
```

---

## 14. API Specification: Trigger Operational Task Generation

This API triggers the system scheduler engine to dynamically instantiate compliance tasks for a specific date across active templates and sites based on target frequencies and roles.

### 1. Endpoint: `POST /api/tasks/generate`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to Role: `dr`, `bh` (or admin/system token).

### 3. Request Body: A JSON object containing:
| Field Name | Data Type | Required | Notes/Validation |
| :--- | :--- | :--- | :--- |
| dateStr | String | Yes | Target date string (`YYYY-MM-DD`) for which tasks are generated. |

### 4. Engine Processing & Generation Rules:
When triggered for a target date `T`:
1. The backend fetches all active **Sites** and active **ActivityTemplates** (the 36 final master compliance items).
2. For each site and each active template, the engine determines if a task should be generated for date `T` based on the template's **frequency**:
   * **Daily**: Generates a task for every calendar day.
   * **Weekly**: Generates a task on a fixed day of the week (e.g. every Saturday).
   * **Fortnightly**: Generates a task on fixed days of the month (e.g., the 1st and 15th).
   * **Monthly**: Generates a task once per calendar month (e.g., the 1st day of the month).
3. **Role Assignment Mapping**:
   * If the template's `assignedRoles` includes `OE`, it sets `assignedTo` to the site's `assignedOE` (from the site master record).
   * If the template is for general roles (e.g. `hrbp`, `procurement`), it assigns it to the designated regional representative.
4. **De-duplication Check**: If a task with the same `templateId` and `siteId` already exists for date `T`, the engine skips it to avoid duplicate tasks.
5. The generated tasks are created in the database with status `pending` (or rating `0` and status `pending` default).

### 5. Example JSON Payload:
```json
{
  "dateStr": "2026-06-20"
}
```

### 6. Response Structure: A JSON object summarizing generation statistics on success:
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| success | Boolean | Operations state confirmation. |
| dateStr | String | Target date. |
| generatedCount | Number | Count of newly created task instances. |
| message | String | Detail status message. |

### 7. Example JSON Response (Success):
```json
{
  "success": true,
  "dateStr": "2026-06-20",
  "generatedCount": 18,
  "message": "Task Generation Engine successfully instantiated 18 new performance tasks for date 2026-06-20."
}
```

---

## 15. API Specification: Submit Operational Task: Absent Report

This API is called when an Operations Executive (OE) submits the **Absent Report** dynamic compliance task (Template ID: `TPL-ATT-001`). The backend validates the inputs against the template's field schema and routes the task to the Regional Manager's review queue.

### 1. Endpoint: `POST /api/tasks/{taskId}/submit`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to Role: `oe`, `hrbp`.

### 3. Request Body (JSON Payload):
A JSON object with the following parameters:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Form fields matching the Absent Report schema. |
| formData.totalAbsent | Number | No | Read-only. Automatically populated by the backend based on the daily roster/attendance anomalies for the site on that date. |
| formData.absenceReason | String | Yes | Required if `totalAbsent` > 0. Must be one of: `Sick Leave`, `Approved Leave`, `Unapproved Leave`, `Personal Emergency`, `Salary Issue`, `Absconding`, `Resigned`, `Other`. |
| formData.employeeLeftFilledDate | String (Date) | No | Optional. Expected format `YYYY-MM-DD`. Recommended if reason is `Resigned` or `Absconding`. |
| formData.relieverDeployed | String | Yes | Must be `Yes` or `No`. |
| formData.relieverName | String | No | Required if `relieverDeployed` is `Yes`. Name of the reliever staff. |
| evidenceUrls | Array of Strings | Yes | Required if `totalAbsent` > 0. Must contain at least one valid image or PDF URL showing signed deployment verification. |
| oeRemarks | String | No | Submission notes or remarks from the OE. |
| oeRating | Number | Yes | Self-rating out of 5 (corresponds to template weightage). Must be between `0` and `5`. |

### 4. Validation Rules & Backend Processing Logic:
1. **Roster-based Auto-Calculated Absent Count**: The `totalAbsent` count is resolved automatically on the backend from the roster anomalies database for that site and date. 
2. **Attendance-to-Reason Match**: If the backend-resolved `totalAbsent` is greater than 0, `absenceReason` cannot be empty. If the resolved `totalAbsent` is 0, these parameters can be skipped or sent as `null`.
3. **Reliever Name Match**: If `relieverDeployed` is `"Yes"`, `relieverName` must not be blank.
4. **Evidence Requirement**: If the resolved `totalAbsent` is greater than 0, the `evidenceUrls` array must not be empty. If `totalAbsent` is 0, the evidence check is skipped.
5. **Self-Rating Range Check**: `oeRating` must be between `0` and `5`.
6. **State Transition**: On validation success, the task's state in the database changes:
   * `status` is set to `oe_submitted`.
   * `oeSubmittedDate` is stamped with the current date (`YYYY-MM-DD`).
   * The task is routed to the corresponding `assignedRM` queue for approval.

### 5. Example JSON Payload (With Absentees & Reliever Deployed):
```json
{
  "formData": {
    "totalAbsent": 2,
    "absenceReason": "Sick Leave",
    "employeeLeftFilledDate": null,
    "relieverDeployed": "Yes",
    "relieverName": "Ramesh Yadav"
  },
  "evidenceUrls": [
    "https://storage.company.com/evidences/absent_verification_SITE003_20260620.jpg"
  ],
  "oeRemarks": "Roster regularized. Deployed Ramesh Yadav as reliever for the morning shift.",
  "oeRating": 5
}
```

### 6. Example JSON Payload (No Absentees):
```json
{
  "formData": {
    "totalAbsent": 0,
    "absenceReason": null,
    "employeeLeftFilledDate": null,
    "relieverDeployed": "No",
    "relieverName": null
  },
  "evidenceUrls": [],
  "oeRemarks": "All staff present on shift. No absences to report.",
  "oeRating": 5
}
```

### 7. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "Absent Report task submitted successfully.",
  "task": {
    "id": "TSK_1001",
    "templateId": "TPL-ATT-001",
    "taskName": "Absent Report",
    "category": "Attendance Verification",
    "frequency": "daily",
    "weightage": 5,
    "dueDate": "2026-06-20",
    "siteId": "SITE_003",
    "siteName": "Wipro Hinjewadi Campus",
    "clientName": "Wipro Technologies",
    "status": "oe_submitted",
    "formData": {
      "totalAbsent": 2,
      "absenceReason": "Sick Leave",
      "employeeLeftFilledDate": null,
      "relieverDeployed": "Yes",
      "relieverName": "Ramesh Yadav"
    },
    "evidenceUrls": [
      "https://storage.company.com/evidences/absent_verification_SITE003_20260620.jpg"
    ],
    "evidenceCount": 1,
    "oeRemarks": "Roster regularized. Deployed Ramesh Yadav as reliever for the morning shift.",
    "oeRating": 5,
    "oeSubmittedDate": "2026-06-20"
  }
}
```

### 8. Example JSON Response (Error - 400 Bad Request):
```json
{
  "error": "Validation Error",
  "message": "Reliever Name is required when relieverDeployed is 'Yes'."
}
```

---

## 16. API Specification: Submit Operational Task: Reliever Report

This API is called when an Operations Executive (OE) submits the **Reliever Report** compliance task (Template ID: `TPL-ATT-002`). This report logs the verification of relief security/housekeeping staff deployed to cover roster gaps.

### 1. Endpoint: `POST /api/tasks/{taskId}/submit`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to Role: `oe`, `hrbp`.

### 3. Request Body (JSON Payload):
A JSON object with the following parameters:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Form fields matching the Reliever Report schema. |
| formData.relieverCount | Number | No | Read-only. Automatically computed by the backend based on the reliever deployments logged for the site on that date. |
| formData.rosterMatch | Boolean | Yes | Flag indicating whether the deployed relievers match roster schedules (`true` or `false`). |
| formData.relieverDetails | String | No | Text area containing remarks, names of relievers, or shift assignment notes. |
| evidenceUrls | Array of Strings | Yes | Required if `relieverCount` > 0. Must contain at least one valid image showing the reliever on shift. |
| oeRemarks | String | No | Custom remarks from the submitting officer. |
| oeRating | Number | Yes | Self-rating out of 5 (corresponds to template weightage). Must be between `0` and `5`. |

### 4. Validation Rules & Backend Processing Logic:
1. **Roster-based Auto-Calculated Reliever Count**: The `relieverCount` is automatically computed and verified on the backend based on resolved anomaly cases for the target site and date.
2. **Roster Match Flag**: The `rosterMatch` field must be a valid boolean (`true` or `false`).
3. **Evidence Validation**: If the backend-resolved `relieverCount` is greater than 0, `evidenceUrls` must contain at least one image showing the deployed reliever.
4. **Self-Rating Range Check**: `oeRating` must be between `0` and `5`.
5. **State Transition**: On success, the task's state in the database transitions:
   * `status` is set to `oe_submitted`.
   * `oeSubmittedDate` is set to the current date (`YYYY-MM-DD`).
   * The task is routed to the corresponding `assignedRM` queue for review.

### 5. Example JSON Payload (With Relievers Deployed):
```json
{
  "formData": {
    "relieverCount": 3,
    "rosterMatch": true,
    "relieverDetails": "Reliever guards (Ramesh Yadav, Vikram Singh) positioned at Gate 1 and Gate 2 as planned."
  },
  "evidenceUrls": [
    "https://storage.company.com/evidences/reliever_deployment_SITE003_20260620.jpg"
  ],
  "oeRemarks": "Relievers verified on site and matched roster scheduling.",
  "oeRating": 5
}
```

### 6. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "Reliever Report task submitted successfully.",
  "task": {
    "id": "TSK_1002",
    "templateId": "TPL-ATT-002",
    "taskName": "Reliever Report",
    "category": "Attendance Verification",
    "frequency": "daily",
    "weightage": 5,
    "dueDate": "2026-06-20",
    "siteId": "SITE_003",
    "siteName": "Wipro Hinjewadi Campus",
    "clientName": "Wipro Technologies",
    "status": "oe_submitted",
    "formData": {
      "relieverCount": 3,
      "rosterMatch": true,
      "relieverDetails": "Reliever guards (Ramesh Yadav, Vikram Singh) positioned at Gate 1 and Gate 2 as planned."
    },
    "evidenceUrls": [
      "https://storage.company.com/evidences/reliever_deployment_SITE003_20260620.jpg"
    ],
    "evidenceCount": 1,
    "oeRemarks": "Relievers verified on site and matched roster scheduling.",
    "oeRating": 5,
    "oeSubmittedDate": "2026-06-20"
  }
}
```

---

## 17. API Specification: Submit Operational Task: Non App Usage & Follow Up

This API is called when an Operations Executive (OE) submits the **Non App Usage & Follow Up** compliance task (Template ID: `TPL-ATT-003`). All metrics for this compliance task must be manually entered.

### 1. Endpoint: `POST /api/tasks/{taskId}/submit`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to Role: `oe`, `hrbp`.

### 3. Request Body (JSON Payload):
A JSON object with the following parameters:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Form fields matching the Non App Usage schema. |
| formData.nonAppCount | Number | Yes | Count of guards/staff not checking in via the mobile application. Must be $\ge 0$. |
| formData.reasonDescription | String | Yes | Required if `nonAppCount` > 0. Explanation of why staff are not utilizing the app. |
| formData.followUpCount | Number | Yes | Count of follow-ups conducted with staff to resolve check-in issues. Must be $\ge 0$. |
| formData.devicesRegistered | Number | Yes | Count of new staff devices registered/onboarded today. Must be $\ge 0$. |
| evidenceUrls | Array of Strings | Yes | Required if `nonAppCount` > 0. Must contain screenshot uploads of roster lists or follow-up logs. |
| oeRemarks | String | No | Custom remarks. |
| oeRating | Number | Yes | Self-rating out of 5 (corresponds to template weightage). Must be between `0` and `5`. |

### 4. Validation Rules & Backend Processing Logic:
1. **Manual Entry Required**: All numeric inputs (`nonAppCount`, `followUpCount`, `devicesRegistered`) must be positive integers ($\ge 0$).
2. **Details for Non-Compliance**: If `nonAppCount` is greater than 0, `reasonDescription` and at least one image or Excel URL in `evidenceUrls` must be supplied.
3. **Self-Rating Range Check**: `oeRating` must be between `0` and `5`.
4. **State Transition**: On success, the task status transitions:
   * `status` is set to `oe_submitted`.
   * `oeSubmittedDate` is set to the current date (`YYYY-MM-DD`).
   * The task is routed to the corresponding `assignedRM` review queue.

### 5. Example JSON Payload:
```json
{
  "formData": {
    "nonAppCount": 4,
    "reasonDescription": "Guards are facing network connectivity issues at the basement parking area.",
    "followUpCount": 6,
    "devicesRegistered": 2
  },
  "evidenceUrls": [
    "https://storage.company.com/evidences/non_app_followup_SITE003_20260620.xlsx"
  ],
  "oeRemarks": "Onboarded 2 new guards and resolved app issues for basement guards.",
  "oeRating": 4
}
```

### 6. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "Non App Usage & Follow Up task submitted successfully.",
  "task": {
    "id": "TSK_1003",
    "templateId": "TPL-ATT-003",
    "taskName": "Non App Usage & Follow Up",
    "category": "Attendance Verification",
    "frequency": "daily",
    "weightage": 5,
    "dueDate": "2026-06-20",
    "siteId": "SITE_003",
    "siteName": "Wipro Hinjewadi Campus",
    "clientName": "Wipro Technologies",
    "status": "oe_submitted",
    "formData": {
      "nonAppCount": 4,
      "reasonDescription": "Guards are facing network connectivity issues at the basement parking area.",
      "followUpCount": 6,
      "devicesRegistered": 2
    },
    "evidenceUrls": [
      "https://storage.company.com/evidences/non_app_followup_SITE003_20260620.xlsx"
    ],
    "evidenceCount": 1,
    "oeRemarks": "Onboarded 2 new guards and resolved app issues for basement guards.",
    "oeRating": 4,
    "oeSubmittedDate": "2026-06-20"
  }
}
```

---

## 18. API Specification: Submit Operational Task: Attendance Submission

This API is called when an Operations Executive (OE) submits the **Attendance Submission** compliance task (Template ID: `TPL-ATT-004`). This is a monthly task used to upload reconciled attendance sheets for client billing.

### 1. Endpoint: `POST /api/tasks/{taskId}/submit`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to Role: `oe`, `hrbp`.

### 3. Request Body (JSON Payload):
A JSON object with the following parameters:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Form fields matching the Attendance Submission schema. |
| formData.salaryMonth | String | Yes | Read-only. The target salary month of submission (e.g. `"June 2026"`), automatically populated from the task due date. |
| formData.reconciled | Boolean | Yes | Must be `true` to confirm that attendance figures have been reconciled and signed off by the client. |
| evidenceUrls | Array of Strings | Yes | Required. Must contain at least one valid PDF or Excel file URL representing the signed/reconciled billing log. |
| oeRemarks | String | No | Custom remarks. |
| oeRating | Number | Yes | Self-rating out of 5 (corresponds to template weightage). Must be between `0` and `5`. |

### 4. Validation Rules & Backend Processing Logic:
1. **Reconciliation Confirmation**: The `reconciled` parameter must be checked (`true`). Submission will fail if `reconciled` is `false`.
2. **Dynamic Month Verification**: The `salaryMonth` must match the billing period resolved from the task's due date.
3. **Mandatory Evidence Upload**: At least one file URL (PDF or Excel) must be attached in `evidenceUrls`.
4. **Self-Rating Range Check**: `oeRating` must be between `0` and `5`.
5. **State Transition**: On validation success:
   * `status` is set to `oe_submitted`.
   * `oeSubmittedDate` is set to the current date (`YYYY-MM-DD`).
   * The task is routed to the corresponding `assignedRM` review queue.

### 5. Example JSON Payload:
```json
{
  "formData": {
    "salaryMonth": "June 2026",
    "reconciled": true
  },
  "evidenceUrls": [
    "https://storage.company.com/evidences/reconciled_attendance_SITE003_202606.pdf"
  ],
  "oeRemarks": "Attendance sheet verified and signed off by client Sunita Rao.",
  "oeRating": 5
}
```

### 6. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "Attendance Submission task submitted successfully.",
  "task": {
    "id": "TSK_1004",
    "templateId": "TPL-ATT-004",
    "taskName": "Attendance Submission",
    "category": "Attendance Verification",
    "frequency": "monthly",
    "weightage": 5,
    "dueDate": "2026-06-05",
    "siteId": "SITE_003",
    "siteName": "Wipro Hinjewadi Campus",
    "clientName": "Wipro Technologies",
    "status": "oe_submitted",
    "formData": {
      "salaryMonth": "June 2026",
      "reconciled": true
    },
    "evidenceUrls": [
      "https://storage.company.com/evidences/reconciled_attendance_SITE003_202606.pdf"
    ],
    "evidenceCount": 1,
    "oeRemarks": "Attendance sheet verified and signed off by client Sunita Rao.",
    "oeRating": 5,
    "oeSubmittedDate": "2026-06-20"
  }
}
```

---

## 19. API Specification: Submit Operational Task: Leave Approval

This API is called when an Operations Executive (OE) submits the **Leave Approval** task (Template ID: `TPL-ATT-005`). This weekly task reconciles external leave approvals by logging individual employee leave details and verifying roster adjustments in this system.

### 1. Endpoint: `POST /api/tasks/{taskId}/submit`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to Role: `oe`, `hrbp`.

### 3. Request Body (JSON Payload):
A JSON object with the following parameters:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Form fields matching the Leave Approval schema. |
| formData.leavesList | Array of Objects | Yes | Array of logged leaves. Must contain at least one item. |
| formData.leavesList[].employeeId | String | Yes | Unique Employee ID (linked to the employee master). |
| formData.leavesList[].reason | String | Yes | Leave reason: `Sick Leave`, `Casual Leave`, `Earned/Privilege Leave`, `Leave Without Pay (LWP)`, `Emergency / Other`. |
| formData.leavesList[].date | String (Date) | Yes | Target leave date in `YYYY-MM-DD` format. |
| formData.rosterReconciled | Boolean | Yes | Must be `true` to confirm that shift scheduling has been updated to cover all logged leaves. |
| evidenceUrls | Array of Strings | Yes | Required. Must contain at least one PDF showing leave certificates, ledger sheets, or HRMS export files. |
| oeRemarks | String | No | Custom remarks. |
| oeRating | Number | Yes | Self-rating out of 5 (corresponds to template weightage). Must be between `0` and `5`. |

### 4. Validation Rules & Backend Processing Logic:
1. **Roster Reconciliation Match**: `rosterReconciled` must be explicitly checked as `true`. Submission fails if `false`.
2. **List Integrity**: `leavesList` must contain at least one object. Each item in the array must contain valid non-empty values for `employeeId`, `reason`, and `date`.
3. **Evidence Requirement**: At least one file URL (PDF format) must be attached in `evidenceUrls` as proof of the leave approval ledger.
4. **Self-Rating Range Check**: `oeRating` must be between `0` and `5`.
5. **State Transition**: On validation success:
   * `status` is set to `oe_submitted`.
   * `oeSubmittedDate` is set to the current date (`YYYY-MM-DD`).
   * The task is routed to the corresponding `assignedRM` review queue.

### 5. Example JSON Payload:
```json
{
  "formData": {
    "leavesList": [
      { "employeeId": "EMP1001", "reason": "Sick Leave", "date": "2026-06-12" },
      { "employeeId": "EMP1003", "reason": "Casual Leave", "date": "2026-06-14" }
    ],
    "rosterReconciled": true
  },
  "evidenceUrls": [
    "https://storage.company.com/evidences/leave_approvals_SITE003_week24.pdf"
  ],
  "oeRemarks": "Approved leaves logged. Relief guards have been aligned on the shift roster.",
  "oeRating": 5
}
```

### 6. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "Leave Approval task submitted successfully.",
  "task": {
    "id": "TSK_1005",
    "templateId": "TPL-ATT-005",
    "taskName": "Leave Approval",
    "category": "Attendance Verification",
    "frequency": "weekly",
    "weightage": 5,
    "dueDate": "2026-06-14",
    "siteId": "SITE_003",
    "siteName": "Wipro Hinjewadi Campus",
    "clientName": "Wipro Technologies",
    "status": "oe_submitted",
    "formData": {
      "leavesList": [
        { "employeeId": "EMP1001", "reason": "Sick Leave", "date": "2026-06-12" },
        { "employeeId": "EMP1003", "reason": "Casual Leave", "date": "2026-06-14" }
      ],
      "rosterReconciled": true
    },
    "evidenceUrls": [
      "https://storage.company.com/evidences/leave_approvals_SITE003_week24.pdf"
    ],
    "evidenceCount": 1,
    "oeRemarks": "Approved leaves logged. Relief guards have been aligned on the shift roster.",
    "oeRating": 5,
    "oeSubmittedDate": "2026-06-20"
  }
}
```

---

## 20. API Specification: Submit Operational Task: Missing In-Out Time

This API is called when an Operations Executive (OE) submits the **Missing In-Out Time** compliance task (Template ID: `TPL-ATT-006`). This weekly task tracks and regularizes records with incomplete clock-in/out timestamps.

### 1. Endpoint: `POST /api/tasks/{taskId}/submit`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to Role: `oe`, `hrbp`.

### 3. Request Body (JSON Payload):
A JSON object with the following parameters:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Form fields matching the Missing In-Out Time schema. |
| formData.missingRecordsCount | Number | Yes | The count of incomplete records for the week. Auto-calculated. |
| formData.regularizations | Object | Yes | Map of regularization records where key is the `attendanceRecordId` and value is an object containing `approvedTime`. |
| formData.regularizations.{recordId}.approvedTime | String | Yes (if records > 0) | The approved clock-in/out timestamp (e.g. `09:00 AM`, `05:30 PM`). |
| formData.regularized | Boolean | Yes | Must be `true` (if `missingRecordsCount > 0`) to confirm that all incomplete records have been regularized. |
| evidenceUrls | Array of Strings | Yes | Required. Must contain at least one string containing a file URL representing signature sheets or approval proof. |
| oeRemarks | String | No | Custom remarks. |
| oeRating | Number | Yes | Self-rating out of 5 (corresponds to template weightage). Must be between `0` and `5`. |

### 4. Validation Rules & Backend Processing Logic:
1. **Regularization Integrity**: If `missingRecordsCount > 0`, the `regularized` checkbox must be `true`. If `missingRecordsCount === 0`, `regularized` can be `true` or skipped.
2. **Details Completeness**: If `missingRecordsCount > 0`, each record in the weekly range must have a valid non-empty `approvedTime` populated in the `regularizations` object.
3. **Evidence Requirement**: At least one file URL (Image/PDF format showing signature/approval) must be attached in `evidenceUrls` as proof.
4. **Self-Rating Range Check**: `oeRating` must be between `0` and `5`.
5. **State Transition**: On validation success:
   * `status` is set to `oe_submitted`.
   * `oeSubmittedDate` is set to the current date (`YYYY-MM-DD`).
   * The task is routed to the corresponding `assignedRM` review queue.

### 5. Example JSON Payload:
```json
{
  "formData": {
    "missingRecordsCount": 2,
    "regularizations": {
      "ATT_012": {
        "approvedTime": "05:30 PM"
      },
      "ATT_013": {
        "approvedTime": "09:00 AM"
      }
    },
    "regularized": true
  },
  "evidenceUrls": [
    "https://storage.company.com/evidences/signature_sheet_SITE003_week24.pdf"
  ],
  "oeRemarks": "Both biometric anomalies for this week have been reconciled and verified.",
  "oeRating": 5
}
```

### 6. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "Missing In-Out Time task submitted successfully.",
  "task": {
    "id": "TASK_0006",
    "templateId": "TPL-ATT-006",
    "taskName": "Missing In-Out Time",
    "category": "Attendance Verification",
    "frequency": "weekly",
    "weightage": 5,
    "dueDate": "2026-06-12",
    "siteId": "SITE_003",
    "siteName": "Wipro Hinjewadi Campus",
    "clientName": "Wipro Technologies",
    "status": "oe_submitted",
    "formData": {
      "missingRecordsCount": 2,
      "regularizations": {
        "ATT_012": {
          "approvedTime": "05:30 PM"
        },
        "ATT_013": {
          "approvedTime": "09:00 AM"
        }
      },
      "regularized": true
    },
    "evidenceUrls": [
      "https://storage.company.com/evidences/signature_sheet_SITE003_week24.pdf"
    ],
    "evidenceCount": 1,
    "oeRemarks": "Both biometric anomalies for this week have been reconciled and verified.",
    "oeRating": 5,
    "oeSubmittedDate": "2026-06-20"
  }
}
```

---

## 21. API Specification: Submit Operational Task: Regularization

This API is called when an Operations Executive (OE) submits the **Regularization** compliance task (Template ID: `TPL-ATT-007`). This weekly task tracks attendance regularizations completed on the external biometric portal.

### 1. Endpoint: `POST /api/tasks/{taskId}/submit`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to Role: `oe`, `hrbp`.

### 3. Request Body (JSON Payload):
A JSON object with the following parameters:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Form fields matching the Regularization schema. |
| formData.regularizationsEvidence | Object | Yes | Map where key is the `attendanceRecordId` (from the weekly site exceptions) and value is the uploaded screenshot file name. |
| formData.clientApproved | Boolean | Yes | Must be `true` (if exception records > 0) to confirm client approval and countersign check. |
| evidenceUrls | Array of Strings | Yes | Required. Must contain at least one string containing a file URL representing overall task proof. |
| oeRemarks | String | No | Custom remarks. |
| oeRating | Number | Yes | Self-rating out of 5 (corresponds to template weightage). Must be between `0` and `5`. |

### 4. Validation Rules & Backend Processing Logic:
1. **Approval Confirmation**: `clientApproved` must be explicitly checked as `true` (if exceptions > 0). Submission fails if `false`.
2. **Evidence Completeness**: If exception records are found for the week, each record ID must have a valid non-empty screenshot file name mapping in the `regularizationsEvidence` object.
3. **Evidence Requirement**: At least one file URL (Image/PDF format showing client approval) must be attached in `evidenceUrls` as task-level verification.
4. **Self-Rating Range Check**: `oeRating` must be between `0` and `5`.
5. **State Transition**: On validation success:
   * `status` is set to `oe_submitted`.
   * `oeSubmittedDate` is set to the current date (`YYYY-MM-DD`).
   * The task is routed to the corresponding `assignedRM` review queue.

### 5. Example JSON Payload:
```json
{
  "formData": {
    "regularizationsEvidence": {
      "ATT_041": "screenshot_suresh.png",
      "ATT_042": "screenshot_anita.png"
    },
    "clientApproved": true
  },
  "evidenceUrls": [
    "https://storage.company.com/evidences/client_approval_SITE003_week24.pdf"
  ],
  "oeRemarks": "Regularized employee logs mapped with individual screenshot evidence attached.",
  "oeRating": 5
}
```

### 6. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "Regularization task submitted successfully.",
  "task": {
    "id": "TASK_0007",
    "templateId": "TPL-ATT-007",
    "taskName": "Regularization",
    "category": "Attendance Verification",
    "frequency": "weekly",
    "weightage": 5,
    "dueDate": "2026-06-12",
    "siteId": "SITE_003",
    "siteName": "Wipro Hinjewadi Campus",
    "clientName": "Wipro Technologies",
    "status": "oe_submitted",
    "formData": {
      "regularizationsEvidence": {
        "ATT_041": "screenshot_suresh.png",
        "ATT_042": "screenshot_anita.png"
      },
      "clientApproved": true
    },
    "evidenceUrls": [
      "https://storage.company.com/evidences/client_approval_SITE003_week24.pdf"
    ],
    "evidenceCount": 1,
    "oeRemarks": "Regularized employee logs mapped with individual screenshot evidence attached.",
    "oeRating": 5,
    "oeSubmittedDate": "2026-06-20"
  }
}
```

---

## 22. API Specification: Submit Operational Task: Site Visit Report (Two-Phase Workflow)

This specification details the two-phase workflow required to complete the **Site Visit Report** operational task (Template ID: `TPL-OPS-001`).

1. **Phase 1 (Presence Verification)**: Verifies that the Operations Executive (OE) is physically present at the site coordinates before accessing the audit form.
2. **Phase 2 (Report Submission)**: Submits the 11-section site visit audit report with pre-filled check-in coordinates.

---

### PHASE 1: Verify Presence at Site Location

Before displaying the Site Visit Report form, the client calls this endpoint with the user's GPS coordinates to clear the site's geofence boundaries.

#### 1. Endpoint: `POST /api/tasks/{taskId}/verify-presence`

#### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to Role: `oe`, `rm`.

#### 3. Request Body (JSON Payload):
A JSON object with the following parameters:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| lat | Number | Yes | Current GPS latitude coordinate. |
| lng | Number | Yes | Current GPS longitude coordinate. |

#### 4. Validation Rules & Backend Processing Logic:
1. **Target Site Lookup**: Resolve the task by `taskId` to fetch the associated `siteId` and retrieve the site's mapped geofence coordinates from the site master database (e.g. `lat: 28.4595, lng: 77.0266` for Wipro Hinjewadi Campus).
2. **Haversine Distance Check**: Compute the distance in meters between the submitted user coordinates and the site's center coordinates using the standard Haversine formula (Earth radius: 6,371,000 meters).
3. **Geofence Radius Check**:
   * If the distance $D \le 100$ meters, return `verified: true`.
   * If the distance $D > 100$ meters, return `verified: false` along with the calculated distance.
4. **State Persistence**: On successful check-in ($D \le 100$), register the check-in time and date stamp in the task audit logs (`presenceVerified: true` and `checkInTime` / `checkInDistance`).

#### 5. Example JSON Payload:
```json
{
  "lat": 28.4594,
  "lng": 77.0267
}
```

#### 6. Example JSON Response (Success - Geofence Cleared):
```json
{
  "success": true,
  "verified": true,
  "distance": 15.4,
  "message": "Presence verified successfully. You are within the 100m geofence radius (15.4m from center) of Wipro Hinjewadi Campus."
}
```

#### 7. Example JSON Response (Error - Outside Geofence):
```json
{
  "success": true,
  "verified": false,
  "distance": 342.7,
  "message": "Verification failed. You are outside the required geofence radius. Calculated distance: 342.7m from Wipro Hinjewadi Campus."
}
```

#### 8. Example JSON Response (Error - 400 Bad Request):
```json
{
  "error": "Validation Error",
  "message": "Latitude and longitude coordinates are required."
}
```

---

### PHASE 2: Submit Site Visit Report Details

Once presence is verified in Phase 1, the client pre-fills the captured check-in coordinates and displays the 11-section form. Upon form completion, this endpoint submits the final report details.

#### 1. Endpoint: `POST /api/tasks/{taskId}/submit`

#### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to Role: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`.

#### 3. Request Body (JSON Payload):
A JSON object with the following parameters:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Form fields matching the Site Visit Report schema. |
| formData.visitType | String | Yes | Must be one of: `routine`, `surprise`, `complaint`, `followup`, `new_site`. |
| formData.gpsLocation | Object or null | Yes | Pre-filled GPS coordinates captured during the Phase 1 presence verification step. |
| formData.qualityRatings | Object | Yes | Section 2: Ratings for various site parameters. Rating scale: `1` (Poor) to `5` (Excellent). |
| formData.qualityRatings.overallCleanliness | Number | Yes | Rating for overall cleanliness. |
| formData.qualityRatings.workstationCondition | Number | Yes | Rating for workstation condition. |
| formData.qualityRatings.cabinCleanliness | Number | Yes | Rating for cabin cleanliness. |
| formData.qualityRatings.washroomCleanliness | Number | Yes | Rating for washroom cleanliness. |
| formData.qualityRatings.officeEntranceCondition | Number | Yes | Rating for office entrance. |
| formData.qualityRatings.glassCleaning | Number | Yes | Rating for glass cleaning. |
| formData.qualityRatings.furnitureChairCondition | Number | Yes | Rating for furniture/chair condition. |
| formData.qualityRatings.housekeepingStandards | Number | Yes | Rating for general housekeeping standards. |
| formData.observations | Array of Strings | Yes | Checked observation anomalies. Values can include: `cobwebs`, `doormat_not_maintained`, `broken_fittings`, `dust_accumulation`, `stains_spillage`, or `none`. |
| formData.siteQualityScore | Number | Yes | Dynamic calculated quality score (0 to 100). |
| formData.hkAssessment | Object | Yes | Section 3: Housekeeping employee assessment. |
| formData.hkAssessment.associateMet | Boolean | Yes | Whether the housekeeping associate was met. |
| formData.hkAssessment.standards | Object | Yes (if met) | Standards/Checklist indicators. |
| formData.hkAssessment.standards.wearingUniform | Boolean | Yes (if met) | True if associate is wearing uniform. |
| formData.hkAssessment.standards.hasTwoUniforms | Boolean | Yes (if met) | True if associate has two uniforms. |
| formData.hkAssessment.standards.wearingSafetyShoes | Boolean | Yes (if met) | True if wearing safety shoes. |
| formData.hkAssessment.standards.wearingIdCard | Boolean | Yes (if met) | True if wearing ID card. |
| formData.hkAssessment.standards.groomingMaintained | Boolean | Yes (if met) | True if grooming standards are maintained. |
| formData.hkAssessment.knowledge | Object | Yes (if met) | Knowledge ratings scale: `1` (Poor) to `5` (Excellent). |
| formData.hkAssessment.knowledge.chemicalKnowledge | Number | Yes (if met) | Knowledge of chemicals. |
| formData.hkAssessment.knowledge.dilutionRatioKnowledge | Number | Yes (if met) | Knowledge of dilution ratios. |
| formData.hkAssessment.knowledge.washroomCleaningProcedure | Number | Yes (if met) | Knowledge of washroom cleaning. |
| formData.hkAssessment.knowledge.machineryUsageKnowledge | Number | Yes (if met) | Knowledge of machinery usage. |
| formData.hkAssessment.discipline | Object | Yes (if met) | Discipline/App checks. |
| formData.hkAssessment.discipline.attendanceMarkedInApp | Boolean | Yes (if met) | True if attendance marked in app. |
| formData.hkAssessment.discipline.leaveReportingUnderstood | Boolean | Yes (if met) | True if leave reporting process is understood. |
| formData.hkAssessment.discipline.materialReceivedOnTime | Boolean | Yes (if met) | True if materials were received on time. |
| formData.materialAvailability | String | Yes | Section 4: Material stocks. One of: `fully_available`, `low_stock`, `critical_shortage`. |
| formData.equipmentStatus | String | Yes | Section 4: Equipment health. One of: `fully_functional`, `minor_issue`, `major_breakdown`. |
| formData.equipmentIssue | Object | No | Mandatory if status is `minor_issue` or `major_breakdown`. |
| formData.equipmentIssue.equipmentName | String | No | Name of the faulty equipment. |
| formData.equipmentIssue.issueDescription | String | No | Description of the issue. |
| formData.equipmentIssue.photoUrl | String | No | Optional URL of the issue evidence photo. |
| formData.trainingTopics | Array of Strings | Yes | Section 5: List of training topics. Values: `chemical_usage`, `chemical_dilution`, `washroom_cleaning`, `cabin_cleaning`, `workstation_cleaning`, `open_area_cleaning`, `lobby_cleaning`, `machinery_usage`, `mobile_app_usage`, `grooming_hygiene`. |
| formData.trainingConducted | Boolean | Yes | True if training was conducted. |
| formData.trainingRemarks | String | No | Training summary (max 100 characters). Required if `trainingConducted` is `true`. |
| formData.clientFeedback | Object | Yes | Section 6: Client / Branch Manager feedback details. |
| formData.clientFeedback.clientMet | Boolean | Yes | True if client/branch manager was met. |
| formData.clientFeedback.staffAppearance | Number | Yes (if met) | Star rating for staff appearance (1-5). |
| formData.clientFeedback.behaviourEtiquette | Number | Yes (if met) | Star rating for staff behavior (1-5). |
| formData.clientFeedback.groomingStandards | Number | Yes (if met) | Star rating for grooming (1-5). |
| formData.clientFeedback.hygieneStandards | Number | Yes (if met) | Star rating for hygiene (1-5). |
| formData.clientFeedback.materialQualityFeedback | String | Yes (if met) | Feedback scale: `excellent`, `good`, `average`, `poor`, or `""`. |
| formData.clientFeedback.serviceQualityFeedback | String | Yes (if met) | Feedback scale: `excellent`, `good`, `average`, `poor`, or `""`. |
| formData.clientFeedback.clientRemark | String | No | Remarks from client (max 150 characters). |
| formData.photos | Array of Objects | Yes | Section 7: List of photo records. Minimum of 3 mandatory categories must be provided. |
| formData.photos[].id | String | Yes | Unique ID of the photo record. |
| formData.photos[].category | String | Yes | Photo category: `site_overview`, `washroom`, `hk_staff`, `store_room`, `equipment`, `issues`, `before_after`. |
| formData.photos[].fileName | String | Yes | Uploaded file name. |
| formData.photos[].isMandatory | Boolean | Yes | True if it was a mandatory photo category. |
| formData.issuesIdentified | Array of Strings | Yes | Section 8: Site issues. Values: `staff_shortage`, `material_shortage`, `equipment_breakdown`, `attendance_issue`, `uniform_noncompliance`, `grooming_issue`, `client_complaint`, `safety_concern`, `cleaning_quality`, `other`. |
| formData.correctiveActions | Array of Objects | Yes | Section 9: List of action items. Mandatory if issues are identified. |
| formData.correctiveActions[].id | String | Yes | Unique ID for the action. |
| formData.correctiveActions[].issue | String | Yes | Description of the issue. |
| formData.correctiveActions[].assignedTo | String | Yes | Target assignee name. |
| formData.correctiveActions[].priority | String | Yes | Priority: `high`, `medium`, `low`. |
| formData.correctiveActions[].targetClosureDate | String (Date) | Yes | Expected resolution date in `YYYY-MM-DD` format. |
| formData.correctiveActions[].status | String | Yes | Progress: `open`, `in_progress`, `closed`. |
| formData.positiveRecognition | String | Yes | Section 10: Good performance highlights (max 150 characters). |
| formData.finalSiteStatus | String | Yes | Section 11: General status. One of: `excellent`, `good`, `needs_improvement`, `critical`. |
| formData.supervisorRemarks | String | No | Supervisor comments (max 250 characters). Required if `siteQualityScore` < 75 OR `clientFeedback.serviceQualityFeedback` is `'poor'` OR `finalSiteStatus` is `'critical'`. |
| formData.hkAssessmentScore | Number | Yes | Dynamic HK assessment score (0 to 100). |
| formData.trainingCoverageScore | Number | Yes | Dynamic training coverage score (0 to 100). |
| formData.overallSiteHealthScore | Number | Yes | Dynamic overall health score (0 to 100). |
| evidenceUrls | Array of Strings | Yes | File URLs corresponding to the uploaded photos. |
| oeRemarks | String | No | Submission remarks (defaults to supervisorRemarks or positiveRecognition). |
| oeRating | Number | Yes | Self-rating out of 5, computed as `round((overallSiteHealthScore / 100) * template.weightage)`. |

#### 4. Validation Rules & Backend Processing Logic:

1. **Pre-Check-In Verification**: The backend validates that site presence check-in logs (`presenceVerified: true` and a valid check-in timestamp) exist for the task. The `gpsLocation` field is pre-filled from this pre-verification step.
2. **Quality Rating Average Check**: The backend verifies `siteQualityScore` by averaging the 8 parameters inside `qualityRatings` (each rated 1 to 5) and scaling the result to a percentage (0% to 100%).
3. **HK Assessment Score Check**: If `hkAssessment.associateMet` is `true`, HK assessment score is calculated by taking the percentage of passed standards checks (5 parameters) and discipline checks (3 parameters) out of the 8 total checks. If `associateMet` is `false`, HK assessment score is set to `0`.
4. **Training Coverage Check**: If `trainingConducted` is `true`, training coverage score is calculated as the percentage of training topics discussed (count of topics in `trainingTopics` out of 10 total topics) and `trainingRemarks` must not be blank. If `trainingConducted` is `false`, score is `0`.
5. **Overall Site Health Score Calculation**: The backend verifies `overallSiteHealthScore` as a weighted score calculated as: 50% Quality Score + 30% HK Assessment Score + 20% Training Coverage Score.
6. **Mandatory Photo Count**: The `photos` array must contain at least 3 mandatory photo objects corresponding to categories: `site_overview`, `washroom`, and `hk_staff`.
7. **Mandatory Equipment Info**: If `equipmentStatus` is `"minor_issue"` or `"major_breakdown"`, the `equipmentIssue` object must not be null and both `equipmentName` and `issueDescription` must not be empty.
8. **Positive Recognition Requirement**: The field `positiveRecognition` must not be empty and must be under 150 characters.
9. **Supervisor Remarks Validation**: `supervisorRemarks` must not be blank if:
   * `siteQualityScore` < 75, or
   * `clientFeedback.serviceQualityFeedback` is `"poor"`, or
   * `finalSiteStatus` is `"critical"`.
10. **OE Self-Rating Calculation**: `oeRating` must equal `round((overallSiteHealthScore / 100) * template.weightage)`.
11. **State Transition**: On validation success:
    * `status` is set to `oe_submitted`.
    * `oeSubmittedDate` is set to the current date (`YYYY-MM-DD`).
    * The task is routed to the corresponding `assignedRM` review queue.

#### 5. Example JSON Payload:
```json
{
  "formData": {
    "visitType": "routine",
    "gpsLocation": {
      "lat": 28.4595,
      "lng": 77.0266
    },
    "qualityRatings": {
      "overallCleanliness": 4,
      "workstationCondition": 4,
      "cabinCleanliness": 5,
      "washroomCleanliness": 3,
      "officeEntranceCondition": 4,
      "glassCleaning": 4,
      "furnitureChairCondition": 4,
      "housekeepingStandards": 4
    },
    "observations": [
      "dust_accumulation"
    ],
    "siteQualityScore": 80,
    "hkAssessment": {
      "associateMet": true,
      "standards": {
        "wearingUniform": true,
        "hasTwoUniforms": true,
        "wearingSafetyShoes": true,
        "wearingIdCard": true,
        "groomingMaintained": true
      },
      "knowledge": {
        "chemicalKnowledge": 4,
        "dilutionRatioKnowledge": 4,
        "washroomCleaningProcedure": 4,
        "machineryUsageKnowledge": 3
      },
      "discipline": {
        "attendanceMarkedInApp": true,
        "leaveReportingUnderstood": true,
        "materialReceivedOnTime": true
      }
    },
    "materialAvailability": "fully_available",
    "equipmentStatus": "minor_issue",
    "equipmentIssue": {
      "equipmentName": "Auto Scrubber",
      "issueDescription": "Squeegee attachment loose, needs adjustment.",
      "photoUrl": "https://storage.company.com/evidences/scrubber_issue_SITE003.jpg"
    },
    "trainingTopics": [
      "chemical_usage",
      "chemical_dilution",
      "washroom_cleaning"
    ],
    "trainingConducted": true,
    "trainingRemarks": "Conducted brief refresher on chemical dilution ratios with HK team.",
    "clientFeedback": {
      "clientMet": true,
      "staffAppearance": 4,
      "behaviourEtiquette": 5,
      "groomingStandards": 4,
      "hygieneStandards": 4,
      "materialQualityFeedback": "good",
      "serviceQualityFeedback": "good",
      "clientRemark": "Operations are stable, no major issues."
    },
    "photos": [
      {
        "id": "PHT_001",
        "category": "site_overview",
        "fileName": "site_overview_1234.jpg",
        "isMandatory": true
      },
      {
        "id": "PHT_002",
        "category": "washroom",
        "fileName": "washroom_1234.jpg",
        "isMandatory": true
      },
      {
        "id": "PHT_003",
        "category": "hk_staff",
        "fileName": "hk_staff_1234.jpg",
        "isMandatory": true
      }
    ],
    "issuesIdentified": [
      "attendance_issue"
    ],
    "correctiveActions": [
      {
        "id": "CA_12345",
        "issue": "Staff attendance lag in the morning shift",
        "assignedTo": "Suresh Babu",
        "priority": "medium",
        "targetClosureDate": "2026-06-25",
        "status": "open"
      }
    ],
    "positiveRecognition": "HK team demonstrated good dilution ratio knowledge.",
    "finalSiteStatus": "good",
    "supervisorRemarks": "",
    "hkAssessmentScore": 100,
    "trainingCoverageScore": 30,
    "overallSiteHealthScore": 76
  },
  "evidenceUrls": [
    "https://storage.company.com/evidences/site_overview_1234.jpg",
    "https://storage.company.com/evidences/washroom_1234.jpg",
    "https://storage.company.com/evidences/hk_staff_1234.jpg"
  ],
  "oeRemarks": "Site audit completed. Overall health is satisfactory, minor auto scrubber squeegee issue reported.",
  "oeRating": 4
}
```

#### 6. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "Site Visit Report task submitted successfully.",
  "task": {
    "id": "TASK_SVR_001",
    "templateId": "TPL-OPS-001",
    "taskName": "Site Visit Report",
    "category": "Site Operations",
    "frequency": "daily",
    "weightage": 5,
    "dueDate": "2026-06-20",
    "siteId": "SITE_003",
    "siteName": "Wipro Hinjewadi Campus",
    "clientName": "Wipro Technologies",
    "status": "oe_submitted",
    "formData": {
      "visitType": "routine",
      "gpsLocation": {
        "lat": 28.4595,
        "lng": 77.0266
      },
      "qualityRatings": {
        "overallCleanliness": 4,
        "workstationCondition": 4,
        "cabinCleanliness": 5,
        "washroomCleanliness": 3,
        "officeEntranceCondition": 4,
        "glassCleaning": 4,
        "furnitureChairCondition": 4,
        "housekeepingStandards": 4
      },
      "observations": [
        "dust_accumulation"
      ],
      "siteQualityScore": 80,
      "hkAssessment": {
        "associateMet": true,
        "standards": {
          "wearingUniform": true,
          "hasTwoUniforms": true,
          "wearingSafetyShoes": true,
          "wearingIdCard": true,
          "groomingMaintained": true
        },
        "knowledge": {
          "chemicalKnowledge": 4,
          "dilutionRatioKnowledge": 4,
          "washroomCleaningProcedure": 4,
          "machineryUsageKnowledge": 3
        },
        "discipline": {
          "attendanceMarkedInApp": true,
          "leaveReportingUnderstood": true,
          "materialReceivedOnTime": true
        }
      },
      "materialAvailability": "fully_available",
      "equipmentStatus": "minor_issue",
      "equipmentIssue": {
        "equipmentName": "Auto Scrubber",
        "issueDescription": "Squeegee attachment loose, needs adjustment.",
        "photoUrl": "https://storage.company.com/evidences/scrubber_issue_SITE003.jpg"
      },
      "trainingTopics": [
        "chemical_usage",
        "chemical_dilution",
        "washroom_cleaning"
      ],
      "trainingConducted": true,
      "trainingRemarks": "Conducted brief refresher on chemical dilution ratios with HK team.",
      "clientFeedback": {
        "clientMet": true,
        "staffAppearance": 4,
        "behaviourEtiquette": 5,
        "groomingStandards": 4,
        "hygieneStandards": 4,
        "materialQualityFeedback": "good",
        "serviceQualityFeedback": "good",
        "clientRemark": "Operations are stable, no major issues."
      },
      "photos": [
        {
          "id": "PHT_001",
          "category": "site_overview",
          "fileName": "site_overview_1234.jpg",
          "isMandatory": true
        },
        {
          "id": "PHT_002",
          "category": "washroom",
          "fileName": "washroom_1234.jpg",
          "isMandatory": true
        },
        {
          "id": "PHT_003",
          "category": "hk_staff",
          "fileName": "hk_staff_1234.jpg",
          "isMandatory": true
        }
      ],
      "issuesIdentified": [
        "attendance_issue"
      ],
      "correctiveActions": [
        {
          "id": "CA_12345",
          "issue": "Staff attendance lag in the morning shift",
          "assignedTo": "Suresh Babu",
          "priority": "medium",
          "targetClosureDate": "2026-06-25",
          "status": "open"
        }
      ],
      "positiveRecognition": "HK team demonstrated good dilution ratio knowledge.",
      "finalSiteStatus": "good",
      "supervisorRemarks": "",
      "hkAssessmentScore": 100,
      "trainingCoverageScore": 30,
      "overallSiteHealthScore": 76
    },
    "evidenceUrls": [
      "https://storage.company.com/evidences/site_overview_1234.jpg",
      "https://storage.company.com/evidences/washroom_1234.jpg",
      "https://storage.company.com/evidences/hk_staff_1234.jpg"
    ],
    "evidenceCount": 3,
    "oeRemarks": "Site audit completed. Overall health is satisfactory, minor auto scrubber squeegee issue reported.",
    "oeRating": 4,
    "oeSubmittedDate": "2026-06-20"
  }
}
```

#### 7. Example JSON Response (Error - 400 Bad Request):
```json
{
  "error": "Validation Error",
  "message": "Please upload at least 3 mandatory photos (Site Overview, Washroom, HK Staff)."
}
```

---
## 23. API Specification: Final Closing Report Submission (Three-Phase Workflow)

This specification details the three-phase workflow required to complete the **Final Closing Report** query resolution task (Template ID: `TPL-OPS-003`).

1. **Phase 1 (Check Site Visit Status)**: Verifies that the Site Visit Report has been completed and submitted, and checks if the current date is within the 7-day allowed submission window.
2. **Phase 2 (Fetch Open Queries)**: Retrieves the list of open corrective action queries generated during the site visit once Phase 1 status verification is successful.
3. **Phase 3 (Submit Query Resolutions)**: Submits the resolved queries list along with necessary remarks and photo evidence to complete the Final Closing Report.

---

### PHASE 1: Check Site Visit Status

Before displaying or loading any data, the client checks if the corresponding Site Visit Report (`TPL-OPS-001`) task is completed and within the 7-day limit.

#### 1. Endpoint: `GET /api/tasks/{taskId}/site-visit-status`

#### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to Role: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`.

#### 3. Request Parameters:
* **Path Parameter**:
  - `taskId` (String): Mapped taskId of the Final Closing Report task (`TPL-OPS-003`).

#### 4. Backend Processing Logic:
1. **Resolve Site ID**: Identify the `siteId` associated with the Final Closing Report task `taskId`.
2. **Find Site Visit Task**: Locate the corresponding Site Visit Report task (`TPL-OPS-001`) for the resolved `siteId`.
3. **Check Completion**: Check if the Site Visit Report task's status is `oe_submitted`, `submitted`, or approved. If not completed, set `isCompleted: false`.
4. **Enforce 7-Day Window**:
   - If completed, parse its done date (`oeSubmittedDate` or `dueDate`).
   - Calculate `daysElapsed = currentMockDate - visitDoneDate`.
   - Set `isExpired: true` if `daysElapsed > 7`, otherwise `isExpired: false`.

#### 5. Example JSON Response (Success - Site Visit Complete & Active):
```json
{
  "success": true,
  "isCompleted": true,
  "visitDate": "2026-06-15",
  "daysElapsed": 5,
  "isExpired": false
}
```

#### 6. Example JSON Response (Success - Site Visit Incomplete):
```json
{
  "success": true,
  "isCompleted": false,
  "visitDate": null,
  "daysElapsed": 0,
  "isExpired": false
}
```

#### 7. Example JSON Response (Success - Site Visit Complete but Expired):
```json
{
  "success": true,
  "isCompleted": true,
  "visitDate": "2026-06-10",
  "daysElapsed": 10,
  "isExpired": true
}
```

---

### PHASE 2: Fetch Open Queries for Final Closing

If Phase 1 check returns `isCompleted: true` and `isExpired: false`, the client requests the open queries/corrective actions list.

#### 1. Endpoint: `GET /api/tasks/{taskId}/open-queries`

#### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to Role: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`.

#### 3. Request Parameters:
* **Path Parameter**:
  - `taskId` (String): Mapped taskId of the Final Closing Report task (`TPL-OPS-003`).

#### 4. Validation Rules & Backend Processing Logic:
1. **Pre-verification**: Enforce Phase 1 checks. If the Site Visit is not completed, return `400 Bad Request` (see Error Response 2). If expired, return `400 Bad Request` or `403 Forbidden` (see Error Response 1).
2. **Fetch Open Corrective Actions**: Retrieve the `correctiveActions` array from the completed Site Visit Report task. Filter and return actions where status is `'open'` or `'in_progress'`.

#### 5. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "queries": [
    {
      "id": "CA_12345",
      "issue": "Staff attendance lag in the morning shift",
      "assignedTo": "Suresh Babu",
      "priority": "medium",
      "targetClosureDate": "2026-06-25",
      "status": "open"
    }
  ]
}
```

#### 6. Example JSON Response (Error - 400 Bad Request - Expired):
```json
{
  "error": "Task Expired",
  "message": "Access denied. The Final Closing Report must be opened and completed within 7 days from the Site Visit done date (Site Visit Date: 2026-06-10)."
}
```

#### 7. Example JSON Response (Error - 400 Bad Request - Site Visit Not Completed):
```json
{
  "error": "Validation Error",
  "message": "The Site Visit Report for this site has not been completed yet."
}
```

---

### PHASE 3: Submit Final Closing Report

After fetching the queries, the user fills out resolutions and submits the final report.

#### 1. Endpoint: `POST /api/tasks/{taskId}/submit`

#### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to Role: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`.

#### 3. Request Body (JSON Payload):
A JSON object with the following parameters:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Form fields matching the Final Closing Report schema. |
| formData.originalSiteVisitTaskId | String | Yes | Mapped taskId of the original Site Visit Report task (`TPL-OPS-001`). |
| formData.visitDate | String | Yes | Mapped submission date of the original Site Visit Report task (`YYYY-MM-DD` or `DD/MM/YYYY`). |
| formData.queryResolutions | Array of Objects | Yes | List of mapped query resolution checks. |
| formData.queryResolutions[].actionId | String | Yes | Action ID matching the corrective action item. |
| formData.queryResolutions[].issue | String | Yes | Mapped issue description. |
| formData.queryResolutions[].assignedTo | String | Yes | Name of the assignee responsible for resolution. |
| formData.queryResolutions[].resolutionStatus | String | Yes | Status of the query. One of: `resolved`, `unresolved`. |
| formData.queryResolutions[].resolutionRemarks | String | Yes | Explanatory remarks. Mandatory if status is `unresolved`. |
| formData.queryResolutions[].evidencePhotoId | String | No | Optional unique ID of the uploaded resolution evidence photo (mandatory if status is `resolved`). |
| formData.overallStatus | String | Yes | Aggregated resolution status. One of: `fully_resolved`, `partially_resolved`, `unresolved`. |
| formData.closingRemarks | String | No | General comments and remarks (max 250 characters). |

#### 4. Validation Rules & Backend Processing Logic:
1. **Expiration & Done Check**: Re-validate that the original Site Visit is completed and within the 7-day window.
2. **Unresolved Remarks Check**: If any query resolution status is `"unresolved"`, the corresponding `resolutionRemarks` must not be empty.
3. **Evidence Photo Check**: If `resolutionStatus` is `"resolved"`, an `evidencePhotoId` must be supplied to prove resolution.
4. **State Transition**: On successful validation:
   - `status` is set to `oe_submitted`.
   - The task is routed to the corresponding manager's review queue.

#### 5. Example JSON Payload:
```json
{
  "formData": {
    "originalSiteVisitTaskId": "TASK_SVR_001",
    "visitDate": "2026-06-15",
    "queryResolutions": [
      {
        "actionId": "CA_12345",
        "issue": "Staff attendance lag in the morning shift",
        "assignedTo": "Suresh Babu",
        "resolutionStatus": "resolved",
        "resolutionRemarks": "Additional buffer guard deployed for morning shift cover.",
        "evidencePhotoId": "PHT_1718932626910"
      }
    ],
    "overallStatus": "fully_resolved",
    "closingRemarks": "All site visit corrective action queries have been addressed."
  }
}
```

#### 6. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "Final Closing Report task submitted successfully.",
  "task": {
    "id": "TASK_FCR_001",
    "templateId": "TPL-OPS-003",
    "taskName": "Final closing report of the queries(sitewise)",
    "category": "Site Operations",
    "status": "oe_submitted",
    "oeSubmittedDate": "2026-06-20",
    "formData": {
      "originalSiteVisitTaskId": "TASK_SVR_001",
      "visitDate": "2026-06-15",
      "queryResolutions": [
        {
          "actionId": "CA_12345",
          "issue": "Staff attendance lag in the morning shift",
          "assignedTo": "Suresh Babu",
          "resolutionStatus": "resolved",
          "resolutionRemarks": "Additional buffer guard deployed for morning shift cover.",
          "evidencePhotoId": "PHT_1718932626910"
        }
      ],
      "overallStatus": "fully_resolved",
      "closingRemarks": "All site visit corrective action queries have been addressed."
    }
  }
}
```

#### 7. Example JSON Response (Error - 400 Bad Request - Expired):
```json
{
  "error": "Task Expired",
  "message": "The Final Closing Report can only be submitted within 7 days from the Site Visit done date (Site Visit Date: 2026-06-10)."
}
```

#### 8. Example JSON Response (Error - 400 Bad Request - Site Visit Not Done):
```json
{
  "error": "Validation Error",
  "message": "The Site Visit Report for this site must be completed and submitted first."
}
```

---

## 24. API Specification: Submit Operational Task: Minutes of Meeting (MOM) Report

This API is called when a supervisor submits the **Minutes of Meeting (MOM) Report** monthly task (Template ID: `TPL-REP-001`). The backend validates the inputs against the MOM form schema and routes the task to the Regional Manager's review queue.

### 1. Endpoint: `POST /api/tasks/{taskId}/submit`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to Role: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`.

### 3. Request Body (JSON Payload):
A JSON object with the following parameters:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Form fields matching the MOM Report schema. |
| formData.meetingDate | String | Yes | Date of the meeting (`YYYY-MM-DD`). |
| formData.clientRepName | String | Yes | Name of the client representative met. |
| formData.clientDesignation | String | Yes | Designation of the client representative. |
| formData.clientMet | Boolean | Yes | Flag indicating whether the client was met (`true` or `false`). |
| formData.sentiment | String | Yes (if clientMet is true) | Client sentiment. One of: `very_happy`, `satisfied`, `neutral`, `concerned`, `escalated`. |
| formData.topics | Array of Strings | No | Discussion topics discussed. Choices: `service_quality`, `cleaning_standards`, `manpower`, `attendance`, `material_availability`, `equipment_issues`, `complaint_followup`, `additional_requirement`, `contract_commercial`, `other`. |
| formData.issuesRaised | Boolean | Yes (if clientMet is true) | Whether the client raised any concerns. |
| formData.issues | Array of Strings | No | Details of issues raised. Choices: `cleaning_quality`, `attendance`, `staff_behaviour`, `material_shortage`, `equipment_breakdown`, `safety_concern`, `service_delay`, `other`. |
| formData.actionRequired | Boolean | Yes (if clientMet is true) | Whether follow-up action is required. |
| formData.actionItems | Array of Objects | No | List of required action items. |
| formData.actionItems[].id | String | Yes | Unique ID of the action item. |
| formData.actionItems[].description | String | Yes | Description of what needs to be done. |
| formData.actionItems[].assignedTo | String | Yes | Person assigned. |
| formData.actionItems[].targetDate | String | Yes | Target completion date (`YYYY-MM-DD`). |
| formData.actionItems[].priority | String | Yes | Priority level (`high`, `medium`, `low`). |
| formData.actionItems[].status | String | Yes | Status of the item (`open`, `closed`). |
| formData.opportunityDiscussed | Boolean | Yes (if clientMet is true) | Whether business opportunities were discussed. |
| formData.opportunity | Object | No | Opportunity details. |
| formData.opportunity.types | Array of Strings | No | Opportunity areas. Choices: `additional_manpower`, `deep_cleaning`, `facade_cleaning`, `pest_control`, `landscaping`, `pantry_services`, `technical_services`, `other`. |
| formData.opportunity.value | String | No | Opportunity value level (`low`, `medium`, `high`, or `""`). |
| formData.summary | String | Yes (if clientMet is true) | General summary of the discussion (max 200 characters). |
| formData.followupRequired | Boolean | Yes (if clientMet is true) | Whether follow-up meeting is required. |
| formData.followupDate | String | No | Date of the follow-up meeting (`YYYY-MM-DD`). |
| formData.outcome | String | Yes (if clientMet is true) | Overall outcome of the meeting. One of: `no_action`, `action_plan_created`, `escalation_required`, `business_opportunity`. |
| oeRemarks | String | No | Custom remarks from the submitting supervisor. |
| oeRating | Number | Yes | Self-rating out of 5. Must be between `0` and `5`. |

### 4. Validation Rules & Backend Processing Logic:
1. **Client Interaction Gating**: If `clientMet` is `false`, the fields `sentiment`, `issues`, `actionItems`, `opportunity`, `summary`, and `outcome` can be empty or set to defaults. If `clientMet` is `true`, validations below are enforced.
2. **Sentiment & Outcome Check**: If `clientMet` is `true`, the `sentiment` and `outcome` fields must not be empty.
3. **Action Items Check**: If `clientMet` is `true` and `actionRequired` is `true`, `actionItems` must contain at least one item.
4. **Summary Length**: The `summary` text must not exceed 200 characters.
5. **Self-Rating Range Check**: `oeRating` must be between `0` and `5`.
6. **State Transition**: On validation success:
   - The task's `status` transitions to `oe_submitted`.
   - The task's `oeSubmittedDate` is stamped with the current date.
   - The task is routed to the Regional Manager's review queue.

### 5. Example JSON Payload (Client Met with Action Items):
```json
{
  "formData": {
    "meetingDate": "2026-06-20",
    "clientRepName": "Mr. Rajesh Sharma",
    "clientDesignation": "Facility Manager",
    "clientMet": true,
    "sentiment": "satisfied",
    "topics": ["service_quality", "manpower"],
    "issuesRaised": true,
    "issues": ["attendance"],
    "actionRequired": true,
    "actionItems": [
      {
        "id": "ACT_1718932626910",
        "description": "Deploy reliever guard for morning shift cover",
        "assignedTo": "Suresh Babu",
        "targetDate": "2026-06-25",
        "priority": "high",
        "status": "open"
      }
    ],
    "opportunityDiscussed": true,
    "opportunity": {
      "types": ["deep_cleaning"],
      "value": "medium"
    },
    "summary": "Monthly review meeting completed. Discussed manpower attendance and scheduled a deep cleaning activity.",
    "followupRequired": true,
    "followupDate": "2026-07-20",
    "outcome": "action_plan_created"
  },
  "oeRemarks": "Meeting went well, client raised concern on morning attendance which was regularized.",
  "oeRating": 5
}
```

### 6. Example JSON Payload (Client Not Met):
```json
{
  "formData": {
    "meetingDate": "2026-06-20",
    "clientRepName": "",
    "clientDesignation": "",
    "clientMet": false,
    "sentiment": "",
    "topics": [],
    "issuesRaised": false,
    "issues": [],
    "actionRequired": false,
    "actionItems": [],
    "opportunityDiscussed": false,
    "opportunity": {
      "types": [],
      "value": ""
    },
    "summary": "",
    "followupRequired": false,
    "followupDate": "",
    "outcome": ""
  },
  "oeRemarks": "Client representative was out of office. No meeting conducted.",
  "oeRating": 3
}
```

### 7. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "MOM Report task submitted successfully.",
  "task": {
    "id": "TSK_MOM_001",
    "templateId": "TPL-REP-001",
    "taskName": "MOM Report",
    "category": "Reporting & Closure",
    "status": "oe_submitted",
    "oeSubmittedDate": "2026-06-20",
    "formData": {
      "meetingDate": "2026-06-20",
      "clientRepName": "Mr. Rajesh Sharma",
      "clientDesignation": "Facility Manager",
      "clientMet": true,
      "sentiment": "satisfied",
      "topics": ["service_quality", "manpower"],
      "issuesRaised": true,
      "issues": ["attendance"],
      "actionRequired": true,
      "actionItems": [
        {
          "id": "ACT_1718932626910",
          "description": "Deploy reliever guard for morning shift cover",
          "assignedTo": "Suresh Babu",
          "targetDate": "2026-06-25",
          "priority": "high",
          "status": "open"
        }
      ],
      "opportunityDiscussed": true,
      "opportunity": {
        "types": ["deep_cleaning"],
        "value": "medium"
      },
      "summary": "Monthly review meeting completed. Discussed manpower attendance and scheduled a deep cleaning activity.",
      "followupRequired": true,
      "followupDate": "2026-07-20",
      "outcome": "action_plan_created"
    }
  }
}
```

### 8. Example JSON Response (Error - 400 Bad Request):
```json
{
  "error": "Validation Error",
  "message": "Please add at least one action item, or select No for Action Required."
}
```

---

## 25. API Specification: Get MOM Report Data (Read-Only Summary)

This API is called when a reviewer (RM, ZH, AVP, BH, DR) opens a submitted MOM Report task to view the full meeting summary before approving or rejecting it.

### 1. Endpoint: `GET /api/tasks/{taskId}`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Accessible by Roles: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`.

### 3. Request Parameters:
* **Path Parameter**:
  - `taskId` (String): The unique task identifier of the MOM Report task.

### 4. Backend Processing Logic:
1. **Resolve Task**: Look up the task by `taskId`. Verify it exists and its `templateId` is `TPL-REP-001`.
2. **Authorization Check**: Verify the requesting user's role is in the task's approval chain or is the original submitter.
3. **Return Full Task Object**: Return the complete task record including all `formData` fields, ratings from each tier, and evidence metadata.

### 5. Response Structure:

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| id | String | Task identifier. |
| templateId | String | `TPL-REP-001`. |
| taskName | String | `MOM Report`. |
| category | String | `Reporting & Closure`. |
| frequency | String | `monthly`. |
| weightage | Number | Template weightage (5). |
| dueDate | String | Task due date (`YYYY-MM-DD`). |
| siteId | String | Site identifier. |
| siteName | String | Site name. |
| clientName | String | Client company name. |
| status | String | Current workflow status. |
| assignedTo | String | OE/Supervisor who submitted the report. |
| formData | Object | Complete MOM Report form data (all 10 sections). |
| formData.meetingDate | String | Meeting date. |
| formData.clientRepName | String | Client representative name. |
| formData.clientDesignation | String | Client representative designation. |
| formData.clientMet | Boolean | Whether client was met. |
| formData.sentiment | String | Client sentiment value. |
| formData.topics | Array of Strings | Discussion topics. |
| formData.issuesRaised | Boolean | Whether issues were raised. |
| formData.issues | Array of Strings | Issues raised. |
| formData.actionRequired | Boolean | Whether action is required. |
| formData.actionItems | Array of Objects | Action items list. |
| formData.opportunityDiscussed | Boolean | Whether opportunity was discussed. |
| formData.opportunity | Object | Opportunity details. |
| formData.summary | String | Meeting summary text. |
| formData.followupRequired | Boolean | Whether follow-up is needed. |
| formData.followupDate | String | Follow-up date. |
| formData.outcome | String | Meeting outcome. |
| oeRating | Number | OE self-rating. |
| oeRemarks | String | OE remarks. |
| oeSubmittedDate | String | OE submission date. |
| rmRating | Number (Nullable) | RM review rating. |
| rmRemarks | String (Nullable) | RM review remarks. |
| zhRating | Number (Nullable) | ZH review rating. |
| avpRating | Number (Nullable) | AVP review rating. |
| bhRating | Number (Nullable) | BH review rating. |
| drRating | Number (Nullable) | DR final rating. |

### 6. Example JSON Response (Success - 200 OK):
```json
{
  "id": "TSK_MOM_001",
  "templateId": "TPL-REP-001",
  "taskName": "MOM Report",
  "category": "Reporting & Closure",
  "frequency": "monthly",
  "weightage": 5,
  "dueDate": "2026-06-20",
  "siteId": "SITE_003",
  "siteName": "Wipro Hinjewadi Campus",
  "clientName": "Wipro Technologies",
  "status": "oe_submitted",
  "assignedTo": "Ravi Shankar",
  "formData": {
    "meetingDate": "2026-06-20",
    "clientRepName": "Mr. Rajesh Sharma",
    "clientDesignation": "Facility Manager",
    "clientMet": true,
    "sentiment": "satisfied",
    "topics": ["service_quality", "manpower"],
    "issuesRaised": true,
    "issues": ["attendance"],
    "actionRequired": true,
    "actionItems": [
      {
        "id": "ACT_1718932626910",
        "description": "Deploy reliever guard for morning shift cover",
        "assignedTo": "Suresh Babu",
        "targetDate": "2026-06-25",
        "priority": "high",
        "status": "open"
      }
    ],
    "opportunityDiscussed": true,
    "opportunity": {
      "types": ["deep_cleaning"],
      "value": "medium"
    },
    "summary": "Monthly review meeting completed. Discussed manpower attendance and scheduled a deep cleaning activity.",
    "followupRequired": true,
    "followupDate": "2026-07-20",
    "outcome": "action_plan_created"
  },
  "oeRating": 5,
  "oeRemarks": "Meeting went well, client raised concern on morning attendance which was regularized.",
  "oeSubmittedDate": "2026-06-20",
  "rmRating": null,
  "rmRemarks": null,
  "zhRating": null,
  "avpRating": null,
  "bhRating": null,
  "drRating": null
}
```

### 7. Example JSON Response (Client Not Met - Summary):
```json
{
  "id": "TSK_MOM_002",
  "templateId": "TPL-REP-001",
  "taskName": "MOM Report",
  "category": "Reporting & Closure",
  "status": "oe_submitted",
  "assignedTo": "Ravi Shankar",
  "formData": {
    "meetingDate": "2026-06-20",
    "clientRepName": "",
    "clientDesignation": "",
    "clientMet": false,
    "sentiment": "",
    "topics": [],
    "issuesRaised": false,
    "issues": [],
    "actionRequired": false,
    "actionItems": [],
    "opportunityDiscussed": false,
    "opportunity": { "types": [], "value": "" },
    "summary": "",
    "followupRequired": false,
    "followupDate": "",
    "outcome": ""
  },
  "oeRating": 3,
  "oeRemarks": "Client representative was out of office. No meeting conducted.",
  "oeSubmittedDate": "2026-06-20"
}
```

---

## 26. API Specification: Save MOM Report Draft

This API is called when a supervisor saves a partially filled MOM Report as a draft to continue editing later. The task remains in `in_progress` status and is not routed to the review queue.

### 1. Endpoint: `PUT /api/tasks/{taskId}/draft`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to Role: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`.

### 3. Request Body (JSON Payload):
A JSON object with the following parameters:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Partial or complete form fields matching the MOM Report schema (same structure as API 24 `formData`). All fields are optional since the form may be incomplete. |
| oeRemarks | String | No | Partial remarks or notes from the supervisor. |

### 4. Validation Rules & Backend Processing Logic:
1. **No Field Validation**: Since this is a draft save, no mandatory field checks are enforced. The backend stores whatever data is sent.
2. **State Transition**: The task's `status` is set to `in_progress`.
3. **No Routing**: The task is NOT routed to any review queue.

### 5. Example JSON Payload:
```json
{
  "formData": {
    "meetingDate": "2026-06-20",
    "clientRepName": "Mr. Rajesh Sharma",
    "clientDesignation": "Facility Manager",
    "clientMet": true,
    "sentiment": "satisfied",
    "topics": ["service_quality"],
    "issuesRaised": false,
    "issues": [],
    "actionRequired": false,
    "actionItems": [],
    "opportunityDiscussed": false,
    "opportunity": { "types": [], "value": "" },
    "summary": "",
    "followupRequired": false,
    "followupDate": "",
    "outcome": ""
  },
  "oeRemarks": "Draft - still filling sections 7-10."
}
```

### 6. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "MOM Report draft saved successfully.",
  "task": {
    "id": "TSK_MOM_001",
    "templateId": "TPL-REP-001",
    "status": "in_progress"
  }
}
```

---

## 27. API Specification: Review/Approve MOM Report (Multi-Tier)

This API is called when a reviewer (RM, ZH, AVP, BH, or DR) reviews a submitted MOM Report task and either approves it (advancing to the next tier) or rejects it (returning to the OE for revision).

### 1. Endpoint: `PUT /api/tasks/{taskId}/review`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to the reviewer role matching the current approval stage.

### 3. Request Body (JSON Payload):

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| action | String | Yes | Review decision. One of: `approve`, `reject`. |
| rating | Number | Yes | Reviewer's score (0 to template weightage, i.e. 0–5 for MOM). |
| remarks | String | Yes (if action is `reject`) | Explanation of the review decision. Mandatory for rejections. |

### 4. Validation Rules & Backend Processing Logic:
1. **Rating Range Check**: `rating` must be between `0` and the template's `weightage` (5 for MOM).
2. **Rejection Remarks**: If `action` is `reject`, `remarks` must not be empty.
3. **Role-Based Status Transition (Approve)**:
   - **RM approves** → `rmRating` set, `rmRemarks` logged, `rmReviewedDate` stamped, `status` → `rm_approved`. Task advances to ZH queue.
   - **ZH approves** → `zhRating` set, `zhRemarks` logged, `zhReviewedDate` stamped, `status` → `zh_approved`. Task advances to AVP queue.
   - **AVP approves** → `avpRating` set, `avpRemarks` logged, `avpApprovedDate` stamped, `status` → `avp_approved`. Task advances to BH queue.
   - **BH approves** → `bhRating` set, `bhRemarks` logged, `bhApprovedDate` stamped, `status` → `bh_approved`. Task advances to DR queue.
   - **DR approves** → `drRating` set, `drRemarks` logged, `drApprovedDate` stamped, `status` → `approved`. Task is fully closed.
4. **Role-Based Status Transition (Reject)**:
   - Any reviewer rejects → `status` → `rejected`, `remarks` logged. Task is returned to the OE for revision.

### 5. Example JSON Payload (RM Approves):
```json
{
  "action": "approve",
  "rating": 4,
  "remarks": "Good meeting coverage. Action items well documented."
}
```

### 6. Example JSON Payload (ZH Rejects):
```json
{
  "action": "reject",
  "rating": 2,
  "remarks": "Business opportunity section is incomplete. Please revisit with client and fill opportunity details."
}
```

### 7. Example JSON Response (Success - Approved):
```json
{
  "success": true,
  "message": "MOM Report approved. Task advanced to ZH review queue.",
  "task": {
    "id": "TSK_MOM_001",
    "templateId": "TPL-REP-001",
    "status": "rm_approved",
    "rmRating": 4,
    "rmRemarks": "Good meeting coverage. Action items well documented.",
    "rmReviewedDate": "2026-06-21"
  }
}
```

### 8. Example JSON Response (Success - Rejected):
```json
{
  "success": true,
  "message": "MOM Report returned to OE for revision.",
  "task": {
    "id": "TSK_MOM_001",
    "templateId": "TPL-REP-001",
    "status": "rejected",
    "remarks": "Business opportunity section is incomplete. Please revisit with client and fill opportunity details."
  }
}
```

### 9. Example JSON Response (Error - 400 Bad Request):
```json
{
  "error": "Validation Error",
  "message": "Remarks are required when rejecting a task."
}
```

---

## 28. API Specification: Get Absent Report Data (Read-Only)

This API retrieves the full record of a submitted **Absent Report** task (`TPL-ATT-001`) for read-only viewing by reviewers or the original submitter.

### 1. Endpoint: `GET /api/tasks/{taskId}`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Accessible by Roles: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`.

### 3. Request Parameters:
* `taskId` (Path, String): The unique task identifier.

### 4. Backend Processing Logic:
1. Look up the task by `taskId`. Verify `templateId` is `TPL-ATT-001`.
2. Verify the requesting user is the task `assignedTo` or holds a role in the approval chain.
3. Return the full task record with all `formData`, tier ratings, remarks, and evidence.

### 5. Example JSON Response (Success - 200 OK):
```json
{
  "id": "TSK_1001",
  "templateId": "TPL-ATT-001",
  "taskName": "Absent Report",
  "category": "Attendance Verification",
  "frequency": "daily",
  "weightage": 5,
  "dueDate": "2026-06-20",
  "siteId": "SITE_003",
  "siteName": "Wipro Hinjewadi Campus",
  "clientName": "Wipro Technologies",
  "status": "rm_approved",
  "assignedTo": "Ravi Shankar",
  "formData": {
    "totalAbsent": 2,
    "absenceReason": "Sick Leave",
    "employeeLeftFilledDate": null,
    "relieverDeployed": "Yes",
    "relieverName": "Ramesh Yadav"
  },
  "evidenceUrls": [
    "https://storage.company.com/evidences/absent_verification_SITE003_20260620.jpg"
  ],
  "evidenceCount": 1,
  "oeRating": 5,
  "oeRemarks": "Roster regularized. Deployed Ramesh Yadav as reliever.",
  "oeSubmittedDate": "2026-06-20",
  "rmRating": 4,
  "rmRemarks": "Verified reliever deployment. Good compliance.",
  "rmReviewedDate": "2026-06-21",
  "zhRating": null,
  "zhRemarks": null,
  "avpRating": null,
  "bhRating": null,
  "drRating": null,
  "finalScore": null
}
```

---

## 29. API Specification: Save Absent Report Draft

Saves a partially filled **Absent Report** as a draft. Task stays `in_progress` and is not routed to reviewers.

### 1. Endpoint: `PUT /api/tasks/{taskId}/draft`

### 2. Authorization:
* Protected Route. Restricted to the task `assignedTo` user.

### 3. Request Body (JSON Payload):

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Partial Absent Report fields. No mandatory checks enforced. |
| oeRemarks | String | No | Draft notes. |

### 4. Validation Rules:
1. No mandatory field validation — accepts partial data.
2. `status` set to `in_progress`. Not routed.

### 5. Example JSON Payload:
```json
{
  "formData": {
    "totalAbsent": 2,
    "absenceReason": "Sick Leave",
    "relieverDeployed": "Yes",
    "relieverName": ""
  },
  "oeRemarks": "Draft - confirming reliever name."
}
```

### 6. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "Absent Report draft saved successfully.",
  "task": { "id": "TSK_1001", "templateId": "TPL-ATT-001", "status": "in_progress" }
}
```

---

## 30. API Specification: Review/Approve Absent Report (Multi-Tier)

Reviewer (RM/ZH/AVP/BH/DR) approves or rejects a submitted **Absent Report** task.

### 1. Endpoint: `PUT /api/tasks/{taskId}/review`

### 2. Authorization:
* Protected Route. Restricted to the reviewer role matching the current approval stage.
  - `rm` reviews `oe_submitted` → `zh` reviews `rm_approved` → `avp` reviews `zh_approved` → `bh` reviews `avp_approved` → `dr` reviews `bh_approved`

### 3. Request Body (JSON Payload):

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| action | String | Yes | `approve` or `reject`. |
| rating | Number | Yes | Score 0–5 (template weightage). |
| remarks | String | Yes (if reject) | Mandatory for rejections. |

### 4. Status Transitions:
* **Approve**: RM→`rm_approved`, ZH→`zh_approved`, AVP→`avp_approved`, BH→`bh_approved`, DR→`approved` (task closed, `finalScore` computed).
* **Reject**: Any tier → `rejected`. Task returned to OE.

### 5. Example JSON Payload (RM Approves):
```json
{ "action": "approve", "rating": 4, "remarks": "Reliever deployment verified." }
```

### 6. Example JSON Response (Approved):
```json
{
  "success": true,
  "message": "Absent Report approved. Advanced to ZH review.",
  "task": { "id": "TSK_1001", "templateId": "TPL-ATT-001", "status": "rm_approved", "rmRating": 4, "rmReviewedDate": "2026-06-21" }
}
```

### 7. Example JSON Response (Rejected):
```json
{
  "success": true,
  "message": "Absent Report returned to OE for revision.",
  "task": { "id": "TSK_1001", "templateId": "TPL-ATT-001", "status": "rejected", "remarks": "Evidence unclear. Please re-upload." }
}
```

---

## 31. API Specification: Get Reliever Report Data (Read-Only)

Retrieves the full record of a submitted **Reliever Report** task (`TPL-ATT-002`) for read-only viewing.

### 1. Endpoint: `GET /api/tasks/{taskId}`

### 2. Authorization:
* Protected Route. Accessible by: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`.

### 3. Example JSON Response (Success - 200 OK):
```json
{
  "id": "TSK_1002",
  "templateId": "TPL-ATT-002",
  "taskName": "Reliever Report",
  "category": "Attendance Verification",
  "frequency": "daily",
  "weightage": 5,
  "dueDate": "2026-06-20",
  "siteId": "SITE_003",
  "siteName": "Wipro Hinjewadi Campus",
  "clientName": "Wipro Technologies",
  "status": "oe_submitted",
  "assignedTo": "Ravi Shankar",
  "formData": {
    "relieverCount": 3,
    "rosterMatch": true,
    "relieverDetails": "Reliever guards (Ramesh Yadav, Vikram Singh) positioned at Gate 1 and Gate 2 as planned."
  },
  "evidenceUrls": [
    "https://storage.company.com/evidences/reliever_deployment_SITE003_20260620.jpg"
  ],
  "evidenceCount": 1,
  "oeRating": 5,
  "oeRemarks": "Relievers verified on site.",
  "oeSubmittedDate": "2026-06-20",
  "rmRating": null,
  "rmRemarks": null,
  "zhRating": null,
  "avpRating": null,
  "bhRating": null,
  "drRating": null,
  "finalScore": null
}
```

---

## 32. API Specification: Save Reliever Report Draft

Saves a partially filled **Reliever Report** as a draft.

### 1. Endpoint: `PUT /api/tasks/{taskId}/draft`

### 2. Authorization:
* Protected Route. Restricted to the task `assignedTo` user.

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Partial Reliever Report fields. |
| oeRemarks | String | No | Draft notes. |

### 4. Example JSON Payload:
```json
{
  "formData": {
    "relieverCount": 3,
    "rosterMatch": true,
    "relieverDetails": ""
  },
  "oeRemarks": "Draft - verifying shift assignments."
}
```

### 5. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "Reliever Report draft saved successfully.",
  "task": { "id": "TSK_1002", "templateId": "TPL-ATT-002", "status": "in_progress" }
}
```

---

## 33. API Specification: Review/Approve Reliever Report (Multi-Tier)

Reviewer approves or rejects a submitted **Reliever Report**.

### 1. Endpoint: `PUT /api/tasks/{taskId}/review`

### 2. Authorization:
* Restricted to the reviewer role matching the current approval stage (RM→ZH→AVP→BH→DR).

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| action | String | Yes | `approve` or `reject`. |
| rating | Number | Yes | Score 0–5. |
| remarks | String | Yes (if reject) | Mandatory for rejections. |

### 4. Status Transitions:
* **Approve**: RM→`rm_approved`, ZH→`zh_approved`, AVP→`avp_approved`, BH→`bh_approved`, DR→`approved`.
* **Reject**: Any tier → `rejected`.

### 5. Example JSON Payload:
```json
{ "action": "approve", "rating": 5, "remarks": "Reliever matching verified." }
```

### 6. Example JSON Response:
```json
{
  "success": true,
  "message": "Reliever Report approved. Advanced to ZH review.",
  "task": { "id": "TSK_1002", "templateId": "TPL-ATT-002", "status": "rm_approved", "rmRating": 5, "rmReviewedDate": "2026-06-21" }
}
```

---

## 34. API Specification: Get Non App Usage & Follow Up Data (Read-Only)

Retrieves the full record of a submitted **Non App Usage & Follow Up** task (`TPL-ATT-003`).

### 1. Endpoint: `GET /api/tasks/{taskId}`

### 2. Authorization:
* Protected Route. Accessible by: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`.

### 3. Example JSON Response (Success - 200 OK):
```json
{
  "id": "TSK_1003",
  "templateId": "TPL-ATT-003",
  "taskName": "Non App Usage & Follow Up",
  "category": "Attendance Verification",
  "frequency": "daily",
  "weightage": 5,
  "dueDate": "2026-06-20",
  "siteId": "SITE_003",
  "siteName": "Wipro Hinjewadi Campus",
  "clientName": "Wipro Technologies",
  "status": "zh_approved",
  "assignedTo": "Ravi Shankar",
  "formData": {
    "nonAppCount": 4,
    "reasonDescription": "Guards are facing network connectivity issues at the basement parking area.",
    "followUpCount": 6,
    "devicesRegistered": 2
  },
  "evidenceUrls": [
    "https://storage.company.com/evidences/non_app_followup_SITE003_20260620.xlsx"
  ],
  "evidenceCount": 1,
  "oeRating": 4,
  "oeRemarks": "Onboarded 2 new guards and resolved app issues.",
  "oeSubmittedDate": "2026-06-20",
  "rmRating": 4,
  "rmRemarks": "Verified follow-up counts.",
  "rmReviewedDate": "2026-06-20",
  "zhRating": 4,
  "zhRemarks": "Baseline improvements noted. Continue device registration drive.",
  "zhReviewedDate": "2026-06-21",
  "avpRating": null,
  "bhRating": null,
  "drRating": null,
  "finalScore": null
}
```

---

## 35. API Specification: Save Non App Usage & Follow Up Draft

Saves a partially filled **Non App Usage & Follow Up** task as draft.

### 1. Endpoint: `PUT /api/tasks/{taskId}/draft`

### 2. Authorization:
* Restricted to the task `assignedTo` user.

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Partial Non App Usage fields. |
| oeRemarks | String | No | Draft notes. |

### 4. Example JSON Payload:
```json
{
  "formData": {
    "nonAppCount": 4,
    "reasonDescription": "",
    "followUpCount": 0,
    "devicesRegistered": 0
  },
  "oeRemarks": "Draft - follow-ups in progress."
}
```

### 5. Example JSON Response:
```json
{
  "success": true,
  "message": "Non App Usage draft saved successfully.",
  "task": { "id": "TSK_1003", "templateId": "TPL-ATT-003", "status": "in_progress" }
}
```

---

## 36. API Specification: Review/Approve Non App Usage & Follow Up (Multi-Tier)

Reviewer approves or rejects a submitted **Non App Usage & Follow Up** task.

### 1. Endpoint: `PUT /api/tasks/{taskId}/review`

### 2. Authorization:
* Restricted to the reviewer role matching the current approval stage (RM→ZH→AVP→BH→DR).

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| action | String | Yes | `approve` or `reject`. |
| rating | Number | Yes | Score 0–5. |
| remarks | String | Yes (if reject) | Mandatory for rejections. |

### 4. Status Transitions:
* **Approve**: RM→`rm_approved`, ZH→`zh_approved`, AVP→`avp_approved`, BH→`bh_approved`, DR→`approved`.
* **Reject**: Any tier → `rejected`.

### 5. Example JSON Payload:
```json
{ "action": "approve", "rating": 4, "remarks": "Follow-up progress noted." }
```

### 6. Example JSON Response:
```json
{
  "success": true,
  "message": "Non App Usage task approved. Advanced to AVP review.",
  "task": { "id": "TSK_1003", "templateId": "TPL-ATT-003", "status": "zh_approved", "zhRating": 4, "zhReviewedDate": "2026-06-21" }
}
```

---

## 37. API Specification: Get Attendance Submission Data (Read-Only)

Retrieves the full record of a submitted **Attendance Submission** task (`TPL-ATT-004`).

### 1. Endpoint: `GET /api/tasks/{taskId}`

### 2. Authorization:
* Protected Route. Accessible by: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`.

### 3. Example JSON Response (Success - 200 OK):
```json
{
  "id": "TSK_1004",
  "templateId": "TPL-ATT-004",
  "taskName": "Attendance Submission",
  "category": "Attendance Verification",
  "frequency": "monthly",
  "weightage": 5,
  "dueDate": "2026-06-05",
  "siteId": "SITE_003",
  "siteName": "Wipro Hinjewadi Campus",
  "clientName": "Wipro Technologies",
  "status": "oe_submitted",
  "assignedTo": "Ravi Shankar",
  "formData": {
    "salaryMonth": "June 2026",
    "reconciled": true
  },
  "evidenceUrls": [
    "https://storage.company.com/evidences/reconciled_attendance_SITE003_202606.pdf"
  ],
  "evidenceCount": 1,
  "oeRating": 5,
  "oeRemarks": "Attendance sheet verified and signed off by client Sunita Rao.",
  "oeSubmittedDate": "2026-06-20",
  "rmRating": null,
  "rmRemarks": null,
  "zhRating": null,
  "avpRating": null,
  "bhRating": null,
  "drRating": null,
  "finalScore": null
}
```

---

## 38. API Specification: Save Attendance Submission Draft

Saves a partially filled **Attendance Submission** task as draft.

### 1. Endpoint: `PUT /api/tasks/{taskId}/draft`

### 2. Authorization:
* Restricted to the task `assignedTo` user.

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Partial Attendance Submission fields. |
| oeRemarks | String | No | Draft notes. |

### 4. Example JSON Payload:
```json
{
  "formData": {
    "salaryMonth": "June 2026",
    "reconciled": false
  },
  "oeRemarks": "Draft - awaiting client sign-off on billing log."
}
```

### 5. Example JSON Response:
```json
{
  "success": true,
  "message": "Attendance Submission draft saved successfully.",
  "task": { "id": "TSK_1004", "templateId": "TPL-ATT-004", "status": "in_progress" }
}
```

---

## 39. API Specification: Review/Approve Attendance Submission (Multi-Tier)

Reviewer approves or rejects a submitted **Attendance Submission** task.

### 1. Endpoint: `PUT /api/tasks/{taskId}/review`

### 2. Authorization:
* Restricted to the reviewer role matching the current approval stage (RM→ZH→AVP→BH→DR).

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| action | String | Yes | `approve` or `reject`. |
| rating | Number | Yes | Score 0–5. |
| remarks | String | Yes (if reject) | Mandatory for rejections. |

### 4. Status Transitions:
* **Approve**: RM→`rm_approved`, ZH→`zh_approved`, AVP→`avp_approved`, BH→`bh_approved`, DR→`approved`.
* **Reject**: Any tier → `rejected`.

### 5. Example JSON Payload:
```json
{ "action": "approve", "rating": 5, "remarks": "Billing reconciliation verified." }
```

### 6. Example JSON Response:
```json
{
  "success": true,
  "message": "Attendance Submission approved. Advanced to ZH review.",
  "task": { "id": "TSK_1004", "templateId": "TPL-ATT-004", "status": "rm_approved", "rmRating": 5, "rmReviewedDate": "2026-06-21" }
}
```

---

## 40. API Specification: Get Leave Approval Data (Read-Only)

Retrieves the full record of a submitted **Leave Approval** task (`TPL-ATT-005`).

### 1. Endpoint: `GET /api/tasks/{taskId}`

### 2. Authorization:
* Protected Route. Accessible by: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`.

### 3. Example JSON Response (Success - 200 OK):
```json
{
  "id": "TSK_1005",
  "templateId": "TPL-ATT-005",
  "taskName": "Leave Approval",
  "category": "Attendance Verification",
  "frequency": "weekly",
  "weightage": 5,
  "dueDate": "2026-06-14",
  "siteId": "SITE_003",
  "siteName": "Wipro Hinjewadi Campus",
  "clientName": "Wipro Technologies",
  "status": "avp_approved",
  "assignedTo": "Ravi Shankar",
  "formData": {
    "leavesList": [
      { "employeeId": "EMP1001", "reason": "Sick Leave", "date": "2026-06-12" },
      { "employeeId": "EMP1003", "reason": "Casual Leave", "date": "2026-06-14" }
    ],
    "rosterReconciled": true
  },
  "evidenceUrls": [
    "https://storage.company.com/evidences/leave_approvals_SITE003_week24.pdf"
  ],
  "evidenceCount": 1,
  "oeRating": 5,
  "oeRemarks": "Approved leaves logged. Relief guards aligned.",
  "oeSubmittedDate": "2026-06-20",
  "rmRating": 5,
  "rmRemarks": "Roster adjustments confirmed.",
  "rmReviewedDate": "2026-06-20",
  "zhRating": 4,
  "zhRemarks": "Verified.",
  "zhReviewedDate": "2026-06-21",
  "avpRating": 5,
  "avpRemarks": "All leave entries validated.",
  "avpApprovedDate": "2026-06-22",
  "bhRating": null,
  "drRating": null,
  "finalScore": null
}
```

---

## 41. API Specification: Save Leave Approval Draft

Saves a partially filled **Leave Approval** task as draft.

### 1. Endpoint: `PUT /api/tasks/{taskId}/draft`

### 2. Authorization:
* Restricted to the task `assignedTo` user.

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Partial Leave Approval fields. |
| oeRemarks | String | No | Draft notes. |

### 4. Example JSON Payload:
```json
{
  "formData": {
    "leavesList": [
      { "employeeId": "EMP1001", "reason": "Sick Leave", "date": "2026-06-12" }
    ],
    "rosterReconciled": false
  },
  "oeRemarks": "Draft - 1 more leave entry pending."
}
```

### 5. Example JSON Response:
```json
{
  "success": true,
  "message": "Leave Approval draft saved successfully.",
  "task": { "id": "TSK_1005", "templateId": "TPL-ATT-005", "status": "in_progress" }
}
```

---

## 42. API Specification: Review/Approve Leave Approval (Multi-Tier)

Reviewer approves or rejects a submitted **Leave Approval** task.

### 1. Endpoint: `PUT /api/tasks/{taskId}/review`

### 2. Authorization:
* Restricted to the reviewer role matching the current approval stage (RM→ZH→AVP→BH→DR).

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| action | String | Yes | `approve` or `reject`. |
| rating | Number | Yes | Score 0–5. |
| remarks | String | Yes (if reject) | Mandatory for rejections. |

### 4. Status Transitions:
* **Approve**: RM→`rm_approved`, ZH→`zh_approved`, AVP→`avp_approved`, BH→`bh_approved`, DR→`approved`.
* **Reject**: Any tier → `rejected`.

### 5. Example JSON Payload:
```json
{ "action": "approve", "rating": 5, "remarks": "Leave entries and roster adjustments verified." }
```

### 6. Example JSON Response:
```json
{
  "success": true,
  "message": "Leave Approval approved. Advanced to ZH review.",
  "task": { "id": "TSK_1005", "templateId": "TPL-ATT-005", "status": "rm_approved", "rmRating": 5, "rmReviewedDate": "2026-06-21" }
}
```

---

## 43. API Specification: Get Missing In-Out Time Data (Read-Only)

Retrieves the full record of a submitted **Missing In-Out Time** task (`TPL-ATT-006`).

### 1. Endpoint: `GET /api/tasks/{taskId}`

### 2. Authorization:
* Protected Route. Accessible by: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`.

### 3. Example JSON Response (Success - 200 OK):
```json
{
  "id": "TASK_0006",
  "templateId": "TPL-ATT-006",
  "taskName": "Missing In-Out Time",
  "category": "Attendance Verification",
  "frequency": "weekly",
  "weightage": 5,
  "dueDate": "2026-06-12",
  "siteId": "SITE_003",
  "siteName": "Wipro Hinjewadi Campus",
  "clientName": "Wipro Technologies",
  "status": "oe_submitted",
  "assignedTo": "Ravi Shankar",
  "formData": {
    "missingRecordsCount": 2,
    "regularizations": {
      "ATT_012": { "approvedTime": "05:30 PM" },
      "ATT_013": { "approvedTime": "09:00 AM" }
    },
    "regularized": true
  },
  "evidenceUrls": [
    "https://storage.company.com/evidences/signature_sheet_SITE003_week24.pdf"
  ],
  "evidenceCount": 1,
  "oeRating": 5,
  "oeRemarks": "Both biometric anomalies reconciled and verified.",
  "oeSubmittedDate": "2026-06-20",
  "rmRating": null,
  "rmRemarks": null,
  "zhRating": null,
  "avpRating": null,
  "bhRating": null,
  "drRating": null,
  "finalScore": null
}
```

---

## 44. API Specification: Save Missing In-Out Time Draft

Saves a partially filled **Missing In-Out Time** task as draft.

### 1. Endpoint: `PUT /api/tasks/{taskId}/draft`

### 2. Authorization:
* Restricted to the task `assignedTo` user.

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Partial Missing In-Out Time fields. |
| oeRemarks | String | No | Draft notes. |

### 4. Example JSON Payload:
```json
{
  "formData": {
    "missingRecordsCount": 2,
    "regularizations": {
      "ATT_012": { "approvedTime": "05:30 PM" }
    },
    "regularized": false
  },
  "oeRemarks": "Draft - 1 record still pending regularization."
}
```

### 5. Example JSON Response:
```json
{
  "success": true,
  "message": "Missing In-Out Time draft saved successfully.",
  "task": { "id": "TASK_0006", "templateId": "TPL-ATT-006", "status": "in_progress" }
}
```

---

## 45. API Specification: Review/Approve Missing In-Out Time (Multi-Tier)

Reviewer approves or rejects a submitted **Missing In-Out Time** task.

### 1. Endpoint: `PUT /api/tasks/{taskId}/review`

### 2. Authorization:
* Restricted to the reviewer role matching the current approval stage (RM→ZH→AVP→BH→DR).

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| action | String | Yes | `approve` or `reject`. |
| rating | Number | Yes | Score 0–5. |
| remarks | String | Yes (if reject) | Mandatory for rejections. |

### 4. Status Transitions:
* **Approve**: RM→`rm_approved`, ZH→`zh_approved`, AVP→`avp_approved`, BH→`bh_approved`, DR→`approved`.
* **Reject**: Any tier → `rejected`.

### 5. Example JSON Payload:
```json
{ "action": "approve", "rating": 5, "remarks": "All missing timestamps regularized correctly." }
```

### 6. Example JSON Response:
```json
{
  "success": true,
  "message": "Missing In-Out Time approved. Advanced to ZH review.",
  "task": { "id": "TASK_0006", "templateId": "TPL-ATT-006", "status": "rm_approved", "rmRating": 5, "rmReviewedDate": "2026-06-21" }
}
```

---

## 46. API Specification: Get Regularization Data (Read-Only)

Retrieves the full record of a submitted **Regularization** task (`TPL-ATT-007`).

### 1. Endpoint: `GET /api/tasks/{taskId}`

### 2. Authorization:
* Protected Route. Accessible by: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`.

### 3. Example JSON Response (Success - 200 OK):
```json
{
  "id": "TASK_0007",
  "templateId": "TPL-ATT-007",
  "taskName": "Regularization",
  "category": "Attendance Verification",
  "frequency": "weekly",
  "weightage": 5,
  "dueDate": "2026-06-12",
  "siteId": "SITE_003",
  "siteName": "Wipro Hinjewadi Campus",
  "clientName": "Wipro Technologies",
  "status": "bh_approved",
  "assignedTo": "Ravi Shankar",
  "formData": {
    "regularizationsEvidence": {
      "ATT_041": "screenshot_suresh.png",
      "ATT_042": "screenshot_anita.png"
    },
    "clientApproved": true
  },
  "evidenceUrls": [
    "https://storage.company.com/evidences/client_approval_SITE003_week24.pdf"
  ],
  "evidenceCount": 1,
  "oeRating": 5,
  "oeRemarks": "Regularized logs mapped with individual evidence.",
  "oeSubmittedDate": "2026-06-20",
  "rmRating": 5,
  "rmRemarks": "Evidence complete.",
  "rmReviewedDate": "2026-06-20",
  "zhRating": 5,
  "zhRemarks": "Client approval confirmed.",
  "zhReviewedDate": "2026-06-21",
  "avpRating": 4,
  "avpRemarks": "Verified.",
  "avpApprovedDate": "2026-06-22",
  "bhRating": 4,
  "bhRemarks": "All regularization records accounted for.",
  "bhApprovedDate": "2026-06-23",
  "drRating": null,
  "finalScore": null
}
```

---

## 47. API Specification: Save Regularization Draft

Saves a partially filled **Regularization** task as draft.

### 1. Endpoint: `PUT /api/tasks/{taskId}/draft`

### 2. Authorization:
* Restricted to the task `assignedTo` user.

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Partial Regularization fields. |
| oeRemarks | String | No | Draft notes. |

### 4. Example JSON Payload:
```json
{
  "formData": {
    "regularizationsEvidence": {
      "ATT_041": "screenshot_suresh.png"
    },
    "clientApproved": false
  },
  "oeRemarks": "Draft - awaiting client approval for ATT_042."
}
```

### 5. Example JSON Response:
```json
{
  "success": true,
  "message": "Regularization draft saved successfully.",
  "task": { "id": "TASK_0007", "templateId": "TPL-ATT-007", "status": "in_progress" }
}
```

---

## 48. API Specification: Review/Approve Regularization (Multi-Tier)

Reviewer approves or rejects a submitted **Regularization** task.

### 1. Endpoint: `PUT /api/tasks/{taskId}/review`

### 2. Authorization:
* Restricted to the reviewer role matching the current approval stage (RM→ZH→AVP→BH→DR).

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| action | String | Yes | `approve` or `reject`. |
| rating | Number | Yes | Score 0–5. |
| remarks | String | Yes (if reject) | Mandatory for rejections. |

### 4. Status Transitions:
* **Approve**: RM→`rm_approved`, ZH→`zh_approved`, AVP→`avp_approved`, BH→`bh_approved`, DR→`approved`.
* **Reject**: Any tier → `rejected`.

### 5. Example JSON Payload:
```json
{ "action": "approve", "rating": 5, "remarks": "Client-approved regularization evidence verified." }
```

### 6. Example JSON Response:
```json
{
  "success": true,
  "message": "Regularization approved. Advanced to ZH review.",
  "task": { "id": "TASK_0007", "templateId": "TPL-ATT-007", "status": "rm_approved", "rmRating": 5, "rmReviewedDate": "2026-06-21" }
}
```

---

## 49. API Specification: Get Site Visit Report Data (Read-Only)

Retrieves the full record of a submitted **Site Visit Report** task (`TPL-OPS-001`) for read-only viewing. This returns the complete 11-section report data.

### 1. Endpoint: `GET /api/tasks/{taskId}`

### 2. Authorization:
* Protected Route. Accessible by: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`.

### 3. Example JSON Response (Success - 200 OK):
```json
{
  "id": "TSK_SVR_001",
  "templateId": "TPL-OPS-001",
  "taskName": "Site Visit Report",
  "category": "Site Operations",
  "frequency": "daily",
  "weightage": 5,
  "dueDate": "2026-06-20",
  "siteId": "SITE_003",
  "siteName": "Wipro Hinjewadi Campus",
  "clientName": "Wipro Technologies",
  "status": "zh_approved",
  "assignedTo": "Ravi Shankar",
  "formData": {
    "visitType": "routine",
    "presenceVerified": true,
    "gpsLocation": { "lat": 28.4595, "lng": 77.0266 },
    "qualityRatings": {
      "overallCleanliness": 4,
      "workstationCondition": 4,
      "cabinCleanliness": 5,
      "washroomCleanliness": 3,
      "officeEntranceCondition": 4,
      "glassCleaning": 4,
      "furnitureChairCondition": 4,
      "housekeepingStandards": 4
    },
    "siteQualityScore": 80,
    "manpowerStatus": {
      "totalDeployed": 25,
      "presentToday": 23,
      "absentToday": 2,
      "relieversDeployed": 2
    },
    "materialStatus": {
      "materialsAvailable": true,
      "shortageItems": []
    },
    "equipmentStatus": {
      "allOperational": true,
      "breakdownItems": []
    },
    "clientFeedback": {
      "feedbackReceived": true,
      "sentiment": "satisfied",
      "feedbackNotes": "Client satisfied with housekeeping standards."
    },
    "correctiveActions": [
      {
        "id": "CA_12345",
        "issue": "Staff attendance lag in the morning shift",
        "assignedTo": "Suresh Babu",
        "priority": "medium",
        "targetClosureDate": "2026-06-25",
        "status": "open"
      }
    ],
    "trainingConducted": {
      "conducted": true,
      "topic": "Fire safety drill",
      "attendees": 18
    },
    "overallSiteHealthScore": 76
  },
  "evidenceUrls": [
    "https://storage.company.com/evidences/site_visit_photo1.jpg",
    "https://storage.company.com/evidences/site_visit_photo2.jpg",
    "https://storage.company.com/evidences/site_visit_photo3.jpg"
  ],
  "evidenceCount": 3,
  "oeRating": 4,
  "oeRemarks": "Routine visit completed. Corrective action raised for morning shift.",
  "oeSubmittedDate": "2026-06-20",
  "rmRating": 4,
  "rmRemarks": "Good coverage, noted corrective actions.",
  "rmReviewedDate": "2026-06-20",
  "zhRating": 4,
  "zhRemarks": "Verified. Escalate morning shift issue.",
  "zhReviewedDate": "2026-06-21",
  "avpRating": null,
  "avpRemarks": null,
  "bhRating": null,
  "drRating": null,
  "finalScore": null
}
```

---

## 50. API Specification: Save Site Visit Report Draft

Saves a partially filled **Site Visit Report** as draft. Useful when the OE is on-site and filling sections progressively.

### 1. Endpoint: `PUT /api/tasks/{taskId}/draft`

### 2. Authorization:
* Restricted to the task `assignedTo` user.

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Partial Site Visit Report fields (any subset of the 11 sections). |
| oeRemarks | String | No | Draft notes. |

### 4. Example JSON Payload:
```json
{
  "formData": {
    "visitType": "routine",
    "presenceVerified": true,
    "gpsLocation": { "lat": 28.4595, "lng": 77.0266 },
    "qualityRatings": {
      "overallCleanliness": 4,
      "workstationCondition": 3
    }
  },
  "oeRemarks": "Draft - on-site, sections 3-11 pending."
}
```

### 5. Example JSON Response:
```json
{
  "success": true,
  "message": "Site Visit Report draft saved successfully.",
  "task": { "id": "TSK_SVR_001", "templateId": "TPL-OPS-001", "status": "in_progress" }
}
```

---

## 51. API Specification: Review/Approve Site Visit Report (Multi-Tier)

Reviewer approves or rejects a submitted **Site Visit Report** task.

### 1. Endpoint: `PUT /api/tasks/{taskId}/review`

### 2. Authorization:
* Restricted to the reviewer role matching the current approval stage (RM→ZH→AVP→BH→DR).

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| action | String | Yes | `approve` or `reject`. |
| rating | Number | Yes | Score 0–5. |
| remarks | String | Yes (if reject) | Mandatory for rejections. |

### 4. Status Transitions:
* **Approve**: RM→`rm_approved`, ZH→`zh_approved`, AVP→`avp_approved`, BH→`bh_approved`, DR→`approved`.
* **Reject**: Any tier → `rejected`.

### 5. Example JSON Payload (AVP Rejects):
```json
{
  "action": "reject",
  "rating": 2,
  "remarks": "Corrective actions incomplete. Add target closure dates for all issues in Section 9."
}
```

### 6. Example JSON Response (Approved):
```json
{
  "success": true,
  "message": "Site Visit Report approved. Advanced to AVP review.",
  "task": { "id": "TSK_SVR_001", "templateId": "TPL-OPS-001", "status": "zh_approved", "zhRating": 4, "zhReviewedDate": "2026-06-21" }
}
```

### 7. Example JSON Response (Rejected):
```json
{
  "success": true,
  "message": "Site Visit Report returned to OE for revision.",
  "task": { "id": "TSK_SVR_001", "templateId": "TPL-OPS-001", "status": "rejected", "remarks": "Corrective actions incomplete." }
}
```

---

## 52. API Specification: Get Final Closing Report Data (Read-Only)

Retrieves the full record of a submitted **Final Closing Report** task (`TPL-OPS-003`) for read-only viewing. Includes the three-phase data (status check, queries, resolutions).

### 1. Endpoint: `GET /api/tasks/{taskId}`

### 2. Authorization:
* Protected Route. Accessible by: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`.

### 3. Example JSON Response (Success - 200 OK):
```json
{
  "id": "TSK_CLR_001",
  "templateId": "TPL-OPS-003",
  "taskName": "Final Closing Report",
  "category": "Reporting & Closure",
  "frequency": "monthly",
  "weightage": 5,
  "dueDate": "2026-06-27",
  "siteId": "SITE_003",
  "siteName": "Wipro Hinjewadi Campus",
  "clientName": "Wipro Technologies",
  "status": "oe_submitted",
  "assignedTo": "Ravi Shankar",
  "siteVisitCompleted": true,
  "siteVisitDate": "2026-06-20",
  "formData": {
    "queries": [
      {
        "id": "Q_001",
        "queryText": "Why was the lobby area not cleaned on 15th June?",
        "raisedBy": "RM_Priya",
        "raisedDate": "2026-06-21",
        "resolution": "Staff was on emergency leave. Reliever deployed same day afternoon. Area cleaned by 2 PM.",
        "resolvedDate": "2026-06-22",
        "status": "resolved"
      }
    ],
    "closingSummary": "All queries resolved. Site operations normalized.",
    "overallStatus": "satisfactory"
  },
  "evidenceUrls": [],
  "evidenceCount": 0,
  "oeRating": 5,
  "oeRemarks": "All queries addressed within SLA.",
  "oeSubmittedDate": "2026-06-22",
  "rmRating": null,
  "rmRemarks": null,
  "zhRating": null,
  "avpRating": null,
  "bhRating": null,
  "drRating": null,
  "finalScore": null
}
```

---

## 53. API Specification: Save Final Closing Report Draft

Saves a partially filled **Final Closing Report** as draft.

### 1. Endpoint: `PUT /api/tasks/{taskId}/draft`

### 2. Authorization:
* Restricted to the task `assignedTo` user.

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Partial closing report fields (queries with partial resolutions). |
| oeRemarks | String | No | Draft notes. |

### 4. Example JSON Payload:
```json
{
  "formData": {
    "queries": [
      {
        "id": "Q_001",
        "queryText": "Why was the lobby area not cleaned on 15th June?",
        "raisedBy": "RM_Priya",
        "raisedDate": "2026-06-21",
        "resolution": "",
        "resolvedDate": null,
        "status": "open"
      }
    ],
    "closingSummary": "",
    "overallStatus": ""
  },
  "oeRemarks": "Draft - query resolution in progress."
}
```

### 5. Example JSON Response:
```json
{
  "success": true,
  "message": "Final Closing Report draft saved successfully.",
  "task": { "id": "TSK_CLR_001", "templateId": "TPL-OPS-003", "status": "in_progress" }
}
```

---

## 54. API Specification: Review/Approve Final Closing Report (Multi-Tier)

Reviewer approves or rejects a submitted **Final Closing Report** task.

### 1. Endpoint: `PUT /api/tasks/{taskId}/review`

### 2. Authorization:
* Restricted to the reviewer role matching the current approval stage (RM→ZH→AVP→BH→DR).

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| action | String | Yes | `approve` or `reject`. |
| rating | Number | Yes | Score 0–5. |
| remarks | String | Yes (if reject) | Mandatory for rejections. |

### 4. Status Transitions:
* **Approve**: RM→`rm_approved`, ZH→`zh_approved`, AVP→`avp_approved`, BH→`bh_approved`, DR→`approved`.
* **Reject**: Any tier → `rejected`.

### 5. Example JSON Payload:
```json
{ "action": "approve", "rating": 5, "remarks": "All queries resolved satisfactorily." }
```

### 6. Example JSON Response:
```json
{
  "success": true,
  "message": "Final Closing Report approved. Advanced to ZH review.",
  "task": { "id": "TSK_CLR_001", "templateId": "TPL-OPS-003", "status": "rm_approved", "rmRating": 5, "rmReviewedDate": "2026-06-23" }
}
```

---

## 55. API Specification: Get Uniform / Shoes Request Task Details (Read-Only)

Retrieves the full record and metadata of a submitted **Uniform Request** (`TPL-PRO-003`) or **Shoes Request** (`TPL-PRO-004`) task. Includes the pre-populated or submitted procurement MIS data (Order Date, Target Date, Shirt Qty, Pant Qty, Shoe Qty) and the Procurement TAT compliance flag.

### 1. Endpoint: `GET /api/tasks/{taskId}`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Accessible by Roles: `oe`, `ph`, `avp`, `bh`, `dr`, `hr`.

### 3. Example JSON Response (Uniform Request - 200 OK):
```json
{
  "id": "TSK_UNI_017",
  "templateId": "TPL-PRO-003",
  "taskName": "Uniform Request",
  "category": "Procurement & Logistics",
  "frequency": "one-time",
  "weightage": 5,
  "dueDate": "2026-06-18",
  "siteId": "SITE_003",
  "siteName": "Wipro Hinjewadi Campus",
  "clientName": "Wipro Technologies",
  "status": "in_progress",
  "assignedTo": "Ravi Shankar",
  "formData": {
    "sizeNeeded": "L",
    "qty": 10,
    "orderDate": "2025-05-22",
    "targetDate": "2025-06-05",
    "withinTAT": true
  },
  "evidenceUrls": [],
  "evidenceCount": 0,
  "oeRating": 5,
  "oeRemarks": "Verified requisition counts with site team.",
  "oeSubmittedDate": null,
  "phRating": null,
  "phRemarks": null,
  "avpRating": null,
  "bhRating": null,
  "drRating": null,
  "finalScore": null
}
```

### 4. Example JSON Response (Shoes Request - 200 OK):
```json
{
  "id": "TSK_SHOE_019",
  "templateId": "TPL-PRO-004",
  "taskName": "Shoes Request",
  "category": "Procurement & Logistics",
  "frequency": "one-time",
  "weightage": 5,
  "dueDate": "2026-06-17",
  "siteId": "SITE_003",
  "siteName": "Wipro Hinjewadi Campus",
  "clientName": "Wipro Technologies",
  "status": "in_progress",
  "assignedTo": "Ravi Shankar",
  "formData": {
    "shoeSize": "9",
    "qty": 15,
    "orderDate": "2025-05-20",
    "targetDate": "2025-05-28",
    "withinTAT": true
  },
  "evidenceUrls": [],
  "evidenceCount": 0,
  "oeRating": 5,
  "oeRemarks": "Verified boot sizing requirements.",
  "oeSubmittedDate": null,
  "phRating": null,
  "phRemarks": null,
  "avpRating": null,
  "bhRating": null,
  "drRating": null,
  "finalScore": null
}
```

---

## 56. API Specification: Save Uniform / Shoes Request Task Draft

Saves a partially filled Uniform or Shoes Request task form as draft.

### 1. Endpoint: `PUT /api/tasks/{taskId}/draft`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to the task `assignedTo` user (`oe` / `ph`).

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Form parameters including order details. |
| oeRemarks | String | No | Draft remarks. |
| oeRating | Number | No | Self-evaluation rating. |

### 4. Example JSON Payload (Uniform Request):
```json
{
  "formData": {
    "sizeNeeded": "L",
    "qty": 10,
    "orderDate": "2025-05-22",
    "targetDate": "2025-06-05",
    "withinTAT": true
  },
  "oeRemarks": "Draft - verifying pant count",
  "oeRating": 5
}
```

### 5. Example JSON Payload (Shoes Request):
```json
{
  "formData": {
    "shoeSize": "9",
    "qty": 15,
    "orderDate": "2025-05-20",
    "targetDate": "2025-05-28",
    "withinTAT": true
  },
  "oeRemarks": "Draft - verifying shoe inventory",
  "oeRating": 5
}
```

### 5. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "Apparel request task draft saved successfully.",
  "task": { "id": "TSK_UNI_017", "status": "in_progress" }
}
```

---

## 57. API Specification: Submit Uniform / Shoes Request Task

Submits the completed Uniform or Shoes Request task for validation and review. Submission advances the task status to the Portfolio Head (`ph`) approval queue.

### 1. Endpoint: `POST /api/tasks/{taskId}/submit`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to the task `assignedTo` user.

### 3. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "Apparel request task submitted successfully for validation.",
  "task": { "id": "TSK_UNI_017", "status": "submitted" }
}
```

---

## 58. API Specification: Review/Approve Uniform / Shoes Request Task (Multi-Tier Flow: PH → AVP → BH → DR)

Processes approvals or rejections at each stage of the multi-tier review queue. The approval workflow is:
`OE (Submit) → PH (Review) → AVP (Review) → BH (Review) → DR (Final Approval)`.

### 1. Endpoint: `PUT /api/tasks/{taskId}/review`

### 2. Authorization:
* Restricted to the reviewer role corresponding to the current approval stage (`ph`, `avp`, `bh`, `dr`).

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| action | String | Yes | `approve` or `reject`. |
| rating | Number | Yes | Evaluation rating (0 to 5). |
| remarks | String | Yes (if reject) | Feedback or reason for returning the task. |

### 4. Status Transitions:
* **Approve**: 
  * PH Approval → `ph_approved` (Advances task to AVP approval stage)
  * AVP Approval → `avp_approved` (Advances task to BH approval stage)
  * BH Approval → `bh_approved` (Advances task to DR approval stage)
  * DR Approval → `approved` (Concludes the task and triggers score calculation)
* **Reject**: Any tier → `rejected` (Returns task to OE queue for revision)

### 5. Example JSON Payload (PH Approves):
```json
{
  "action": "approve",
  "rating": 5,
  "remarks": "Order quantity and TAT matched with procurement ledger."
}
```

### 6. Example JSON Response (PH Approved):
```json
{
  "success": true,
  "message": "Apparel request approved. Advanced to AVP review.",
  "task": { "id": "TSK_UNI_017", "status": "ph_approved", "phRating": 5, "phReviewedDate": "2026-06-20" }
}
```

### 7. Example JSON Response (DR Final Approved):
```json
{
  "success": true,
  "message": "Apparel request final approved. Task closed.",
  "task": { "id": "TSK_UNI_017", "status": "approved", "drRating": 5, "drApprovedDate": "2026-06-21", "finalScore": 5 }
}
```

---

## 59. API Specification: Get Uniform / Shoes Issuance Task Details (Read-Only)

Retrieves the full record of a submitted **Uniform Issuance** (`TPL-PRO-006`) or **Shoes Issuance** (`TPL-PRO-007`) task for read-only viewing. Includes the auto-fetched employee counts, total issued items, and auto-calculated remaining balance.

### 1. Endpoint: `GET /api/tasks/{taskId}`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Accessible by Roles: `oe`, `rm`, `zh`, `avp`, `bh`, `dr`, `hr`.

### 3. Example JSON Response (Uniform Issuance - 200 OK):
```json
{
  "id": "TSK_UNI_ISS_018",
  "templateId": "TPL-PRO-006",
  "taskName": "Uniform Issuance",
  "category": "Procurement & Logistics",
  "frequency": "monthly",
  "weightage": 5,
  "dueDate": "2026-06-30",
  "siteId": "SITE_003",
  "siteName": "Wipro Hinjewadi Campus",
  "clientName": "Wipro Technologies",
  "status": "oe_submitted",
  "assignedTo": "Ravi Shankar",
  "formData": {
    "totalEmployees": 10,
    "totalIssued": 8,
    "remaining": 2
  },
  "evidenceUrls": ["https://company-s3.amazonaws.com/evidence/handover_sheet_uni_018.pdf"],
  "evidenceCount": 1,
  "oeRating": 5,
  "oeRemarks": "Handed over to 8 active guards on duty. Balance 2 will be issued tomorrow.",
  "oeSubmittedDate": "2026-06-21",
  "phRating": null,
  "phRemarks": null,
  "avpRating": null,
  "bhRating": null,
  "drRating": null,
  "finalScore": null
}
```

### 4. Example JSON Response (Shoes Issuance - 200 OK):
```json
{
  "id": "TSK_SHOE_ISS_020",
  "templateId": "TPL-PRO-007",
  "taskName": "Shoes Issuance",
  "category": "Procurement & Logistics",
  "frequency": "monthly",
  "weightage": 5,
  "dueDate": "2026-06-30",
  "siteId": "SITE_003",
  "siteName": "Wipro Hinjewadi Campus",
  "clientName": "Wipro Technologies",
  "status": "oe_submitted",
  "assignedTo": "Ravi Shankar",
  "formData": {
    "totalEmployees": 10,
    "totalIssued": 9,
    "remaining": 1
  },
  "evidenceUrls": ["https://company-s3.amazonaws.com/evidence/handover_sheet_shoes_020.pdf"],
  "evidenceCount": 1,
  "oeRating": 5,
  "oeRemarks": "All boots handed over except for 1 employee currently on sick leave.",
  "oeSubmittedDate": "2026-06-22",
  "phRating": null,
  "phRemarks": null,
  "avpRating": null,
  "bhRating": null,
  "drRating": null,
  "finalScore": null
}
```

---

## 60. API Specification: Save Uniform / Shoes Issuance Task Draft

Saves a partially filled Uniform or Shoes Issuance task form as draft.

### 1. Endpoint: `PUT /api/tasks/{taskId}/draft`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to the task `assignedTo` user (`oe` / `ph`).

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Form parameters including order details. |
| formData.totalEmployees | Number | Yes | Total count of site employees (auto-fetched on client). |
| formData.totalIssued | Number | Yes | Quantity of items issued. |
| formData.remaining | Number | Yes | Remaining count to issue (auto-calculated: totalEmployees - totalIssued). |
| oeRemarks | String | No | Draft remarks. |
| oeRating | Number | No | Self-evaluation rating. |

### 4. Example JSON Payload:
```json
{
  "formData": {
    "totalEmployees": 10,
    "totalIssued": 6,
    "remaining": 4
  },
  "oeRemarks": "Draft - awaiting 2 signatures",
  "oeRating": 4
}
```

### 5. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "Apparel issuance task draft saved successfully.",
  "task": { "id": "TSK_UNI_ISS_018", "status": "in_progress" }
}
```

---

## 61. API Specification: Submit Uniform / Shoes Issuance Task

Submits the completed Uniform or Shoes Issuance task for validation. Submission advances the task status to the review queue.

### 1. Endpoint: `POST /api/tasks/{taskId}/submit`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to the task `assignedTo` user.

### 3. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "Apparel issuance task submitted successfully for validation.",
  "task": { "id": "TSK_UNI_ISS_018", "status": "submitted" }
}
```

---

## 62. API Specification: Review/Approve Uniform / Shoes Issuance Task (Multi-Tier Flow)

Processes approvals or rejections at each stage of the multi-tier review queue.

### 1. Endpoint: `PUT /api/tasks/{taskId}/review`

### 2. Authorization:
* Restricted to the reviewer role corresponding to the current approval stage.

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| action | String | Yes | `approve` or `reject`. |
| rating | Number | Yes | Evaluation rating (0 to 5). |
| remarks | String | Yes (if reject) | Feedback or reason for returning the task. |

### 4. Example JSON Payload:
```json
{
  "action": "approve",
  "rating": 5,
  "remarks": "Handover record sheet check complete. All signatures are present."
}
```

### 5. Example JSON Response (Approved):
```json
{
  "success": true,
  "message": "Apparel issuance task approved.",
  "task": { "id": "TSK_UNI_ISS_018", "status": "approved", "finalScore": 5 }
}
```

---

## 63. API Specification: Get Material Delivery Status Task Details (Read-Only)

Retrieves the details of a **Material Delivery Status** (`TPL-PRO-001`) task. Includes the auto-captured delivery challan number, delivery status, and condition of material.

### 1. Endpoint: `GET /api/tasks/{taskId}`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Accessible by Roles: `oe`, `ph`, `avp`, `bh`, `dr`.

### 3. Example JSON Response (200 OK):
```json
{
  "id": "TSK_MAT_DEL_022",
  "templateId": "TPL-PRO-001",
  "taskName": "Material Delivery Status",
  "category": "Procurement & Logistics",
  "frequency": "monthly",
  "weightage": 5,
  "dueDate": "2026-06-30",
  "siteId": "SITE_003",
  "siteName": "Wipro Hinjewadi Campus",
  "clientName": "Wipro Technologies",
  "status": "oe_submitted",
  "assignedTo": "Ravi Shankar",
  "formData": {
    "challanNo": "DC-PR-PR-2025-0088",
    "materialDelivered": true,
    "materialCondition": "Good",
    "receivedInFull": true
  },
  "evidenceUrls": ["https://company-s3.amazonaws.com/evidence/delivery_challan_022.pdf"],
  "evidenceCount": 1,
  "oeRating": 5,
  "oeRemarks": "Material received in full and verified against delivery challan document preview.",
  "oeSubmittedDate": "2026-06-21",
  "phRating": null,
  "phRemarks": null,
  "avpRating": null,
  "bhRating": null,
  "drRating": null,
  "finalScore": null
}
```

---

## 64. API Specification: Save Material Delivery Status Task Draft

Saves a partially filled Material Delivery Status task form as draft.

### 1. Endpoint: `PUT /api/tasks/{taskId}/draft`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to the task `assignedTo` user (`oe` / `ph`).

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| formData | Object | Yes | Form parameters containing delivery status details. |
| formData.challanNo | String | Yes | Delivery Challan Number (auto-captured). |
| formData.materialDelivered | Boolean | Yes | True if material is delivered, false otherwise. |
| formData.materialCondition | String | Yes | Condition of material (`Good`, `Damaged`, `Shortage`). |
| formData.receivedInFull | Boolean | Yes | True if delivered is true and condition is Good (auto-calculated). |
| oeRemarks | String | No | Draft remarks. |
| oeRating | Number | No | Self-evaluation rating. |

### 4. Example JSON Payload:
```json
{
  "formData": {
    "challanNo": "DC-PR-PR-2025-0088",
    "materialDelivered": true,
    "materialCondition": "Damaged",
    "receivedInFull": false
  },
  "oeRemarks": "Draft - material packaging damaged. Under review.",
  "oeRating": 3
}
```

### 5. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "Material delivery status task draft saved successfully.",
  "task": { "id": "TSK_MAT_DEL_022", "status": "in_progress" }
}
```

---

## 65. API Specification: Submit Material Delivery Status Task

Submits the completed Material Delivery Status task for validation and review. Submission advances the task status to the Portfolio Head (`ph`) review queue.

### 1. Endpoint: `POST /api/tasks/{taskId}/submit`

### 2. Authorization:
* Protected Route. Headers must contain `Authorization: Bearer <token>`.
* Restricted to the task `assignedTo` user.

### 3. Example JSON Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "Material delivery status task submitted successfully for validation.",
  "task": { "id": "TSK_MAT_DEL_022", "status": "submitted" }
}
```

---

## 66. API Specification: Review/Approve Material Delivery Status Task (Multi-Tier Flow: PH → AVP → BH → DR)

Processes approvals or rejections at each stage of the multi-tier review queue. The approval workflow is:
`OE (Submit) → PH (Review) → AVP (Review) → BH (Review) → DR (Final Approval)`.

### 1. Endpoint: `PUT /api/tasks/{taskId}/review`

### 2. Authorization:
* Restricted to the reviewer role corresponding to the current approval stage (`ph`, `avp`, `bh`, `dr`).

### 3. Request Body:

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| action | String | Yes | `approve` or `reject`. |
| rating | Number | Yes | Evaluation rating (0 to 5). |
| remarks | String | Yes (if reject) | Feedback or reason for returning the task. |

### 4. Status Transitions:
* **Approve**: 
  * PH Approval → `ph_approved` (Advances task to AVP approval stage)
  * AVP Approval → `avp_approved` (Advances task to BH approval stage)
  * BH Approval → `bh_approved` (Advances task to DR approval stage)
  * DR Approval → `approved` (Concludes the task and triggers score calculation)
* **Reject**: Any tier → `rejected` (Returns task to OE queue for revision)

### 5. Example JSON Payload (PH Approves):
```json
{
  "action": "approve",
  "rating": 5,
  "remarks": "Delivery challan matches matching logistics logs. Verified."
}
```

### 6. Example JSON Response (PH Approved):
```json
{
  "success": true,
  "message": "Material delivery status task approved. Advanced to AVP review.",
  "task": { "id": "TSK_MAT_DEL_022", "status": "ph_approved", "phRating": 5, "phReviewedDate": "2026-06-20" }
}
```

---

## Scoring Policy Reference (Applied on Final DR Approval for All Tasks)

When the final approver (DR) approves a task, the `finalScore` is computed based on the active scoring policy:

| Policy | Calculation |
| :--- | :--- |
| `avp_only` | `finalScore = avpRating` (AVP score is the definitive score) |
| `average` | `finalScore = average(oeRating, rmRating, zhRating, avpRating, bhRating, drRating)` |
| `weighted` | `finalScore = (oe×10% + rm×15% + zh×15% + avp×30% + bh×15% + dr×15%)` |

