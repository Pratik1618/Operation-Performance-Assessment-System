// ─────────────────────────────────────────────
// OCRMS Central Mock Data
// Operations Compliance & Reporting Management System
// ─────────────────────────────────────────────

import type {
  Site, Client, OperationalTask, SiteVisit, VisitPlan,
  AttendanceRecord, Grievance, Incident, ClientInteraction,
  ChatThread, ChatMessage, Referral, ProcurementRequest,
  MaterialQuality, UniformRecord, RREvent, ClosureReport,
  FeedbackScore, Approval, OCRMSDashboardKPI, Notification,
  AttendanceVerificationCase, ActivityTemplate, ActivityCategory,
  FormFieldSchema,
} from '@/lib/types';

// ── Clients ──
export const clients: Client[] = [
  { id: 'CLT_001', name: 'Infosys BPO', code: 'INFO', industry: 'IT Services', contactPerson: 'Rajiv Menon', contactPhone: '9876543210', contactEmail: 'rajiv.m@infosys.com', sitesCount: 3, status: 'active' },
  { id: 'CLT_002', name: 'Wipro Technologies', code: 'WIPRO', industry: 'IT Services', contactPerson: 'Sunita Rao', contactPhone: '9876543211', contactEmail: 'sunita.r@wipro.com', sitesCount: 2, status: 'active' },
  { id: 'CLT_003', name: 'DLF Cyber City', code: 'DLF', industry: 'Real Estate', contactPerson: 'Amit Khanna', contactPhone: '9876543212', contactEmail: 'amit.k@dlf.in', sitesCount: 2, status: 'active' },
  { id: 'CLT_004', name: 'Reliance Jio', code: 'RJIO', industry: 'Telecom', contactPerson: 'Priya Sharma', contactPhone: '9876543213', contactEmail: 'priya.s@jio.com', sitesCount: 2, status: 'active' },
  { id: 'CLT_005', name: 'HDFC Bank', code: 'HDFC', industry: 'Banking', contactPerson: 'Vikram Das', contactPhone: '9876543214', contactEmail: 'vikram.d@hdfc.com', sitesCount: 1, status: 'active' },
  { id: 'CLT_006', name: 'Amazon India', code: 'AMZ', industry: 'E-Commerce', contactPerson: 'Neha Gupta', contactPhone: '9876543215', contactEmail: 'neha.g@amazon.in', sitesCount: 2, status: 'active' },
];

// ── Sites ──
export const sites: Site[] = [
  { id: 'SITE_001', code: 'INFO-GGN-01', name: 'Infosys Gurgaon Tower A', client: 'Infosys BPO', clientId: 'CLT_001', region: 'North', state: 'Haryana', zone: 'NCR', assignedOE: 'Ravi Shankar', assignedRM: 'Suresh Kumar', assignedAVP: 'Venkat Raman', status: 'active', employeeCount: 45, address: 'Cyber City, Sector 21, Gurgaon' },
  { id: 'SITE_002', code: 'INFO-BLR-01', name: 'Infosys Bangalore EC', client: 'Infosys BPO', clientId: 'CLT_001', region: 'South', state: 'Karnataka', zone: 'Bangalore', assignedOE: 'Anjali Desai', assignedRM: 'Manoj Pillai', assignedAVP: 'Venkat Raman', status: 'active', employeeCount: 62, address: 'Electronic City Phase 1, Bangalore' },
  { id: 'SITE_003', code: 'WIPRO-PUN-01', name: 'Wipro Hinjewadi Campus', client: 'Wipro Technologies', clientId: 'CLT_002', region: 'West', state: 'Maharashtra', zone: 'Pune', assignedOE: 'Kiran Nair', assignedRM: 'Rajesh Kumar', assignedAVP: 'Deepa Menon', status: 'active', employeeCount: 38, address: 'Hinjewadi Phase 2, Pune' },
  { id: 'SITE_004', code: 'DLF-DEL-01', name: 'DLF Cyber Hub Delhi', client: 'DLF Cyber City', clientId: 'CLT_003', region: 'North', state: 'Delhi', zone: 'NCR', assignedOE: 'Ravi Shankar', assignedRM: 'Suresh Kumar', assignedAVP: 'Venkat Raman', status: 'active', employeeCount: 55, address: 'Cyber Hub, DLF Phase 3, Delhi' },
  { id: 'SITE_005', code: 'RJIO-MUM-01', name: 'Jio Centre Mumbai', client: 'Reliance Jio', clientId: 'CLT_004', region: 'West', state: 'Maharashtra', zone: 'Mumbai', assignedOE: 'Kiran Nair', assignedRM: 'Rajesh Kumar', assignedAVP: 'Deepa Menon', status: 'active', employeeCount: 72, address: 'BKC, Mumbai' },
  { id: 'SITE_006', code: 'HDFC-CHN-01', name: 'HDFC Tower Chennai', client: 'HDFC Bank', clientId: 'CLT_005', region: 'South', state: 'Tamil Nadu', zone: 'Chennai', assignedOE: 'Anjali Desai', assignedRM: 'Manoj Pillai', assignedAVP: 'Venkat Raman', status: 'active', employeeCount: 30, address: 'SIPCOT IT Park, Chennai' },
  { id: 'SITE_007', code: 'AMZ-HYD-01', name: 'Amazon Hyderabad FC', client: 'Amazon India', clientId: 'CLT_006', region: 'South', state: 'Telangana', zone: 'Hyderabad', assignedOE: 'Priya Sen', assignedRM: 'Manoj Pillai', assignedAVP: 'Venkat Raman', status: 'active', employeeCount: 95, address: 'Financial District, Hyderabad' },
  { id: 'SITE_008', code: 'INFO-NOI-01', name: 'Infosys Noida SEZ', client: 'Infosys BPO', clientId: 'CLT_001', region: 'North', state: 'Uttar Pradesh', zone: 'NCR', assignedOE: 'Ravi Shankar', assignedRM: 'Suresh Kumar', assignedAVP: 'Venkat Raman', status: 'active', employeeCount: 50, address: 'Sector 135, Noida' },
  { id: 'SITE_009', code: 'DLF-GGN-02', name: 'DLF Gateway Gurgaon', client: 'DLF Cyber City', clientId: 'CLT_003', region: 'North', state: 'Haryana', zone: 'NCR', assignedOE: 'Ravi Shankar', assignedRM: 'Suresh Kumar', assignedAVP: 'Venkat Raman', status: 'active', employeeCount: 42, address: 'DLF Gateway Tower, Gurgaon' },
  { id: 'SITE_010', code: 'WIPRO-BLR-01', name: 'Wipro Sarjapur Road', client: 'Wipro Technologies', clientId: 'CLT_002', region: 'South', state: 'Karnataka', zone: 'Bangalore', assignedOE: 'Anjali Desai', assignedRM: 'Manoj Pillai', assignedAVP: 'Venkat Raman', status: 'active', employeeCount: 48, address: 'Sarjapur Road, Bangalore' },
  { id: 'SITE_011', code: 'RJIO-DEL-01', name: 'Jio Plaza Delhi', client: 'Reliance Jio', clientId: 'CLT_004', region: 'North', state: 'Delhi', zone: 'NCR', assignedOE: 'Ravi Shankar', assignedRM: 'Suresh Kumar', assignedAVP: 'Venkat Raman', status: 'active', employeeCount: 35, address: 'Connaught Place, New Delhi' },
  { id: 'SITE_012', code: 'AMZ-BLR-01', name: 'Amazon Bellandur Hub', client: 'Amazon India', clientId: 'CLT_006', region: 'South', state: 'Karnataka', zone: 'Bangalore', assignedOE: 'Anjali Desai', assignedRM: 'Manoj Pillai', assignedAVP: 'Venkat Raman', status: 'active', employeeCount: 80, address: 'Bellandur, Bangalore' },
];

