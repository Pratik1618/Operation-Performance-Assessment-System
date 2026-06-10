# OCRMS - Operations Compliance & Performance Management System

# Master Implementation Plan

## Overview

OCRMS is an Operations Compliance and Performance Management System designed for Facility Management operations.

The system is built around operational activities performed by Operation Executives (OE).

The Excel sheet represents an Activity Index.

Each row in the Excel is an operational activity that:

* Has a frequency
* Requires verification or execution
* Requires evidence
* Carries a weightage
* Is reviewed through hierarchy
* Contributes to OE performance scoring

This is NOT a collection of separate modules.

This is a Task Driven Operational Compliance System.

---

# Core Business Workflow

Activity Generated
↓
Assigned to OE
↓
OE Completes Activity
↓
Evidence Uploaded
↓
OE Self Rating
↓
RM Review
↓
AVP Review
↓
Final Score
↓
Closed

---

# System Architecture

## 1. Dashboard

## 2. My Tasks

## 3. Task Details

## 4. Reviews & Approvals

## 5. Reports

## 6. Analytics

## 7. Activity Master

## 8. Settings

---

# 1. Dashboard

File:
app/page.tsx

Purpose:
Provide operational visibility.

---

## KPI Cards

Display:

* Total Activities Assigned
* Pending Activities
* Completed Activities
* Overdue Activities
* Current Compliance %
* Current Score
* Pending RM Reviews
* Pending AVP Reviews

---

## Frequency Summary

Display:

* Daily Activities
* Weekly Activities
* Fortnightly Activities
* Monthly Activities
* One-Time Activities

Each card should show:

* Assigned
* Completed
* Pending

---

## Activity Compliance Chart

Show compliance by:

* Daily Activities
* Weekly Activities
* Monthly Activities

---

## Score Trend

Display:

* OE Score Trend
* RM Score Trend
* AVP Score Trend

---

## Recent Activity Feed

Display latest:

* Submitted Activities
* Reviewed Activities
* Approved Activities

---

# 2. Activity Master

File:
app/activity-master/page.tsx

Purpose:
Central activity configuration.

Each activity from Excel becomes an Activity Master record.

---

## Fields

* Activity Name
* Activity Code
* Description
* Category
* Frequency
* Weightage
* Evidence Type
* Assigned Role
* Approval Flow
* Active Status

---

## Frequency

Options:

* Daily
* Weekly
* Fortnightly
* Monthly
* One-Time

---

## Evidence Types

* Image
* PDF
* Excel
* Video
* Audio
* Signature
* Multiple

---

# 3. Activity Categories

Activities should be grouped.

---

## Attendance Verification

Activities:

* Absent Report
* Reliever Report
* Non App Usage Count
* Attendance Submission
* Leave Approval
* Missing In-Out Time
* Regularization
* Non App Follow Up
* Weekoff Mapping

---

## Site Operations

Activities:

* Site Visit Report
* Next Month Visit Plan
* Visit Calendar Upload
* Site Mapping

---

## Training

Activities:

* Training Report
* Training Videos

---

## Procurement & Logistics

Activities:

* Material Delivery Status
* Material Punch Compliance
* Uniform Request
* Shoes Request
* Sweater Request
* Uniform Issuance
* Shoes Issuance

---

## Employee Relations

Activities:

* Employee Grievance
* Referral Marking

---

## Incident & Compliance

Activities:

* Incident Report
* Snaglist Report
* Deep Cleaning Report
* Pest Control Report

---

## Planning & Recognition

Activities:

* R&R Schedule
* R&R Completion

---

## Reporting & Closure

Activities:

* MOM Report
* Closure Report
* Daily Closure Report

---

## Quality & Feedback

Activities:

* Feedback
* Material Quality
* Customer Service Report
* Client Referral

---

# 4. Task Generation Engine

Purpose:
Generate tasks automatically.

---

## Daily Tasks

Generate every day.

Examples:

* Absent Report
* Reliever Report
* Site Visit Report
* Employee Grievance
* Incident Report
* Daily Closure Report

---

## Weekly Tasks

Generate weekly.

Examples:

* Leave Approval
* Missing In-Out Time
* Regularization
* Deep Cleaning Report

---

## Monthly Tasks

Generate monthly.

Examples:

* Training Report
* Attendance Submission
* Material Compliance
* Feedback
* Visit Plan

---

# 5. My Tasks

File:
app/my-tasks/page.tsx

Purpose:
Main working screen for OE.

This is the most important screen.

---

## Filters

* Frequency
* Status
* Category
* Site
* Client

---

## Task Table

Columns:

* Activity
* Category
* Frequency
* Due Date
* Site
* Client
* Status
* Weightage
* Score
* Actions

---

## Status

* Pending
* In Progress
* Submitted
* RM Reviewed
* AVP Approved
* Closed

---

# 6. Task Detail Screen

File:
app/tasks/[id]/page.tsx

Purpose:
Dynamic activity execution screen.

The form changes based on activity type.

---

## Common Sections

### Activity Information

* Activity Name
* Frequency
* Weightage
* Due Date

---

### Activity Form

Dynamic fields based on activity.

Example:

Absent Report:

* Total Employees Absent
* Reason
* Employee Left
* Reliever Deployed
* Position Filled
* Expected Joining Date

---

Site Visit:

* Client
* Site
* Visit Notes
* Observation

---

Employee Grievance:

* Employee
* Issue
* Resolution

---

Incident:

* Incident
* Severity
* Resolution

---

### Evidence Upload

Support:

* Images
* PDFs
* Excel
* Audio
* Video

---

### Remarks

OE Comments

---

### Self Rating

Display:

Weightage: 4

OE Rating:
0 to 4

OE Remarks

---

### Submit

Submit for RM Review

---

# 7. Reviews & Approvals

File:
app/reviews/page.tsx

Purpose:
RM and AVP review activities.

---

## RM Review Queue

Display:

* Submitted Tasks
* OE Score
* Evidence
* Remarks

Actions:

* Approve
* Reject
* Send Back

RM Rating:
0 - Weightage

RM Remarks

---

## AVP Review Queue

Display:

* OE Rating
* RM Rating
* Evidence
* History

Actions:

* Final Approve
* Reject
* Reopen

AVP Rating:
0 - Weightage

AVP Remarks

---

# 8. Scoring Engine

Every activity has a weightage.

Example:

Absent Report

Weightage = 4

---

## Scores

OE Score

RM Score

AVP Score

Final Score

---

## Performance Formula

Final Score =
AVP Score

OR

Average of OE + RM + AVP

Based on company policy.

---

# 9. Reports

Purpose:
Generate operational reports.

---

## Reports

* Daily Operations Report
* Weekly Operations Report
* Monthly Operations Report
* Attendance Verification Report
* Site Visit Report
* Grievance Report
* Incident Report
* Procurement Report
* Feedback Report

---

# 10. Analytics

Purpose:
Management visibility.

---

## Compliance Analytics

* Activity Compliance %
* Frequency Compliance %
* Category Compliance %

---

## Performance Analytics

* OE Performance
* RM Performance
* AVP Performance

---

## Activity Analytics

* Top Completed Activities
* Overdue Activities
* Low Compliance Activities

---

# Success Criteria

The application should function as a task-driven operational compliance and performance management platform.

The primary object in the system is an Activity Task.

Every activity from the Excel becomes a configurable activity template that generates operational tasks, collects evidence, captures ratings, and moves through the OE → RM → AVP review hierarchy until final closure.
