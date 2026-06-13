// ─────────────────────────────────────────────
// OCRMS Type Definitions
// Operations Compliance & Reporting Management System
// ─────────────────────────────────────────────

// ── Roles ──
export type UserRole = 'oe' | 'rm' | 'avp' | 'bh' | 'hr' | 'procurement' | 'dr' | 'th' | 'trainers' | 'commerical' | 'hod' | 'hr_dr';

export interface User {
  id: string;
  name: string;
  code: string;
  designation: string;
  role: UserRole;
  region: string;
  state: string;
  zone: string;
  email: string;
  phone: string;
}

// ── Geographies ──
export interface Region {
  id: string;
  name: string;
  states: string[];
}

export interface Site {
  id: string;
  code: string;
  name: string;
  client: string;
  clientId: string;
  region: string;
  state: string;
  zone: string;
  assignedOE: string;
  assignedRM: string;
  assignedAVP: string;
  status: 'active' | 'inactive';
  employeeCount: number;
  address: string;
}

export interface Client {
  id: string;
  name: string;
  code: string;
  industry: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  sitesCount: number;
  status: 'active' | 'inactive';
}

// ── Operational Tasks & Activity Templates ──
export type TaskFrequency = 'daily' | 'weekly' | 'fortnightly' | 'monthly' | 'one-time';
export type TaskStatus = 'pending' | 'in_progress' | 'oe_submitted' | 'rm_approved' | 'avp_approved' | 'bh_approved' | 'rejected' | 'overdue' | 'submitted' | 'approved';

export interface Activity {
  id: string;
  name: string;
  frequency: TaskFrequency;
  weightage: number;
  evidenceType: string;
  isActive: boolean;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ActivityStatus = 'pending' | 'submitted' | 'achieved' | 'partially_achieved' | 'not_achieved' | 'approved' | 'rejected';

export interface AssessmentActivity {
  id: string;
  assessmentId: string;
  activityId: string;
  activityName: string;
  frequency: string;
  weightage: number;
  dueDate: Date | string;
  submissionDate?: Date | string;
  completedDate?: Date | string;
  evidenceCount: number;
  status: ActivityStatus;
  rating: number;
  remarks?: string;
  reviewedBy?: string;
  reviewedAt?: Date | string;
  l1Rating?: number;
  l2Rating?: number;
  l3Rating?: number;
  l4Rating?: number;
}

export interface FormFieldSchema {
  id: string;
  label: string;
  type: 'text' | 'number' | 'checkbox' | 'select' | 'textarea' | 'date';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export type ActivityCategory = 
  | 'Attendance Verification'
  | 'Site Operations'
  | 'Training'
  | 'Procurement & Logistics'
  | 'Employee Relations'
  | 'Incident & Performance'
  | 'Planning & Recognition'
  | 'Reporting & Closure'
  | 'Quality & Feedback';

export interface ActivityTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  category: ActivityCategory;
  frequency: TaskFrequency;
  weightage: number;
  evidenceTypes: ('image' | 'pdf' | 'excel' | 'video' | 'audio' | 'signature')[];
  formSchema: FormFieldSchema[];
  approvalFlow: ('oe' | 'rm' | 'avp')[];
  active: boolean;
  assignedRoles?: string;
  approvalFlowText?: string;
}

export interface OperationalTask {
  id: string;
  templateId: string;
  taskName: string;
  category: ActivityCategory;
  frequency: TaskFrequency;
  weightage: number;
  dueDate: string;
  siteId: string;
  siteName: string;
  clientName: string;
  status: TaskStatus;
  
  formData?: Record<string, any>;
  evidenceUrls: string[];
  evidenceCount: number;
  remarks?: string;
  
  oeRating?: number;
  oeRemarks?: string;
  oeSubmittedDate?: string;
  
  rmRating?: number;
  rmRemarks?: string;
  rmReviewedDate?: string;
  
  avpRating?: number;
  avpRemarks?: string;
  avpApprovedDate?: string;
  
  bhRating?: number;
  bhRemarks?: string;
  bhApprovedDate?: string;
  