// ── 36 Excel-mapped Activity Templates ──
export const activityTemplates: ActivityTemplate[] = [
  // 1. Attendance Verification
  {
    id: 'TPL-ATT-001',
    code: 'ACT-ATT-01',
    name: 'Absent Report',
    description: 'Verify and log employee absenteeism, reasons, and reliever deployment status.',
    category: 'Attendance Verification',
    frequency: 'daily',
    weightage: 5,
    evidenceTypes: ['pdf', 'image'],
    formSchema: [
      { id: 'totalAbsent', label: 'Total Employees Absent', type: 'number', required: true, placeholder: 'Count of absent staff' },
      { id: 'absenceReason', label: 'Primary Reason for Absence (Why)', type: 'select', required: true, options: ['Sick Leave', 'Approved Leave', 'Unapproved Leave', 'Personal Emergency', 'Salary Issue', 'Absconding', 'Resigned', 'Other'] },
      { id: 'employeeLeftFilledDate', label: 'If Employee Left, When will the Position get Filled?', type: 'date', required: false },
      { id: 'relieverDeployed', label: 'Is Reliever Deployed? (Yes/No)', type: 'select', required: true, options: ['Yes', 'No'] },
      { id: 'relieverName', label: 'Reliever Name (if deployed)', type: 'text', required: false, placeholder: 'Full name' }
    ],
    approvalFlow: ['oe', 'rm', 'avp'],
    active: true,
    assignedRoles: 'OE,hrbp',
    approvalFlowText: 'OE → RM → AVP → BH; HRBP → HR DR'
  },
  {
    id: 'TPL-ATT-002',
    code: 'ACT-ATT-02',
    name: 'Reliever Report',
    description: 'Track reliever shifts, designations, and verify deployments against rosters.',
    category: 'Attendance Verification',
    frequency: 'daily',
    weightage: 5,
    evidenceTypes: ['image'],
    formSchema: [
      { id: 'relieverCount', label: 'Total Relievers Positioned', type: 'number', required: true },
      { id: 'rosterMatch', label: 'Roster Verified & Matched', type: 'checkbox', required: true },
      { id: 'relieverDetails', label: 'Reliever Deployment Details & Roster Remarks', type: 'textarea', required: false }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'OE,hrbp',
    approvalFlowText: 'OE → RM → AVP → BH; HRBP → HR DR'
  },
  {
    id: 'TPL-ATT-003',
    code: 'ACT-ATT-03',
    name: 'Non App Usage Count',
    description: 'Monitor count of guards or staff not checking in via the mobile application.',
    category: 'Attendance Verification',
    frequency: 'daily',
    weightage: 5,
    evidenceTypes: ['excel'],
    formSchema: [
      { id: 'nonAppCount', label: 'Non-App Users Count', type: 'number', required: true },
      { id: 'reasonDescription', label: 'Reasons for Non-App Usage', type: 'textarea', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'OE,hrbp',
    approvalFlowText: 'OE → RM → AVP → BH; HRBP → HR DR'
  },
  {
    id: 'TPL-ATT-004',
    code: 'ACT-ATT-04',
    name: 'Attendance Submission',
    description: 'Monthly summary check of site attendance and roster completion.',
    category: 'Attendance Verification',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['pdf', 'excel'],
    formSchema: [
      { id: 'billingDays', label: 'Total Billing Days Calculated', type: 'number', required: true },
      { id: 'reconciled', label: 'Reconciliation with client complete', type: 'checkbox', required: true }
    ],
    approvalFlow: ['oe', 'rm', 'avp'],
    active: true,
    assignedRoles: 'OE,hrbp',
    approvalFlowText: 'OE → RM → AVP → BH; HRBP → HR DR'
  },
  {
    id: 'TPL-ATT-005',
    code: 'ACT-ATT-05',
    name: 'Leave Approval',
    description: 'Review and log team leave applications and approvals for the week.',
    category: 'Attendance Verification',
    frequency: 'weekly',
    weightage: 5,
    evidenceTypes: ['pdf'],
    formSchema: [
      { id: 'leavesApproved', label: 'Number of Leaves Approved', type: 'number', required: true },
      { id: 'backfillPlanned', label: 'Backfill Scheduled for all leaves', type: 'checkbox', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'OE,hrbp',
    approvalFlowText: 'OE → RM → AVP → BH; HRBP → HR DR'
  },
  {
    id: 'TPL-ATT-006',
    code: 'ACT-ATT-06',
    name: 'Missing In-Out Time',
    description: 'Trace and regularize records with incomplete clock-in/out timestamps.',
    category: 'Attendance Verification',
    frequency: 'weekly',
    weightage: 5,
    evidenceTypes: ['signature'],
    formSchema: [
      { id: 'missingPunchesCount', label: 'Total Missing Punch Cases', type: 'number', required: true },
      { id: 'resolvedCount', label: 'Total Cases Resolved/Updated', type: 'number', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'OE,hrbp,if back office hod',
    approvalFlowText: 'OE → HOD → RM → AVP; HRBP → HR DR'
  },
  {
    id: 'TPL-ATT-007',
    code: 'ACT-ATT-07',
    name: 'Regularization',
    description: 'Authorize and submit regularization requests with client-approved evidence.',
    category: 'Attendance Verification',
    frequency: 'weekly',
    weightage: 5,
    evidenceTypes: ['image', 'pdf'],
    formSchema: [
      { id: 'regularizationDetails', label: 'Regularization Details', type: 'textarea', required: true },
      { id: 'clientApproved', label: 'Client Approved and Countersigned', type: 'checkbox', required: true }
    ],
    approvalFlow: ['oe', 'rm', 'avp'],
    active: true,
    assignedRoles: 'OE,hrbp,if back office hod',
    approvalFlowText: 'OE → HOD → RM → AVP; HRBP → HR DR'
  },
  {
    id: 'TPL-ATT-008',
    code: 'ACT-ATT-08',
    name: 'Non App Follow Up',
    description: 'Daily follow-up check to migrate non-app users into mobile punch usage.',
    category: 'Attendance Verification',
    frequency: 'daily',
    weightage: 5,
    evidenceTypes: ['image'],
    formSchema: [
      { id: 'followUpCount', label: 'Followed Up Count', type: 'number', required: true },
      { id: 'devicesRegistered', label: 'Devices Newly Registered Today', type: 'number', required: true }
    ],
    approvalFlow: ['oe'],
    active: true,
    assignedRoles: 'oe,hrbp,hr dr',
    approvalFlowText: 'OE → RM → AVP → BH; HRBP → HR DR'
  },
  {
    id: 'TPL-ATT-009',
    code: 'ACT-ATT-09',
    name: 'Weekoff Mapping',
    description: 'Ensure correct roster shift adjustments and mapped rest day slots.',
    category: 'Attendance Verification',
    frequency: 'daily',
    weightage: 5,
    evidenceTypes: ['excel'],
    formSchema: [
      { id: 'weekoffRosterUpdated', label: 'Weekoff Roster Updated in System', type: 'checkbox', required: true }
    ],
    approvalFlow: ['oe'],
    active: true,
    assignedRoles: 'hrbp,oe',
    approvalFlowText: 'OE → RM → AVP → BH; HRBP → HR DR'
  },

  // 2. Site Operations
  {
    id: 'TPL-OPS-001',
    code: 'ACT-OPS-01',
    name: 'Site Visit Report',
    description: 'Standard client visit verification containing grooming, registers, and checklists.',
    category: 'Site Operations',
    frequency: 'daily',
    weightage: 5,
    evidenceTypes: ['image', 'signature'],
    formSchema: [
      { id: 'checklistScore', label: 'Checklist Adherence Score (out of 34)', type: 'number', required: true },
      { id: 'observations', label: 'Critical Site Observations', type: 'textarea', required: true },
      { id: 'clientFeedback', label: 'Client Feedback Notes', type: 'textarea', required: false }
    ],
    approvalFlow: ['oe', 'rm', 'avp'],
    active: true,
    assignedRoles: 'oe,rm,avp,bh,dr',
    approvalFlowText: 'OE → RM → AVP → BH → DR'
  },
  {
    id: 'TPL-OPS-002',
    code: 'ACT-OPS-02',
    name: 'Next Month Visit Plan',
    description: 'Prepare next month visit planner schedule for mapped sites.',
    category: 'Site Operations',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['pdf'],
    formSchema: [
      { id: 'plannedVisitsCount', label: 'Total Scheduled Site Visits', type: 'number', required: true },
      { id: 'submissionConfirm', label: 'Confirming before 26th cycle limit', type: 'checkbox', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'oe,rm,avp,bh,dr',
    approvalFlowText: 'OE → RM → AVP → BH → DR'
  },
  {
    id: 'TPL-OPS-003',
    code: 'ACT-OPS-03',
    name: 'Visit Calendar Upload',
    description: 'Upload locked visit calendar schedule and route for regional manager approval.',
    category: 'Site Operations',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['excel'],
    formSchema: [
      { id: 'calendarUploaded', label: 'Calendar File Uploaded Correctly', type: 'checkbox', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'oe,rm,avp,bh,dr',
    approvalFlowText: 'OE → RM → AVP → BH → DR'
  },
  {
    id: 'TPL-OPS-004',
    code: 'ACT-OPS-04',
    name: 'Site Mapping',
    description: 'Review and update employee-to-site assignments and client contact information.',
    category: 'Site Operations',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['excel'],
    formSchema: [
      { id: 'employeesMappedCount', label: 'Total Employees Mapped', type: 'number', required: true },
      { id: 'rosterLocked', label: ' Roster Mapped and Confirmed', type: 'checkbox', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'oe,commerical',
    approvalFlowText: 'OE → Commercial → AVP → BH'
  },

  // 3. Training
  {
    id: 'TPL-TRN-001',
    code: 'ACT-TRN-01',
    name: 'Training Report',
    description: 'Document classroom or field training sessions, topics, and list of participants.',
    category: 'Training',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['image', 'pdf'],
    formSchema: [
      { id: 'topic', label: 'Training Session Topic', type: 'text', required: true },
      { id: 'participants', label: 'Number of Attending Staff', type: 'number', required: true },
      { id: 'duration', label: 'Duration of Training (Hours)', type: 'number', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'trainers,th,oe',
    approvalFlowText: 'Trainers → TH → OE → AVP'
  },
  {
    id: 'TPL-TRN-002',
    code: 'ACT-TRN-02',
    name: 'Training Videos',
    description: 'Submit video clips of training events or drills as proof of performance.',
    category: 'Training',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['video'],
    formSchema: [
      { id: 'videoTopic', label: 'Video Topic Description', type: 'text', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'trainers,th,oe',
    approvalFlowText: 'Trainers → TH → OE → AVP'
  },

  // 4. Procurement & Logistics
  {
    id: 'TPL-PRO-001',
    code: 'ACT-PRO-01',
    name: 'Material Delivery Status',
    description: 'Verify logistics delivery status of chemicals, mops, or security tools.',
    category: 'Procurement & Logistics',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['pdf'],
    formSchema: [
      { id: 'challanNo', label: 'Delivery Challan Number', type: 'text', required: true },
      { id: 'receivedInFull', label: 'Received in Full and Undamaged', type: 'checkbox', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'oe,ph',
    approvalFlowText: 'OE → PH → AVP → BH'
  },
  {
    id: 'TPL-PRO-002',
    code: 'ACT-PRO-02',
    name: 'Material Punch Performance',
    description: 'Audit material logbooks and register items matching purchase orders.',
    category: 'Procurement & Logistics',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['excel'],
    formSchema: [
      { id: 'registerMatch', label: 'Register entries match Challans', type: 'checkbox', required: true }
    ],
    approvalFlow: ['oe'],
    active: true,
    assignedRoles: 'oe,ph',
    approvalFlowText: 'OE → PH → AVP → BH'
  },
  {
    id: 'TPL-PRO-003',
    code: 'ACT-PRO-03',
    name: 'Uniform Request',
    description: 'Submit size configuration and counts for new guard or employee uniforms.',
    category: 'Procurement & Logistics',
    frequency: 'one-time',
    weightage: 5,
    evidenceTypes: ['pdf'],
    formSchema: [
      { id: 'sizeNeeded', label: 'Uniform Sizes Required', type: 'select', required: true, options: ['S', 'M', 'L', 'XL', 'XXL'] },
      { id: 'qty', label: 'Quantity Requested', type: 'number', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'oe,ph',
    approvalFlowText: 'OE → PH → AVP → BH'
  },
  {
    id: 'TPL-PRO-004',
    code: 'ACT-PRO-04',
    name: 'Shoes Request',
    description: 'Request boots/safety shoes size adjustments for onsite workers.',
    category: 'Procurement & Logistics',
    frequency: 'one-time',
    weightage: 5,
    evidenceTypes: ['pdf'],
    formSchema: [
      { id: 'shoeSize', label: 'Shoe Sizes Required', type: 'select', required: true, options: ['6', '7', '8', '9', '10', '11'] },
      { id: 'qty', label: 'Quantity Requested', type: 'number', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'oe,ph',
    approvalFlowText: 'OE → PH → AVP → BH'
  },
  {
    id: 'TPL-PRO-005',
    code: 'ACT-PRO-05',
    name: 'Sweater Request',
    description: 'Winter woolens requirement checklist for security guards.',
    category: 'Procurement & Logistics',
    frequency: 'one-time',
    weightage: 5,
    evidenceTypes: ['pdf'],
    formSchema: [
      { id: 'qty', label: 'Quantity of Sweaters Needed', type: 'number', required: true }
    ],
    approvalFlow: ['oe'],
    active: true,
    assignedRoles: 'oe,ph',
    approvalFlowText: 'OE → PH → AVP → BH'
  },
  {
    id: 'TPL-PRO-006',
    code: 'ACT-PRO-06',
    name: 'Uniform Issuance',
    description: 'Submit proof of uniform distribution with signatures/handover records.',
    category: 'Procurement & Logistics',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['signature', 'image'],
    formSchema: [
      { id: 'issuedSets', label: 'Uniform Sets Distributed', type: 'number', required: true },
      { id: 'allEmployeesCovered', label: 'Handover complete for all candidates', type: 'checkbox', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'oe,ph',
    approvalFlowText: 'OE → PH → AVP → BH'
  },
  {
    id: 'TPL-PRO-007',
    code: 'ACT-PRO-07',
    name: 'Shoes Issuance',
    description: 'Submit shoe distribution records and upload handover sheets.',
    category: 'Procurement & Logistics',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['signature', 'image'],
    formSchema: [
      { id: 'issuedBoots', label: 'Pairs of Boots Distributed', type: 'number', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'oe,ph',
    approvalFlowText: 'OE → PH → AVP → BH'
  },

  // 5. Employee Relations
  {
    id: 'TPL-EMP-001',
    code: 'ACT-EMP-01',
    name: 'Employee Grievance',
    description: 'Log workforce grievances, voice/call recordings, and track resolutions.',
    category: 'Employee Relations',
    frequency: 'daily',
    weightage: 5,
    evidenceTypes: ['audio', 'pdf'],
    formSchema: [
      { id: 'employeeName', label: 'Employee Name', type: 'text', required: true },
      { id: 'grievanceType', label: 'Grievance Type', type: 'select', required: true, options: ['Salary Delayed', 'Washroom issue', 'Overtime dispute', 'Supervisor behavior', 'Safety hazard'] },
      { id: 'description', label: 'Complaint details', type: 'textarea', required: true },
      { id: 'urgency', label: 'Urgency / Severity Level', type: 'select', required: true, options: ['Low', 'Medium', 'High'] }
    ],
    approvalFlow: ['oe', 'rm', 'avp'],
    active: true,
    assignedRoles: 'hrbp,hr dr',
    approvalFlowText: 'HRBP → HR DR'
  },
  {
    id: 'TPL-EMP-002',
    code: 'ACT-EMP-02',
    name: 'Referral Marking',
    description: 'Mark employee recruitment referral codes and confirm candidates completing 90-day cycle.',
    category: 'Employee Relations',
    frequency: 'daily',
    weightage: 5,
    evidenceTypes: ['pdf'],
    formSchema: [
      { id: 'referrerCode', label: 'Referrer Employee ID', type: 'text', required: true },
      { id: 'candidateName', label: 'Referred Candidate Name', type: 'text', required: true },
      { id: 'joinedDate', label: 'Joining Date', type: 'date', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'hrbp,oe',
    approvalFlowText: 'OE → RM → AVP → BH; HRBP → HR DR'
  },

  // 6. Incident & Performance
  {
    id: 'TPL-INC-001',
    code: 'ACT-INC-01',
    name: 'Incident Report',
    description: 'Log details of accidents, fire, theft, or machinery breakdown.',
    category: 'Incident & Performance',
    frequency: 'daily',
    weightage: 5,
    evidenceTypes: ['image', 'pdf'],
    formSchema: [
      { id: 'incidentId', label: 'Incident ID Number', type: 'text', required: true },
      { id: 'type', label: 'Incident Type', type: 'select', required: true, options: ['Accident/Injury', 'Theft/Loss', 'Fire/Short-Circuit', 'Trespassing', 'Equipment Breakdown'] },
      { id: 'severity', label: 'Severity Level', type: 'select', required: true, options: ['Low', 'Medium', 'High', 'Critical'] },
      { id: 'actions', label: 'Immediate Corrective Action Details', type: 'textarea', required: true }
    ],
    approvalFlow: ['oe', 'rm', 'avp'],
    active: true,
    assignedRoles: 'hrbp,oe,hr dr',
    approvalFlowText: 'OE → RM → AVP → BH; HRBP → HR DR'
  },
  {
    id: 'TPL-INC-002',
    code: 'ACT-INC-02',
    name: 'Snaglist Report',
    description: 'Inspect facility issues, outline snags, and schedule fixes.',
    category: 'Incident & Performance',
    frequency: 'fortnightly',
    weightage: 5,
    evidenceTypes: ['image'],
    formSchema: [
      { id: 'openSnags', label: 'Count of Open Snags Identified', type: 'number', required: true },
      { id: 'snagDetails', label: 'Location and Snag Details', type: 'textarea', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'oe,hrbp',
    approvalFlowText: 'OE → RM → AVP → BH; HRBP → HR DR'
  },
  {
    id: 'TPL-INC-003',
    code: 'ACT-INC-03',
    name: 'Deep Cleaning Report',
    description: 'Validate cleaning audits for specific critical chambers or machine floors.',
    category: 'Incident & Performance',
    frequency: 'weekly',
    weightage: 5,
    evidenceTypes: ['image'],
    formSchema: [
      { id: 'cleaningScore', label: 'Cleanliness Rating (1-10)', type: 'number', required: true },
      { id: 'chemicalUsed', label: 'Chemical Cleaner Batch Verified', type: 'checkbox', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'oe,hrbp',
    approvalFlowText: 'OE → RM → AVP → BH; HRBP → HR DR'
  },
  {
    id: 'TPL-INC-004',
    code: 'ACT-INC-04',
    name: 'Pest Control Report',
    description: 'Review pest control schedules, chemicals sprayed, and certifications.',
    category: 'Incident & Performance',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['pdf'],
    formSchema: [
      { id: 'sprayDone', label: 'Pest Control Spray Done', type: 'checkbox', required: true },
      { id: 'vendorCertificate', label: 'Vendor Service Certificate Attached', type: 'checkbox', required: true }
    ],
    approvalFlow: ['oe'],
    active: true,
    assignedRoles: 'oe,hrbp',
    approvalFlowText: 'OE → RM → AVP → BH; HRBP → HR DR'
  },

  // 7. Planning & Recognition
  {
    id: 'TPL-PLN-001',
    code: 'ACT-PLN-01',
    name: 'R&R Schedule',
    description: 'Plan rewards & recognition ceremonies and log dates.',
    category: 'Planning & Recognition',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['pdf'],
    formSchema: [
      { id: 'awardNomineesCount', label: 'Nominees Selected Count', type: 'number', required: true },
      { id: 'ceremonyDate', label: 'Proposed Ceremony Date', type: 'date', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'hrbp,hr dr',
    approvalFlowText: 'HRBP → HR DR'
  },
  {
    id: 'TPL-PLN-002',
    code: 'ACT-PLN-02',
    name: 'R&R Completion',
    description: 'Confirm reward distribution and submit photos of recognition awards.',
    category: 'Planning & Recognition',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['image'],
    formSchema: [
      { id: 'winnersList', label: 'Award Winners Names', type: 'textarea', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'hrbp,hr dr',
    approvalFlowText: 'HRBP → HR DR'
  },

  // 8. Reporting & Closure
  {
    id: 'TPL-REP-001',
    code: 'ACT-REP-01',
    name: 'MOM Report',
    description: 'Submit Minutes of Meeting (MOM) details of monthly reviews with client.',
    category: 'Reporting & Closure',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['pdf'],
    formSchema: [
      { id: 'clientRepsPresent', label: 'Client Representatives Present', type: 'text', required: true },
      { id: 'keyDecisions', label: 'Key Decisions & Action Points', type: 'textarea', required: true }
    ],
    approvalFlow: ['oe', 'rm', 'avp'],
    active: true,
    assignedRoles: 'oe,rm,avp,bh,dr',
    approvalFlowText: 'OE → RM → AVP → BH → DR'
  },
  {
    id: 'TPL-REP-002',
    code: 'ACT-REP-02',
    name: 'Closure Report',
    description: 'Audit snag resolutions and submit sign-offs for performance items.',
    category: 'Reporting & Closure',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['pdf'],
    formSchema: [
      { id: 'resolvedCount', label: 'Count of Closed Items', type: 'number', required: true },
      { id: 'signOffObtained', label: 'Client Sign-off Sheet Scanned', type: 'checkbox', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'oe,rm,avp,bh,dr',
    approvalFlowText: 'OE → RM → AVP → BH → DR'
  },
  {
    id: 'TPL-REP-003',
    code: 'ACT-REP-03',
    name: 'Daily Closure Report',
    description: 'Review daily manpower status, keys handover, and log shifts closure.',
    category: 'Reporting & Closure',
    frequency: 'daily',
    weightage: 5,
    evidenceTypes: ['image'],
    formSchema: [
      { id: 'incidentFree', label: 'Shift was Incident Free', type: 'checkbox', required: true },
      { id: 'handoverComplete', label: 'Keys and Register Handovers Done', type: 'checkbox', required: true }
    ],
    approvalFlow: ['oe'],
    active: true,
    assignedRoles: 'oe,rm,',
    approvalFlowText: 'OE → RM → AVP → BH'
  },

  // 9. Quality & Feedback
  {
    id: 'TPL-QLY-001',
    code: 'ACT-QLY-01',
    name: 'Feedback',
    description: 'Log monthly customer satisfaction survey score and comments.',
    category: 'Quality & Feedback',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['pdf'],
    formSchema: [
      { id: 'csatScore', label: 'CSAT Rating (0-100)', type: 'number', required: true },
      { id: 'remarks', label: 'Feedback & Improvement Remarks', type: 'textarea', required: true }
    ],
    approvalFlow: ['oe', 'rm', 'avp'],
    active: true,
    assignedRoles: 'oe,rm,avp,bh,dr',
    approvalFlowText: 'OE → RM → AVP → BH → DR'
  },
  {
    id: 'TPL-QLY-002',
    code: 'ACT-QLY-02',
    name: 'Material Quality',
    description: 'Perform batch quality audits on housekeeping cleaning kits.',
    category: 'Quality & Feedback',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['image'],
    formSchema: [
      { id: 'dilutionVerified', label: 'Dilution batches verified', type: 'checkbox', required: true },
      { id: 'qualityRating', label: 'Housekeeping kit Quality rating (1-5)', type: 'number', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'oe,ph',
    approvalFlowText: 'OE → PH → AVP → BH'
  },
  {
    id: 'TPL-QLY-003',
    code: 'ACT-QLY-03',
    name: 'Customer Service Report',
    description: 'Draft monthly CSR summaries, SLA parameters met, and KPI averages.',
    category: 'Quality & Feedback',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['pdf'],
    formSchema: [
      { id: 'slaAdherence', label: 'SLA Adherence rate %', type: 'number', required: true }
    ],
    approvalFlow: ['oe', 'rm', 'avp'],
    active: true,
    assignedRoles: 'oe,rm,avp,bh,dr',
    approvalFlowText: 'OE → RM → AVP → BH → DR'
  },
  {
    id: 'TPL-QLY-004',
    code: 'ACT-QLY-04',
    name: 'Client Referral',
    description: 'Log client requests, leads, and introductions for business expansions.',
    category: 'Quality & Feedback',
    frequency: 'monthly',
    weightage: 5,
    evidenceTypes: ['pdf'],
    formSchema: [
      { id: 'contactName', label: 'Lead Representative Name', type: 'text', required: true },
      { id: 'notes', label: 'Lead & Contact Details', type: 'textarea', required: true }
    ],
    approvalFlow: ['oe', 'rm'],
    active: true,
    assignedRoles: 'oe,hrbp',
    approvalFlowText: 'OE → RM → AVP → BH; HRBP → HR DR'
  }
];

// Helper to calculate scoring based on a mock policy
const calculateScore = (task: Partial<OperationalTask>, policy?: string): number => {
  const oe = task.oeRating || 0;
  const rm = task.rmRating || 0;
  const avp = task.avpRating || 0;
  const bh = task.bhRating || 0;
  const weightage = task.weightage || 5;

  let activeRating = oe;
  if (task.status === 'bh_approved' && task.bhRating !== undefined) {
    activeRating = bh;
  } else if (task.avpRating !== undefined) {
    activeRating = avp;
  } else if (task.rmRating !== undefined) {
    activeRating = rm;
  }
  
  return activeRating * weightage;
};

// ── Generate Operational Task Records ──
function generateTasks(policy: string = 'avp_only'): OperationalTask[] {
  const tasks: OperationalTask[] = [];
  let id = 1;
  const siteSubset = sites.slice(0, 6);
  
  for (const site of siteSubset) {
    for (const tpl of activityTemplates) {
      // Pick statuses round-robin
      const statuses: OperationalTask['status'][] = ['pending', 'in_progress', 'oe_submitted', 'rm_approved', 'avp_approved', 'bh_approved', 'overdue'];
      const status = statuses[id % statuses.length];
      
      const task: OperationalTask = {
        id: `TASK_${String(id).padStart(4, '0')}`,
        templateId: tpl.id,
        taskName: tpl.name,
        category: tpl.category,
        frequency: tpl.frequency,
        weightage: tpl.weightage,
        dueDate: `2026-06-${String((id % 28) + 1).padStart(2, '0')}`,
        siteId: site.id,
        siteName: site.name,
        clientName: site.client,
        status,
        evidenceCount: ['approved', 'bh_approved', 'avp_approved', 'rm_approved'].includes(status) ? 3 : ['oe_submitted', 'submitted'].includes(status) ? 2 : status === 'in_progress' ? 1 : 0,
        evidenceUrls: ['approved', 'bh_approved', 'avp_approved', 'rm_approved'].includes(status) ? ['challan.pdf', 'site_pic.jpg'] : [],
        remarks: ['approved', 'bh_approved', 'avp_approved', 'rm_approved'].includes(status) ? 'Verified and approved' : status === 'overdue' ? 'Pending submission' : '',
        assignedTo: site.assignedOE,
        formData: ['approved', 'bh_approved', 'avp_approved', 'rm_approved', 'oe_submitted', 'submitted'].includes(status) ? {
          totalAbsent: 2,
          absenceReason: 'Sick Leave',
          employeeLeftFilledDate: '2026-06-25',
          relieverDeployed: 'Yes',
          relieverName: 'Sunil Verma'
        } : undefined
      };
      
      // Assign ratings based on status
      if (['approved', 'bh_approved', 'avp_approved', 'rm_approved'].includes(status)) {
        task.oeRating = tpl.weightage;
        task.oeRemarks = 'Everything is compliant.';
        task.oeSubmittedDate = `2026-06-${String(Math.min((id % 28) + 1, 28)).padStart(2, '0')}`;
        
        if (['rm_approved', 'avp_approved', 'bh_approved', 'approved'].includes(status)) {
          task.rmRating = tpl.weightage;
          task.rmRemarks = 'Audit verified.';
          task.rmReviewedDate = `2026-06-${String(Math.min((id % 28) + 1, 28)).padStart(2, '0')}`;
        }
        
        if (['avp_approved', 'bh_approved', 'approved'].includes(status)) {
          task.avpRating = tpl.weightage;
          task.avpRemarks = 'Closed and rated.';
          task.avpApprovedDate = `2026-06-${String(Math.min((id % 28) + 1, 28)).padStart(2, '0')}`;
        }
        
        if (status === 'bh_approved') {
          task.bhRating = tpl.weightage;
          task.bhRemarks = 'BH final signoff.';
          task.bhApprovedDate = `2026-06-${String(Math.min((id % 28) + 1, 28)).padStart(2, '0')}`;
        }

        task.finalScore = calculateScore(task, policy);
      } else if (status === 'oe_submitted' || status === 'submitted') {
        task.oeRating = Math.max(1, tpl.weightage - 1);
        task.oeRemarks = 'Completed with minor issues.';
        task.oeSubmittedDate = `2026-06-${String(Math.min((id % 28) + 1, 28)).padStart(2, '0')}`;
      }
      
      tasks.push(task);
      id++;
    }
  }
  return tasks;
}

export const operationalTasks: OperationalTask[] = generateTasks();

// ── Dynamic Scoring calculation helper (exportable) ──
export function recomputeScores(tasksList: OperationalTask[], policy: string): OperationalTask[] {
  return tasksList.map(task => {
    if (
      task.status === 'approved' || 
      task.status === 'bh_approved' || 
      task.status === 'avp_approved' || 
      task.status === 'rm_approved'
    ) {
      return {
        ...task,
        finalScore: calculateScore(task, policy)
      };
    }
    return task;
  });
}

// ── Helper ──
const randomStatus = (): OperationalTask['status'] => {
  const arr: OperationalTask['status'][] = ['pending', 'in_progress', 'submitted', 'approved', 'rejected', 'overdue'];
  return arr[Math.floor(Math.random() * arr.length)];
};

// ── Dashboard KPIs ──
export const dashboardKPI: OCRMSDashboardKPI = {
  totalAssigned: operationalTasks.length,
  completed: operationalTasks.filter(t => ['approved', 'bh_approved'].includes(t.status)).length,
  pending: operationalTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length,
  overdue: operationalTasks.filter(t => t.status === 'overdue').length,
  compliancePercent: Math.round((operationalTasks.filter(t => ['approved', 'bh_approved', 'avp_approved', 'rm_approved', 'oe_submitted', 'submitted'].includes(t.status)).length / operationalTasks.length) * 100),
  siteVisitsCompleted: 18,
  pendingApprovals: operationalTasks.filter(t => ['oe_submitted', 'submitted'].includes(t.status)).length,
  openIncidents: 5,
  dailyCompliance: 82,
  weeklyCompliance: 91,
  fortnightlyCompliance: 88,
  monthlyCompliance: 76,
};

// ── Compliance Trends ──
export const dailyComplianceTrend = [
  { day: 'Mon', compliance: 85, target: 90 },
  { day: 'Tue', compliance: 88, target: 90 },
  { day: 'Wed', compliance: 82, target: 90 },
  { day: 'Thu', compliance: 91, target: 90 },
  { day: 'Fri', compliance: 87, target: 90 },
  { day: 'Sat', compliance: 93, target: 90 },
];

export const monthlyComplianceTrend = [
  { month: 'Jan', compliance: 78, tasks: 180 },
  { month: 'Feb', compliance: 82, tasks: 185 },
  { month: 'Mar', compliance: 80, tasks: 190 },
  { month: 'Apr', compliance: 85, tasks: 195 },
  { month: 'May', compliance: 88, tasks: 200 },
  { month: 'Jun', compliance: 84, tasks: 210 },
];

export const regionPerformance = [
  { region: 'North', compliance: 87, sites: 5, score: 8.2 },
  { region: 'South', compliance: 91, sites: 4, score: 8.6 },
  { region: 'West', compliance: 83, sites: 3, score: 7.9 },
];

export const categoryCompletion = [
  { name: 'Attendance', completed: 85, total: 100 },
  { name: 'Site Visit', completed: 18, total: 22 },
  { name: 'Client', completed: 30, total: 38 },
  { name: 'Safety', completed: 12, total: 15 },
  { name: 'Operations', completed: 42, total: 50 },
  { name: 'HR', completed: 28, total: 35 },
  { name: 'Procurement', completed: 14, total: 20 },
];

// ── Site Visits ──
export const siteVisits: SiteVisit[] = [
  { id: 'VIS_001', site: 'Infosys Gurgaon Tower A', siteId: 'SITE_001', client: 'Infosys BPO', visitDate: '2025-06-02', plannedTime: '10:00 AM', actualTime: '10:15 AM', status: 'completed', clientSignature: true, geoTagged: true, photos: 4, notes: 'All checkpoints verified. Minor cleaning issue in lobby.', checklistScore: 30, visitedBy: 'Ravi Shankar' },
  { id: 'VIS_002', site: 'Infosys Bangalore EC', siteId: 'SITE_002', client: 'Infosys BPO', visitDate: '2025-06-03', plannedTime: '09:30 AM', actualTime: '09:45 AM', status: 'completed', clientSignature: true, geoTagged: true, photos: 3, notes: 'Fire extinguisher check completed. Staff grooming audit passed.', checklistScore: 32, visitedBy: 'Anjali Desai' },
  { id: 'VIS_003', site: 'Wipro Hinjewadi Campus', siteId: 'SITE_003', client: 'Wipro Technologies', visitDate: '2025-06-05', plannedTime: '11:00 AM', status: 'planned', clientSignature: false, geoTagged: false, photos: 0, notes: '', visitedBy: 'Kiran Nair' },
  { id: 'VIS_004', site: 'DLF Cyber Hub Delhi', siteId: 'SITE_004', client: 'DLF Cyber City', visitDate: '2025-06-04', plannedTime: '02:00 PM', actualTime: '02:30 PM', status: 'completed', clientSignature: true, geoTagged: true, photos: 5, notes: 'Snag list items addressed. Parking area inspection done.', checklistScore: 28, visitedBy: 'Ravi Shankar' },
  { id: 'VIS_005', site: 'Jio Centre Mumbai', siteId: 'SITE_005', client: 'Reliance Jio', visitDate: '2025-06-01', plannedTime: '10:00 AM', status: 'missed', clientSignature: false, geoTagged: false, photos: 0, notes: 'OE was on leave. Rescheduled to next week.', visitedBy: 'Kiran Nair' },
  { id: 'VIS_006', site: 'HDFC Tower Chennai', siteId: 'SITE_006', client: 'HDFC Bank', visitDate: '2025-06-06', plannedTime: '09:00 AM', status: 'planned', clientSignature: false, geoTagged: false, photos: 0, notes: '', visitedBy: 'Anjali Desai' },
  { id: 'VIS_007', site: 'Amazon Hyderabad FC', siteId: 'SITE_007', client: 'Amazon India', visitDate: '2025-06-05', plannedTime: '10:30 AM', actualTime: '10:35 AM', status: 'completed', clientSignature: true, geoTagged: true, photos: 6, notes: 'Warehouse cleanliness excellent. New fire exit signage installed.', checklistScore: 33, visitedBy: 'Priya Sen' },
];

// ── Attendance Records ──
export const attendanceRecords: AttendanceRecord[] = [
  // Absentees
  { id: 'ATT_001', employeeName: 'Ramesh Yadav', employeeCode: 'EMP1001', client: 'Infosys BPO', site: 'Infosys Gurgaon Tower A', siteId: 'SITE_001', shift: 'First', date: '2026-06-09', issueType: 'absent', relieverAssigned: 'Sunil Verma', replacementRequired: true, status: 'Reliever Assigned', remarks: 'Reliever deployed successfully' },
  { id: 'ATT_002', employeeName: 'Priya Sharma', employeeCode: 'EMP1012', client: 'Infosys BPO', site: 'Infosys Bangalore EC', siteId: 'SITE_002', shift: 'Second', date: '2026-06-09', issueType: 'absent', replacementRequired: true, status: 'Open', remarks: 'Unplanned absence reported' },
  { id: 'ATT_003', employeeName: 'Suresh Babu', employeeCode: 'EMP2003', client: 'Wipro Technologies', site: 'Wipro Hinjewadi Campus', siteId: 'SITE_003', shift: 'Third', date: '2026-06-09', issueType: 'absent', replacementRequired: true, status: 'Open', remarks: 'No-show for third shift' },
  { id: 'ATT_004', employeeName: 'Lakshmi Nair', employeeCode: 'EMP2010', client: 'HDFC Bank', site: 'HDFC Tower Chennai', siteId: 'SITE_006', shift: 'First', date: '2026-06-09', issueType: 'absent', relieverAssigned: 'Gopal Raj', replacementRequired: true, status: 'Covered', remarks: 'Sick leave pre-approved' },
  { id: 'ATT_005', employeeName: 'Ketan Patel', employeeCode: 'EMP3022', client: 'Reliance Jio', site: 'Jio Centre Mumbai', siteId: 'SITE_005', shift: 'Second', date: '2026-06-09', issueType: 'absent', replacementRequired: false, status: 'Open', remarks: 'Casual leave' },
  { id: 'ATT_006', employeeName: 'Rajesh Kumar', employeeCode: 'EMP4005', client: 'DLF Cyber City', site: 'DLF Cyber Hub Delhi', siteId: 'SITE_004', shift: 'First', date: '2026-06-09', issueType: 'absent', replacementRequired: true, status: 'Escalated', remarks: 'No contact established. 3rd occurrence.' },

  // Missing Punches
  { id: 'ATT_011', employeeName: 'Meera Devi', employeeCode: 'EMP1015', client: 'Infosys BPO', site: 'Infosys Gurgaon Tower A', siteId: 'SITE_001', shift: 'First', date: '2026-06-09', issueType: 'missing_in', status: 'Open', punchTime: 'Out: 06:00 PM', remarks: 'Out punch recorded. Missing In punch' },
  { id: 'ATT_012', employeeName: 'Arun Kumar', employeeCode: 'EMP3005', client: 'Wipro Technologies', site: 'Wipro Hinjewadi Campus', siteId: 'SITE_003', shift: 'First', date: '2026-06-09', issueType: 'missing_out', status: 'Pending Review', punchTime: 'In: 08:30 AM', remarks: 'In punch recorded. Missing Out punch' },
  { id: 'ATT_013', employeeName: 'Mohammad Ali', employeeCode: 'EMP3009', client: 'Wipro Technologies', site: 'Wipro Hinjewadi Campus', siteId: 'SITE_003', shift: 'Second', date: '2026-06-08', issueType: 'missing_in', status: 'Open', punchTime: 'Out: 10:00 PM', remarks: 'Second shift out recorded' },
  { id: 'ATT_014', employeeName: 'Sita Ram', employeeCode: 'EMP1020', client: 'Infosys BPO', site: 'Infosys Gurgaon Tower A', siteId: 'SITE_001', shift: 'Third', date: '2026-06-08', issueType: 'missing_out', status: 'Regularized', punchTime: 'In: 09:30 PM', remarks: 'Approved. System failure during night storm' },
  { id: 'ATT_015', employeeName: 'Karan Singh', employeeCode: 'EMP5011', client: 'Amazon India', site: 'Amazon Hyderabad FC', siteId: 'SITE_007', shift: 'Third', date: '2026-06-08', issueType: 'missing_in', status: 'Open', punchTime: 'Out: 06:00 AM', remarks: 'Clock-out logged, missing clock-in' },

  // Regularizations
  { id: 'ATT_021', employeeName: 'Fatima Bi', employeeCode: 'EMP4002', client: 'DLF Cyber City', site: 'DLF Cyber Hub Delhi', siteId: 'SITE_004', shift: 'First', date: '2026-06-08', issueType: 'regularization', status: 'Open', reason: 'Client Duty', submittedDate: '2026-06-08', remarks: 'Forgot to punch in due to emergency client audit support', evidenceUrl: 'client_letter.jpg' },
  { id: 'ATT_022', employeeName: 'Dinesh Patel', employeeCode: 'EMP5008', client: 'Reliance Jio', site: 'Jio Centre Mumbai', siteId: 'SITE_005', shift: 'Second', date: '2026-06-07', issueType: 'regularization', status: 'Open', reason: 'Biometric Failure', submittedDate: '2026-06-08', remarks: 'Biometric fingerprint scanner would not accept entry', evidenceUrl: 'fingerprint_error.jpg' },
  { id: 'ATT_023', employeeName: 'Anjali Desai', employeeCode: 'EMP2044', client: 'Infosys BPO', site: 'Infosys Bangalore EC', siteId: 'SITE_002', shift: 'First', date: '2026-06-06', issueType: 'regularization', status: 'Regularized', reason: 'Mobile App Issue', submittedDate: '2026-06-07', remarks: 'Mobile application crashed repeatedly at entry' },
  { id: 'ATT_024', employeeName: 'Rohan Sharma', employeeCode: 'EMP1099', client: 'Infosys BPO', site: 'Infosys Noida SEZ', siteId: 'SITE_008', shift: 'Second', date: '2026-06-05', issueType: 'regularization', status: 'Open', reason: 'Site Emergency', submittedDate: '2026-06-06', remarks: 'Evacuating site due to power short circuit', evidenceUrl: 'fire_exit_log.png' },

  // Non-App Users
  { id: 'ATT_031', employeeName: 'Babulal Prasad', employeeCode: 'EMP8001', client: 'Infosys BPO', site: 'Infosys Gurgaon Tower A', siteId: 'SITE_001', shift: 'First', date: '2026-06-09', issueType: 'non_app', status: 'Open', deviceType: 'Feature Phone', appStatus: 'Not Installed', lastAttendanceMethod: 'Manual Register', registrationStatus: 'Pending Registration', manualEntriesCount: 22 },
  { id: 'ATT_032', employeeName: 'Gita Devi', employeeCode: 'EMP8005', client: 'DLF Cyber City', site: 'DLF Cyber Hub Delhi', siteId: 'SITE_004', shift: 'Second', date: '2026-06-09', issueType: 'non_app', status: 'Open', deviceType: 'Redmi 9 (No Data)', appStatus: 'Not Installed', lastAttendanceMethod: 'Manual Register', registrationStatus: 'Pending Registration', manualEntriesCount: 18 },
  { id: 'ATT_033', employeeName: 'Sohan Singh', employeeCode: 'EMP8009', client: 'Reliance Jio', site: 'Jio Centre Mumbai', siteId: 'SITE_005', shift: 'Third', date: '2026-06-09', issueType: 'non_app', status: 'Open', deviceType: 'Vivo Y12', appStatus: 'Not Installed', lastAttendanceMethod: 'Manual Register', registrationStatus: 'Pending Registration', manualEntriesCount: 26 },
  { id: 'ATT_034', employeeName: 'Kiran Nair', employeeCode: 'EMP8014', client: 'Wipro Technologies', site: 'Wipro Hinjewadi Campus', siteId: 'SITE_003', shift: 'First', date: '2026-06-09', issueType: 'non_app', status: 'Regularized', deviceType: 'iPhone 11', appStatus: 'Installed', lastAttendanceMethod: 'Mobile Punch', registrationStatus: 'Registered Device', manualEntriesCount: 4 }
];

// ── Grievances ──
export const grievances: Grievance[] = [
  { id: 'GRV_001', employeeName: 'Raju Prasad', employeeCode: 'EMP1008', site: 'Infosys Gurgaon Tower A', siteId: 'SITE_001', category: 'salary', complaint: 'Salary not credited for May 2025. PF deduction issue.', hasVoiceRecording: true, date: '2025-06-02', priority: 'high', status: 'under_review', assignedTo: 'Suresh Kumar' },
  { id: 'GRV_002', employeeName: 'Kavita Sharma', employeeCode: 'EMP2012', site: 'Infosys Bangalore EC', siteId: 'SITE_002', category: 'workplace', complaint: 'Washroom facilities are not maintained properly on 3rd floor.', hasVoiceRecording: false, date: '2025-06-03', priority: 'medium', status: 'open', assignedTo: 'Manoj Pillai' },
  { id: 'GRV_003', employeeName: 'Mohammad Ali', employeeCode: 'EMP3009', site: 'Wipro Hinjewadi Campus', siteId: 'SITE_003', category: 'safety', complaint: 'Emergency exit door on B-wing is jammed.', hasVoiceRecording: false, date: '2025-06-01', priority: 'high', status: 'resolved', resolution: 'Door repaired by maintenance team on June 2nd.', resolvedDate: '2025-06-02', assignedTo: 'Rajesh Kumar' },
  { id: 'GRV_004', employeeName: 'Geeta Devi', employeeCode: 'EMP4015', site: 'DLF Cyber Hub Delhi', siteId: 'SITE_004', category: 'harassment', complaint: 'Verbal abuse by supervisor during night shift.', hasVoiceRecording: true, date: '2025-06-04', priority: 'high', status: 'under_review', assignedTo: 'Suresh Kumar' },
  { id: 'GRV_005', employeeName: 'Prakash Jha', employeeCode: 'EMP5003', site: 'Jio Centre Mumbai', siteId: 'SITE_005', category: 'leave', complaint: 'Leave application pending for 15 days. No response from supervisor.', hasVoiceRecording: false, date: '2025-05-28', priority: 'low', status: 'closed', resolution: 'Leave approved and credited.', resolvedDate: '2025-06-01', assignedTo: 'Rajesh Kumar' },
];

// ── Incidents ──
export const incidents: Incident[] = [
  { id: 'INC_001', incidentNumber: 'INC-2025-0042', site: 'Infosys Gurgaon Tower A', siteId: 'SITE_001', client: 'Infosys BPO', type: 'theft', severity: 'high', description: 'Laptop stolen from conference room B-12 during night shift.', photos: 3, actionTaken: 'CCTV footage reviewed. Police complaint filed. Site secured.', status: 'investigating', reportedDate: '2025-06-03', reportedBy: 'Ravi Shankar' },
  { id: 'INC_002', incidentNumber: 'INC-2025-0043', site: 'Wipro Hinjewadi Campus', siteId: 'SITE_003', client: 'Wipro Technologies', type: 'accident', severity: 'medium', description: 'Housekeeping staff slipped on wet floor in cafeteria area.', photos: 2, actionTaken: 'First aid provided. Wet floor signs placed. Incident documented.', resolution: 'Employee recovered. Safety briefing conducted.', status: 'resolved', reportedDate: '2025-06-02', reportedBy: 'Kiran Nair', resolvedDate: '2025-06-03' },
  { id: 'INC_003', incidentNumber: 'INC-2025-0044', site: 'DLF Cyber Hub Delhi', siteId: 'SITE_004', client: 'DLF Cyber City', type: 'fire', severity: 'critical', description: 'Electrical short circuit in server room UPS unit.', photos: 5, actionTaken: 'Fire brigade called. Area evacuated. Power shut off to server room.', status: 'investigating', reportedDate: '2025-06-05', reportedBy: 'Ravi Shankar' },
  { id: 'INC_004', incidentNumber: 'INC-2025-0045', site: 'Amazon Hyderabad FC', siteId: 'SITE_007', client: 'Amazon India', type: 'equipment_failure', severity: 'low', description: 'CCTV camera #14 in warehouse section C not functioning.', photos: 1, actionTaken: 'Vendor notified for replacement. Temporary portable camera deployed.', resolution: 'Camera replaced within 24 hours.', status: 'closed', reportedDate: '2025-06-01', reportedBy: 'Priya Sen', resolvedDate: '2025-06-02' },
  { id: 'INC_005', incidentNumber: 'INC-2025-0046', site: 'Jio Centre Mumbai', siteId: 'SITE_005', client: 'Reliance Jio', type: 'trespassing', severity: 'medium', description: 'Unauthorized person found in restricted parking area at 2 AM.', photos: 2, actionTaken: 'Person escorted out. Guard posted at entry point. CCTV coverage reviewed.', status: 'open', reportedDate: '2025-06-05', reportedBy: 'Kiran Nair' },
];

// ── Client Interactions ──
export const clientInteractions: ClientInteraction[] = [
  { id: 'CLI_001', clientName: 'Infosys BPO', clientId: 'CLT_001', site: 'Infosys Gurgaon Tower A', siteId: 'SITE_001', callDate: '2025-06-05', concern: 'Housekeeping quality has declined in the past week. Washrooms not being cleaned on schedule.', actionTaken: 'Deployed additional housekeeping staff. Increased inspection frequency.', resolutionStatus: 'resolved', handledBy: 'Ravi Shankar' },
  { id: 'CLI_002', clientName: 'Wipro Technologies', clientId: 'CLT_002', site: 'Wipro Hinjewadi Campus', siteId: 'SITE_003', callDate: '2025-06-04', concern: 'Security guard at main gate was found sleeping during night shift.', actionTaken: 'Guard issued warning letter. Shift rotation adjusted.', resolutionStatus: 'resolved', handledBy: 'Kiran Nair' },
  { id: 'CLI_003', clientName: 'DLF Cyber City', clientId: 'CLT_003', site: 'DLF Cyber Hub Delhi', siteId: 'SITE_004', callDate: '2025-06-05', concern: 'Parking area lights not working in basement level 2.', actionTaken: 'Electrician dispatched. Awaiting parts.', resolutionStatus: 'follow_up', followUpDate: '2025-06-07', handledBy: 'Ravi Shankar' },
  { id: 'CLI_004', clientName: 'Reliance Jio', clientId: 'CLT_004', site: 'Jio Centre Mumbai', siteId: 'SITE_005', callDate: '2025-06-03', concern: 'Client escalation — reception area not manned during lunch hours.', actionTaken: 'Roster adjusted to ensure overlap during lunch break.', resolutionStatus: 'escalated', handledBy: 'Kiran Nair' },
  { id: 'CLI_005', clientName: 'Amazon India', clientId: 'CLT_006', site: 'Amazon Hyderabad FC', siteId: 'SITE_007', callDate: '2025-06-05', concern: 'Request for additional security personnel during festival season.', actionTaken: 'Proposal sent for 4 additional guards. Awaiting approval.', resolutionStatus: 'open', handledBy: 'Priya Sen' },
];

// ── Chat Threads ──
export const chatThreads: ChatThread[] = [
  {
    id: 'CHAT_001', siteId: 'SITE_001', site: 'Infosys Gurgaon Tower A', client: 'Infosys BPO',
    lastMessage: 'Thanks, the housekeeping issue has been fixed.', lastTimestamp: '2025-06-05T14:30:00', unreadCount: 0,
    messages: [
      { id: 'MSG_001', siteId: 'SITE_001', site: 'Infosys Gurgaon Tower A', client: 'Infosys BPO', sender: 'client', senderName: 'Rajiv Menon', message: 'The washrooms on floor 3 are not cleaned since morning.', timestamp: '2025-06-05T09:15:00', hasAttachment: false },
      { id: 'MSG_002', siteId: 'SITE_001', site: 'Infosys Gurgaon Tower A', client: 'Infosys BPO', sender: 'oe', senderName: 'Ravi Shankar', message: 'Noted sir. Deploying additional housekeeping staff immediately.', timestamp: '2025-06-05T09:20:00', hasAttachment: false },
      { id: 'MSG_003', siteId: 'SITE_001', site: 'Infosys Gurgaon Tower A', client: 'Infosys BPO', sender: 'oe', senderName: 'Ravi Shankar', message: 'Done. Please check now. Attached photo evidence.', timestamp: '2025-06-05T10:30:00', hasAttachment: true },
      { id: 'MSG_004', siteId: 'SITE_001', site: 'Infosys Gurgaon Tower A', client: 'Infosys BPO', sender: 'client', senderName: 'Rajiv Menon', message: 'Thanks, the housekeeping issue has been fixed.', timestamp: '2025-06-05T14:30:00', hasAttachment: false },
    ],
  },
  {
    id: 'CHAT_002', siteId: 'SITE_005', site: 'Jio Centre Mumbai', client: 'Reliance Jio',
    lastMessage: 'We need the updated roster by tomorrow.', lastTimestamp: '2025-06-05T16:00:00', unreadCount: 2,
    messages: [
      { id: 'MSG_005', siteId: 'SITE_005', site: 'Jio Centre Mumbai', client: 'Reliance Jio', sender: 'client', senderName: 'Priya Sharma', message: 'Reception desk was unmanned during lunch today again.', timestamp: '2025-06-05T13:00:00', hasAttachment: false },
      { id: 'MSG_006', siteId: 'SITE_005', site: 'Jio Centre Mumbai', client: 'Reliance Jio', sender: 'oe', senderName: 'Kiran Nair', message: 'Apologies. We are adjusting the roster to ensure overlap.', timestamp: '2025-06-05T13:30:00', hasAttachment: false },
      { id: 'MSG_007', siteId: 'SITE_005', site: 'Jio Centre Mumbai', client: 'Reliance Jio', sender: 'client', senderName: 'Priya Sharma', message: 'We need the updated roster by tomorrow.', timestamp: '2025-06-05T16:00:00', hasAttachment: false },
    ],
  },
];

// ── Referrals ──
export const referrals: Referral[] = [
  { id: 'REF_001', referrerName: 'Ramesh Yadav', referrerCode: 'EMP1001', candidateName: 'Ajay Singh', site: 'Infosys Gurgaon Tower A', siteId: 'SITE_001', joiningDate: '2025-03-10', ninetyDayDate: '2025-06-08', daysCompleted: 87, rewardEligible: true, rewardStatus: 'pending', rewardAmount: 2000 },
  { id: 'REF_002', referrerName: 'Kavita Sharma', referrerCode: 'EMP2012', candidateName: 'Deepa Nair', site: 'Infosys Bangalore EC', siteId: 'SITE_002', joiningDate: '2025-02-15', ninetyDayDate: '2025-05-16', daysCompleted: 90, rewardEligible: true, rewardStatus: 'paid', rewardAmount: 2000 },
  { id: 'REF_003', referrerName: 'Arun Kumar', referrerCode: 'EMP3005', candidateName: 'Mohan Lal', site: 'Wipro Hinjewadi Campus', siteId: 'SITE_003', joiningDate: '2025-04-20', ninetyDayDate: '2025-07-19', daysCompleted: 46, rewardEligible: false, rewardStatus: 'pending', rewardAmount: 2000 },
  { id: 'REF_004', referrerName: 'Fatima Bi', referrerCode: 'EMP4002', candidateName: 'Salman Khan', site: 'DLF Cyber Hub Delhi', siteId: 'SITE_004', joiningDate: '2025-01-05', ninetyDayDate: '2025-04-05', daysCompleted: 90, rewardEligible: true, rewardStatus: 'paid', rewardAmount: 2000 },
  { id: 'REF_005', referrerName: 'Sita Ram', referrerCode: 'EMP1020', candidateName: 'Preeti Joshi', site: 'Infosys Gurgaon Tower A', siteId: 'SITE_001', joiningDate: '2025-05-01', ninetyDayDate: '2025-07-30', daysCompleted: 35, rewardEligible: false, rewardStatus: 'pending', rewardAmount: 2000 },
];

// ── Procurement Requests ──
export const procurementRequests: ProcurementRequest[] = [
  { id: 'PROC_001', requestNumber: 'PR-2025-0088', site: 'Infosys Gurgaon Tower A', siteId: 'SITE_001', material: 'Floor Cleaning Solution (20L)', quantity: 5, requestedDate: '2025-05-20', expectedDelivery: '2025-05-27', actualDelivery: '2025-05-26', status: 'delivered', withinTAT: true, requestedBy: 'Ravi Shankar' },
  { id: 'PROC_002', requestNumber: 'PR-2025-0089', site: 'Wipro Hinjewadi Campus', siteId: 'SITE_003', material: 'Security Uniforms (Set of 10)', quantity: 10, requestedDate: '2025-05-22', expectedDelivery: '2025-06-05', status: 'shipped', withinTAT: true, requestedBy: 'Kiran Nair' },
  { id: 'PROC_003', requestNumber: 'PR-2025-0090', site: 'DLF Cyber Hub Delhi', siteId: 'SITE_004', material: 'Fire Extinguisher Refill (5 units)', quantity: 5, requestedDate: '2025-05-15', expectedDelivery: '2025-05-22', actualDelivery: '2025-05-30', status: 'delivered', withinTAT: false, requestedBy: 'Ravi Shankar' },
  { id: 'PROC_004', requestNumber: 'PR-2025-0091', site: 'Amazon Hyderabad FC', siteId: 'SITE_007', material: 'CCTV Camera (Dome Type)', quantity: 2, requestedDate: '2025-06-01', expectedDelivery: '2025-06-10', status: 'ordered', withinTAT: true, requestedBy: 'Priya Sen' },
  { id: 'PROC_005', requestNumber: 'PR-2025-0092', site: 'Jio Centre Mumbai', siteId: 'SITE_005', material: 'Mop & Bucket Set', quantity: 8, requestedDate: '2025-05-28', expectedDelivery: '2025-06-04', status: 'approved', withinTAT: true, requestedBy: 'Kiran Nair' },
  { id: 'PROC_006', requestNumber: 'PR-2025-0093', site: 'HDFC Tower Chennai', siteId: 'SITE_006', material: 'Hand Sanitizer (5L Bottles)', quantity: 20, requestedDate: '2025-05-10', expectedDelivery: '2025-05-17', status: 'requested', withinTAT: false, requestedBy: 'Anjali Desai' },
];

// ── Material Quality ──
export const materialQuality: MaterialQuality[] = [
  { id: 'MQ_001', site: 'Infosys Gurgaon Tower A', siteId: 'SITE_001', auditDate: '2025-06-01', qualityScore: 88, issuesFound: 2, observations: 'Floor solution quality satisfactory. Toilet cleaner batch slightly diluted.', auditor: 'Ravi Shankar', trend: 'stable' },
  { id: 'MQ_002', site: 'Wipro Hinjewadi Campus', siteId: 'SITE_003', auditDate: '2025-06-02', qualityScore: 92, issuesFound: 1, observations: 'All materials meet quality standards. One batch of gloves undersized.', auditor: 'Kiran Nair', trend: 'improving' },
  { id: 'MQ_003', site: 'DLF Cyber Hub Delhi', siteId: 'SITE_004', auditDate: '2025-06-01', qualityScore: 74, issuesFound: 5, observations: 'Multiple issues: expired chemicals, torn mops, broken spray bottles.', auditor: 'Ravi Shankar', trend: 'declining' },
  { id: 'MQ_004', site: 'Amazon Hyderabad FC', siteId: 'SITE_007', auditDate: '2025-06-03', qualityScore: 95, issuesFound: 0, observations: 'Excellent quality across all materials. No issues found.', auditor: 'Priya Sen', trend: 'improving' },
  { id: 'MQ_005', site: 'Jio Centre Mumbai', siteId: 'SITE_005', auditDate: '2025-06-02', qualityScore: 81, issuesFound: 3, observations: 'Garbage bags tearing easily. Soap dispensers leaking.', auditor: 'Kiran Nair', trend: 'stable' },
];

// ── Uniform & Shoes ──
export const uniformRecords: UniformRecord[] = [
  { id: 'UNI_001', employeeName: 'Ramesh Yadav', employeeCode: 'EMP1001', site: 'Infosys Gurgaon Tower A', siteId: 'SITE_001', type: 'uniform', size: 'L', gender: 'male', designation: 'Security Guard', requestDate: '2025-05-15', issueDate: '2025-05-20', status: 'issued' },
  { id: 'UNI_002', employeeName: 'Meera Devi', employeeCode: 'EMP1015', site: 'Infosys Gurgaon Tower A', siteId: 'SITE_001', type: 'uniform', size: 'M', gender: 'female', designation: 'Housekeeping', requestDate: '2025-05-18', status: 'pending' },
  { id: 'UNI_003', employeeName: 'Suresh Babu', employeeCode: 'EMP2003', site: 'Infosys Bangalore EC', siteId: 'SITE_002', type: 'shoes', size: '9', gender: 'male', designation: 'Security Guard', requestDate: '2025-05-20', issueDate: '2025-05-28', status: 'issued' },
  { id: 'UNI_004', employeeName: 'Lakshmi K', employeeCode: 'EMP2010', site: 'Infosys Bangalore EC', siteId: 'SITE_002', type: 'uniform', size: 'S', gender: 'female', designation: 'Receptionist', requestDate: '2025-06-01', status: 'requested' },
  { id: 'UNI_005', employeeName: 'Arun Kumar', employeeCode: 'EMP3005', site: 'Wipro Hinjewadi Campus', siteId: 'SITE_003', type: 'sweater', size: 'XL', gender: 'male', designation: 'Security Supervisor', requestDate: '2025-05-10', issueDate: '2025-05-15', status: 'issued' },
  { id: 'UNI_006', employeeName: 'Fatima Bi', employeeCode: 'EMP4002', site: 'DLF Cyber Hub Delhi', siteId: 'SITE_004', type: 'shoes', size: '6', gender: 'female', designation: 'Housekeeping', requestDate: '2025-06-02', status: 'pending' },
  { id: 'UNI_007', employeeName: 'Dinesh Patel', employeeCode: 'EMP5008', site: 'Jio Centre Mumbai', siteId: 'SITE_005', type: 'uniform', size: 'L', gender: 'male', designation: 'Security Guard', requestDate: '2025-05-25', status: 'rejected' },
];

// ── R&R Events ──
export const rrEvents: RREvent[] = [
  { id: 'RR_001', site: 'Infosys Gurgaon Tower A', siteId: 'SITE_001', eventDate: '2025-06-15', eventType: 'Best Employee Award', description: 'Monthly recognition ceremony for top-performing security and housekeeping staff.', photos: 0, status: 'planned', coordinator: 'Ravi Shankar' },
  { id: 'RR_002', site: 'Infosys Bangalore EC', siteId: 'SITE_002', eventDate: '2025-06-01', eventType: 'Birthday Celebration', description: 'Group birthday celebration for June birthdays.', photos: 4, status: 'completed', coordinator: 'Anjali Desai' },
  { id: 'RR_003', site: 'Wipro Hinjewadi Campus', siteId: 'SITE_003', eventDate: '2025-06-20', eventType: 'Safety Week', description: 'Safety awareness week with training sessions and drills.', photos: 0, status: 'planned', coordinator: 'Kiran Nair' },
  { id: 'RR_004', site: 'DLF Cyber Hub Delhi', siteId: 'SITE_004', eventDate: '2025-05-30', eventType: 'Team Outing', description: 'Team outing and team building activity for site staff.', photos: 8, status: 'completed', coordinator: 'Ravi Shankar' },
];

// ── Closure Reports ──
export const closureReports: ClosureReport[] = [
  { id: 'CLR_001', site: 'Infosys Gurgaon Tower A', siteId: 'SITE_001', type: 'daily_closure', date: '2025-06-05', actionTaken: 'All daily tasks completed. 2 absent employees covered by relievers. No incidents reported.', closureDate: '2025-06-05', remarks: 'Smooth operations', status: 'closed', submittedBy: 'Ravi Shankar' },
  { id: 'CLR_002', site: 'Wipro Hinjewadi Campus', siteId: 'SITE_003', type: 'mom', date: '2025-06-04', actionTaken: 'Monthly review meeting with client. Discussed housekeeping improvements and guard rotation.', closureDate: '2025-06-04', remarks: 'Client satisfied with improvements', status: 'closed', submittedBy: 'Kiran Nair' },
  { id: 'CLR_003', site: 'DLF Cyber Hub Delhi', siteId: 'SITE_004', type: 'closure', date: '2025-06-05', actionTaken: 'Server room incident investigation ongoing. Fire safety audit scheduled.', closureDate: '', remarks: 'Pending fire department clearance', status: 'open', submittedBy: 'Ravi Shankar' },
  { id: 'CLR_004', site: 'Amazon Hyderabad FC', siteId: 'SITE_007', type: 'daily_closure', date: '2025-06-05', actionTaken: 'All shifts covered. Material delivery received. CCTV replacement completed.', closureDate: '2025-06-05', remarks: 'Excellent day', status: 'closed', submittedBy: 'Priya Sen' },
];

// ── Feedback Scores ──
export const feedbackScores: FeedbackScore[] = [
  { id: 'FB_001', site: 'Infosys Gurgaon Tower A', siteId: 'SITE_001', client: 'Infosys BPO', score: 82, band: 'better', month: 'May', year: 2025, comments: 'Good improvement in housekeeping. Security response time needs work.' },
  { id: 'FB_002', site: 'Infosys Bangalore EC', siteId: 'SITE_002', client: 'Infosys BPO', score: 91, band: 'best', month: 'May', year: 2025, comments: 'Excellent service. Very professional staff.' },
  { id: 'FB_003', site: 'Wipro Hinjewadi Campus', siteId: 'SITE_003', client: 'Wipro Technologies', score: 75, band: 'average', month: 'May', year: 2025, comments: 'Housekeeping needs improvement. Deep cleaning schedule not followed.' },
  { id: 'FB_004', site: 'DLF Cyber Hub Delhi', siteId: 'SITE_004', client: 'DLF Cyber City', score: 58, band: 'poor', month: 'May', year: 2025, comments: 'Multiple complaints. Parking area lights pending. Guard sleeping incident.' },
  { id: 'FB_005', site: 'Jio Centre Mumbai', siteId: 'SITE_005', client: 'Reliance Jio', score: 68, band: 'average', month: 'May', year: 2025, comments: 'Reception coverage issue. Need to address lunch hour gaps.' },
  { id: 'FB_006', site: 'HDFC Tower Chennai', siteId: 'SITE_006', client: 'HDFC Bank', score: 88, band: 'better', month: 'May', year: 2025, comments: 'Clean premises. Courteous staff. Minor grooming issues.' },
  { id: 'FB_007', site: 'Amazon Hyderabad FC', siteId: 'SITE_007', client: 'Amazon India', score: 94, band: 'best', month: 'May', year: 2025, comments: 'Outstanding service. Quick incident resolution. Well-maintained facility.' },
];

// ── Approvals ──
export const approvals: Approval[] = [
  { id: 'APR_001', taskId: 'TASK_0001', taskName: 'Absent Report', site: 'Infosys Gurgaon Tower A', stage: 'rm_review', status: 'pending', assignedTo: 'USR_RM1', assignedToName: 'Suresh Kumar', createdAt: '2025-06-05T10:00:00' },
  { id: 'APR_002', taskId: 'TASK_0037', taskName: 'Absent Report', site: 'Infosys Bangalore EC', stage: 'avp_review', status: 'pending', assignedTo: 'USR_AVP1', assignedToName: 'Venkat Raman', createdAt: '2025-06-04T14:00:00' },
  { id: 'APR_003', taskId: 'TASK_0073', taskName: 'Absent Report', site: 'Wipro Hinjewadi Campus', stage: 'rm_review', status: 'approved', assignedTo: 'USR_RM2', assignedToName: 'Rajesh Kumar', remarks: 'Verified and approved', createdAt: '2025-06-03T09:00:00', processedAt: '2025-06-03T16:00:00', processedBy: 'Rajesh Kumar' },
];

// ── Pending Widgets (for Dashboard) ──
export const todaysPendingTasks = operationalTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').slice(0, 6);
export const overdueReports = operationalTasks.filter(t => t.status === 'overdue').slice(0, 5);
export const recentSiteVisits = siteVisits.filter(v => v.status === 'completed').slice(0, 4);
export const openGrievances = grievances.filter(g => g.status === 'open' || g.status === 'under_review');
export const openClientIssues = clientInteractions.filter(c => c.resolutionStatus === 'open' || c.resolutionStatus === 'escalated');
export const openIncidentsList = incidents.filter(i => i.status === 'open' || i.status === 'investigating');
export const upcomingRREvents = rrEvents.filter(r => r.status === 'planned');

// ── Attendance Verification & Resolution Cases Mock Data ──
export const attendanceVerificationCases: AttendanceVerificationCase[] = [
  {
    id: 'CASE_001',
    employeeName: 'Ramesh Yadav',
    employeeCode: 'EMP1001',
    designation: 'Security Guard',
    client: 'Infosys BPO',
    site: 'Infosys Gurgaon Tower A',
    shift: 'First',
    absentDate: '2026-06-09',
    consecutiveAbsentDays: 1,
    absenceReason: 'Unknown',
    employeeLeft: false,
    relieverDeployed: false,
    resolutionType: 'Pending',
    evidence: [],
    weightage: 4,
    status: 'Verification Pending'
  },
  {
    id: 'CASE_002',
    employeeName: 'Priya Sharma',
    employeeCode: 'EMP1012',
    designation: 'Housekeeper',
    client: 'Infosys BPO',
    site: 'Infosys Bangalore EC',
    shift: 'Second',
    absentDate: '2026-06-09',
    consecutiveAbsentDays: 2,
    absenceReason: 'Sick Leave',
    employeeLeft: false,
    relieverDeployed: false,
    resolutionType: 'Under Investigation',
    evidence: [],
    weightage: 4,
    status: 'Under Investigation'
  },
  {
    id: 'CASE_003',
    employeeName: 'Suresh Babu',
    employeeCode: 'EMP2003',
    designation: 'Security Supervisor',
    client: 'Wipro Technologies',
    site: 'Wipro Hinjewadi Campus',
    shift: 'Third',
    absentDate: '2026-06-09',
    consecutiveAbsentDays: 3,
    absenceReason: 'Personal Emergency',
    employeeLeft: false,
    relieverDeployed: true,
    relieverName: 'Amit Sharma',
    resolutionType: 'Reliever Deployed',
    evidence: ['phone_logs.pdf'],
    weightage: 4,
    status: 'Resolution Updated'
  },
  {
    id: 'CASE_004',
    employeeName: 'Rajesh Kumar',
    employeeCode: 'EMP4005',
    designation: 'Security Guard',
    client: 'DLF Cyber City',
    site: 'DLF Cyber Hub Delhi',
    shift: 'First',
    absentDate: '2026-06-08',
    consecutiveAbsentDays: 1,
    absenceReason: 'Approved Leave',
    employeeLeft: false,
    relieverDeployed: true,
    relieverName: 'Gopal Raj',
    resolutionType: 'Employee Returned',
    evidence: ['medical_proof.jpg'],
    weightage: 4,
    oeRating: 4,
    oeRemarks: 'Sickness verified. Reliever was deployed.',
    status: 'OE Submitted'
  },
  {
    id: 'CASE_005',
    employeeName: 'Ketan Patel',
    employeeCode: 'EMP3022',
    designation: 'Housekeeping Supervisor',
    client: 'Reliance Jio',
    site: 'Jio Centre Mumbai',
    shift: 'Second',
    absentDate: '2026-06-07',
    consecutiveAbsentDays: 2,
    absenceReason: 'Absconding',
    employeeLeft: true,
    vacancyRaised: true,
    expectedJoiningDate: '2026-06-25',
    resolutionType: 'Recruitment In Progress',
    evidence: ['hr_termination_letter.pdf'],
    weightage: 4,
    oeRating: 3,
    oeRemarks: 'Employee left without notice. Reliever deployed and vacancy raised.',
    rmRating: 4,
    rmRemarks: 'Action approved. Recruitment has initiated.',
    status: 'RM Reviewed'
  },
  {
    id: 'CASE_006',
    employeeName: 'Lakshmi Nair',
    employeeCode: 'EMP2010',
    designation: 'Receptionist',
    client: 'HDFC Bank',
    site: 'HDFC Tower Chennai',
    shift: 'First',
    absentDate: '2026-06-08',
    consecutiveAbsentDays: 1,
    absenceReason: 'Family Emergency',
    employeeLeft: false,
    relieverDeployed: true,
    relieverName: 'Gopal Raj',
    resolutionType: 'Reliever Deployed',
    evidence: ['call_recordings.mp3'],
    weightage: 4,
    oeRating: 4,
    oeRemarks: 'Emergency verified.',
    rmRating: 4,
    rmRemarks: 'Fully covered shift.',
    avpRating: 4,
    avpRemarks: 'Resolution scoring verified.',
    finalScore: 4,
    status: 'AVP Approved'
  }
];

