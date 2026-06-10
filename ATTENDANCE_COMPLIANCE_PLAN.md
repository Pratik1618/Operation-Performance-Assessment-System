# Attendance Verification & Resolution Module - Final Implementation Plan

## Business Purpose

Attendance is managed in another system.

This module does not capture attendance.

This module receives absentee data and creates operational verification tasks for the Operation Executive (OE).

The objective is:

* Verify employee absence
* Identify absence reason
* Verify employee status
* Verify reliever deployment
* Track vacancy creation
* Track manpower replacement
* Score task completion
* Route for RM and AVP review

This module is both:

1. Operations Resolution Workflow
2. Performance Scoring Workflow

---

# Workflow

Attendance System
↓
Employee Marked Absent
↓
Case Created Automatically
↓
Assigned to OE
↓
OE Verification
↓
OE Resolution
↓
OE Score Submission
↓
RM Review & Score
↓
AVP Review & Score
↓
Final Compliance Score

---

# Module Navigation

Attendance Verification & Resolution

├── Dashboard
├── Verification Queue
├── Case Management
├── Reliever Tracking
├── Vacancy Tracking
├── Scoring & Reviews
├── Analytics
└── Approval Timeline

---

# Dashboard

## KPI Cards

Display:

* Total Absent Employees
* Verification Pending
* Under Investigation
* Resolved Cases
* Relievers Deployed
* Relievers Pending
* Vacant Positions
* Positions Filled

---

## Shift Summary

Display:

* First Shift Absent
* Second Shift Absent
* Third Shift Absent

---

## Resolution Summary

Display:

* Employee Returned
* Reliever Deployed
* Recruitment Requested
* Position Filled
* Employee Resigned
* Employee Terminated

---

## Performance Summary

Display:

* Tasks Submitted
* Pending Reviews
* Average OE Score
* Average RM Score
* Average AVP Score

---

# Verification Queue

Purpose:
Main working screen for OE.

Every absent employee becomes a case.

---

## Filters

* Date
* Region
* State
* Client
* Site
* Shift
* Status

---

## Queue Table

Columns:

* Employee Name
* Employee Code
* Client
* Site
* Designation
* Shift
* Absent Date
* Consecutive Absent Days
* Reliever Status
* Case Status
* Assigned OE

Actions:

* Open Case
* Update
* Submit
* Escalate

---

# Case Details Screen

This is the primary screen.

---

## Employee Information

Display:

* Employee Name
* Employee Code
* Designation
* Client
* Site
* Joining Date

---

## Absence Verification

Question:

Why is employee absent?

Options:

* Sick Leave
* Approved Leave
* Unapproved Leave
* Personal Emergency
* Salary Issue
* Family Emergency
* Absconding
* Resigned
* Terminated
* Unknown

---

## Contact Verification

Checkboxes:

* Employee Contacted
* Supervisor Contacted
* Site Incharge Contacted

Remarks

---

## Employee Status Verification

Question:

Has employee left the organization?

Options:

* Yes
* No

If Yes:

Display:

* Last Working Date
* Exit Reason

Exit Reason:

* Resigned
* Terminated
* Absconded

---

# Reliever Tracking

Question:

Was reliever deployed?

Options:

* Yes
* No

If Yes:

Fields:

* Reliever Name
* Employee Code
* Deployment Date
* Site

Status:

* Assigned
* Present
* Completed

---

# Vacancy Tracking

Question:

Is position vacant?

Options:

* Yes
* No

If Yes:

Display:

* Vacancy Raised Date
* Recruitment Requested
* Expected Joining Date
* Hiring Status

Status:

* Open
* Interviewing
* Offer Released
* Joining Expected
* Filled

---

# Resolution Section

Resolution Type:

* Employee Returned
* Reliever Deployed
* Position Filled
* Recruitment In Progress
* Employee Resigned
* Employee Terminated
* Requirement Closed

Resolution Remarks

Next Follow-Up Date

Evidence Upload

---

# Evidence Section

Allow:

* Photos
* Documents
* Screenshots
* Call Notes
* Resolution Attachments

---

# Scoring Workflow

Every attendance verification task carries a score.

Example:

Attendance Verification & Resolution

Weightage = 4

---

## OE Self Rating

After verification completion:

Display:

Activity:
Attendance Verification & Resolution

Weightage:
4

OE Rating:
0 - 4

OE Remarks

Submit for Review

---

## RM Review

RM reviews:

* Verification
* Resolution
* Evidence
* OE Score

Fields:

RM Rating:
0 - 4

RM Remarks

Actions:

* Approve
* Reject
* Send Back

---

## AVP Review

AVP reviews:

* Case Details
* Resolution
* Evidence
* OE Rating
* RM Rating

Fields:

AVP Rating:
0 - 4

AVP Remarks

Actions:

* Final Approve
* Reject
* Reopen

---

# Approval Timeline

Workflow:

OE
↓
RM
↓
AVP

Timeline Display:

* User
* Action
* Date
* Remarks
* Score

---

# Case Status Flow

Verification Pending
↓
Under Investigation
↓
Resolution Updated
↓
OE Submitted
↓
RM Reviewed
↓
AVP Approved
↓
Closed

---

# Analytics

## Absence Reason Analysis

* Sick Leave
* Leave
* Resigned
* Absconded
* Other

---

## Reliever Coverage %

Relievers Deployed / Total Absentees

---

## Vacancy Analysis

* Open Positions
* Filled Positions
* Recruitment Pending

---

## Performance Analytics

Display:

* OE Average Score
* RM Average Score
* AVP Average Score

---

## Site-wise Absenteeism

Chart by:

* Site
* Client
* Region

---

# Data Structure

interface AttendanceVerificationCase {
id: string;

employeeName: string;
employeeCode: string;
designation: string;

client: string;
site: string;
shift: string;

absentDate: string;
consecutiveAbsentDays: number;

absenceReason: string;

employeeLeft: boolean;

relieverDeployed: boolean;
relieverName?: string;

vacancyRaised: boolean;
expectedJoiningDate?: string;

resolutionType: string;

evidence: string[];

weightage: number;

oeRating?: number;
oeRemarks?: string;

rmRating?: number;
rmRemarks?: string;

avpRating?: number;
avpRemarks?: string;

finalScore?: number;

status: string;
}

# Success Criteria

The module should behave like an operational manpower verification, resolution, and scoring system where every absentee case becomes a task for the OE, is resolved operationally, and is then scored through the OE → RM → AVP hierarchy.