  finalScore?: number;
  assignedTo: string;
}


// ── Site Visits ──
export type VisitStatus = 'planned' | 'in_progress' | 'completed' | 'missed' | 'rescheduled';

export interface SiteVisit {
  id: string;
  site: string;
  siteId: string;
  client: string;
  visitDate: string;
  plannedTime: string;
  actualTime?: string;
  status: VisitStatus;
  clientSignature: boolean;
  geoTagged: boolean;
  photos: number;
  notes: string;
  checklistScore?: number; // out of 34
  visitedBy: string;
}

// ── Visit Plan ──
export interface VisitPlan {
  id: string;
  month: string;
  year: number;
  site: string;
  siteId: string;
  client: string;
  plannedDate: string;
  status: 'planned' | 'completed' | 'missed';
  checklist34Points: number;
}

// ── Attendance ──
export type AttendanceIssueType = 'absent' | 'missing_in' | 'missing_out' | 'non_app' | 'regularization' | 'missing_in_time' | 'missing_out_time';

export interface AttendanceRecord {
  id: string;
  employeeName: string;
  employeeCode: string;
  site: string;
  siteId: string;
  date: string;
  issueType: AttendanceIssueType;
  relieverAssigned?: string;
  status: string;
  remarks: string;
  client?: string;
  shift?: 'First' | 'Second' | 'Third';
  punchTime?: string;
  reason?: string;
  deviceType?: string;
  appStatus?: string;
  lastAttendanceMethod?: string;
  registrationStatus?: string;
  manualEntriesCount?: number;
  submittedDate?: string;
  evidenceUrl?: string;
  replacementRequired?: boolean;
}

// ── Employee Grievances ──
export type GrievanceStatus = 'open' | 'under_review' | 'resolved' | 'closed';
export type GrievancePriority = 'high' | 'medium' | 'low';
export type GrievanceCategory = 'salary' | 'workplace' | 'harassment' | 'safety' | 'leave' | 'other';

export interface Grievance {
  id: string;
  employeeName: string;
  employeeCode: string;
  site: string;
  siteId: string;
  category: GrievanceCategory;
  complaint: string;
  hasVoiceRecording: boolean;
  date: string;
  priority: GrievancePriority;
  status: GrievanceStatus;
  resolution?: string;
  resolvedDate?: string;
  assignedTo: string;
}

// ── Incidents ──
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';
export type IncidentType = 'theft' | 'fire' | 'accident' | 'vandalism' | 'trespassing' | 'equipment_failure' | 'other';

export interface Incident {
  id: string;
  incidentNumber: string;
  site: string;
  siteId: string;
  client: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  photos: number;
  actionTaken: string;
  resolution?: string;
  status: IncidentStatus;
  reportedDate: string;
  reportedBy: string;
  resolvedDate?: string;
}

// ── Client Interactions ──
export type ClientIssueStatus = 'open' | 'resolved' | 'escalated' | 'follow_up';

export interface ClientInteraction {
  id: string;
  clientName: string;
  clientId: string;
  site: string;
  siteId: string;
  callDate: string;
  concern: string;
  actionTaken: string;
  resolutionStatus: ClientIssueStatus;
  followUpDate?: string;
  handledBy: string;
}

// ── Client Chat ──
export interface ChatMessage {
  id: string;
  siteId: string;
  site: string;
  client: string;
  sender: 'client' | 'oe' | 'rm';
  senderName: string;
  message: string;
  timestamp: string;
  hasAttachment: boolean;
  ticketId?: string;
}

export interface ChatThread {
  id: string;
  siteId: string;
  site: string;
  client: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}

// ── Referrals ──
export type RewardStatus = 'pending' | 'eligible' | 'paid' | 'ineligible';

export interface Referral {
  id: string;
  referrerName: string;
  referrerCode: string;
  candidateName: string;
  site: string;
  siteId: string;
  joiningDate: string;
  ninetyDayDate: string;
  daysCompleted: number;
  rewardEligible: boolean;
  rewardStatus: RewardStatus;
  rewardAmount: number;
}

// ── Procurement ──
export type ProcurementStatus = 'requested' | 'approved' | 'ordered' | 'shipped' | 'delivered' | 'cancelled';

export interface ProcurementRequest {
  id: string;
  requestNumber: string;
  site: string;
  siteId: string;
  material: string;
  quantity: number;
  requestedDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  status: ProcurementStatus;
  withinTAT: boolean;
  requestedBy: string;
}

// ── Material Quality ──
export interface MaterialQuality {
  id: string;
  site: string;
  siteId: string;
  auditDate: string;
  qualityScore: number; // 0-100
  issuesFound: number;
  observations: string;
  auditor: string;
  trend: 'improving' | 'stable' | 'declining';
}

// ── Uniform & Shoes ──
export type ApparelType = 'uniform' | 'shoes' | 'sweater';
export type ApparelStatus = 'requested' | 'issued' | 'pending' | 'rejected';

export interface UniformRecord {
  id: string;
  employeeName: string;
  employeeCode: string;
  site: string;
  siteId: string;
  type: ApparelType;
  size: string;
  gender: 'male' | 'female';
  designation: string;
  requestDate: string;
  issueDate?: string;
  status: ApparelStatus;
}

// ── R&R Schedule ──
export type RRStatus = 'planned' | 'completed' | 'cancelled';

export interface RREvent {
  id: string;
  site: string;
  siteId: string;
  eventDate: string;
  eventType: string;
  description: string;
  photos: number;
  status: RRStatus;
  coordinator: string;
}

// ── Closure Reports ──
export type ClosureType = 'mom' | 'daily_closure' | 'closure';

export interface ClosureReport {
  id: string;
  site: string;
  siteId: string;
  type: ClosureType;
  date: string;
  actionTaken: string;
  closureDate: string;
  remarks: string;
  status: 'open' | 'closed';
  submittedBy: string;
}

// ── Feedback ──
export type FeedbackBand = 'poor' | 'average' | 'better' | 'best';

export interface FeedbackScore {
  id: string;
  site: string;
  siteId: string;
  client: string;
  score: number; // 0-100
  band: FeedbackBand;
  month: string;
  year: number;
  comments: string;
}

// ── Approval Workflow ──
export type ApprovalStage = 'oe_submission' | 'rm_review' | 'avp_review' | 'bh_approval';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'returned';

export interface Approval {
  id: string;
  taskId: string;
  taskName: string;
  site: string;
  stage: ApprovalStage;
  status: ApprovalStatus;
  assignedTo: string;
  assignedToName: string;
  remarks?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
}

// ── Dashboard KPIs ──
export interface OCRMSDashboardKPI {
  totalAssigned: number;
  completed: number;
  pending: number;
  overdue: number;
  compliancePercent: number;
  siteVisitsCompleted: number;
  pendingApprovals: number;
  openIncidents: number;
  dailyCompliance: number;
  weeklyCompliance: number;
  fortnightlyCompliance: number;
  monthlyCompliance: number;
}

// ── Notifications ──
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// ── Attendance Verification Case ──
export interface AttendanceVerificationCase {
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

// ── Training Session Planner ──
export interface TrainingSession {
  id: string;
  siteId: string;
  siteName: string;
  topic: string;
  trainerName: string;
  dateStr: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  status: 'planned' | 'completed';
  targetEmployeesCount: number;
  mode: 'online' | 'offline';
}

