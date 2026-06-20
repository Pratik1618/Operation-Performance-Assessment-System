// ─────────────────────────────────────────────
// OCRMS Type Definitions
// Operations Compliance & Reporting Management System
// ─────────────────────────────────────────────

// ── Roles ──
export type UserRole = 'oe' | 'rm' | 'zh' | 'avp' | 'bh' | 'hr' | 'procurement' | 'dr' | 'th' | 'trainers' | 'commerical' | 'hod' | 'hr_dr';

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
  assignedZH?: string;
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

export type EmployeeDesignation = 'Security Guard' | 'Security Supervisor' | 'Housekeeper' | 'Facility Manager' | 'Janitor';

export interface Employee {
  id: string;
  name: string;
  code: string;
  siteId: string;
  designation: EmployeeDesignation;
  shift: 'First' | 'Second' | 'Third' | 'General';
  joiningDate: string;
  status: 'active' | 'inactive';
}

// ── Operational Tasks & Activity Templates ──
export type TaskFrequency = 'daily' | 'weekly' | 'fortnightly' | 'monthly' | 'one-time';
export type TaskStatus = 'pending' | 'in_progress' | 'oe_submitted' | 'rm_approved' | 'zh_approved' | 'avp_approved' | 'bh_approved' | 'dr_approved' | 'rejected' | 'overdue' | 'submitted' | 'approved';

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
  | 'Reporting & Closure';

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
  approvalFlow: ('oe' | 'rm' | 'zh' | 'avp' | 'bh' | 'dr')[];
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

  phRating?: number;
  phRemarks?: string;
  phReviewedDate?: string;

  rmRating?: number;
  rmRemarks?: string;
  rmReviewedDate?: string;
  
  avpRating?: number;
  avpRemarks?: string;
  avpApprovedDate?: string;
  
  bhRating?: number;
  bhRemarks?: string;
  bhApprovedDate?: string;
  
  zhRating?: number;
  zhRemarks?: string;
  zhReviewedDate?: string;
  
  drRating?: number;
  drRemarks?: string;
  drApprovedDate?: string;
  
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
  transportMode?: string;
  reportData?: SiteVisitReportData;
}

// ── Enhanced Site Visit Report (11-Section Form) ──
export type VisitType = 'routine' | 'surprise' | 'complaint' | 'followup' | 'new_site';

export interface QualityRating {
  overallCleanliness: number;
  workstationCondition: number;
  cabinCleanliness: number;
  washroomCleanliness: number;
  officeEntranceCondition: number;
  glassCleaning: number;
  furnitureChairCondition: number;
  housekeepingStandards: number;
}

export type ObservationItem =
  | 'cobwebs' | 'doormat_not_maintained' | 'broken_fittings'
  | 'dust_accumulation' | 'stains_spillage' | 'none';

export interface HKStandardsChecks {
  wearingUniform: boolean;
  hasTwoUniforms: boolean;
  wearingSafetyShoes: boolean;
  wearingIdCard: boolean;
  groomingMaintained: boolean;
}

export interface HKKnowledgeRatings {
  chemicalKnowledge: number;
  dilutionRatioKnowledge: number;
  washroomCleaningProcedure: number;
  machineryUsageKnowledge: number;
}

export interface HKDisciplineChecks {
  attendanceMarkedInApp: boolean;
  leaveReportingUnderstood: boolean;
  materialReceivedOnTime: boolean;
}

export interface HKAssessment {
  associateMet: boolean;
  standards: HKStandardsChecks;
  knowledge: HKKnowledgeRatings;
  discipline: HKDisciplineChecks;
}

export type MaterialAvailability = 'fully_available' | 'low_stock' | 'critical_shortage';
export type EquipmentStatusType = 'fully_functional' | 'minor_issue' | 'major_breakdown';

export interface EquipmentIssue {
  equipmentName: string;
  issueDescription: string;
  photoUrl?: string;
}

export type TrainingTopic =
  | 'chemical_usage' | 'chemical_dilution' | 'washroom_cleaning'
  | 'cabin_cleaning' | 'workstation_cleaning' | 'open_area_cleaning'
  | 'lobby_cleaning' | 'machinery_usage' | 'mobile_app_usage'
  | 'grooming_hygiene';

export interface ClientFeedbackData {
  clientMet: boolean;
  staffAppearance: number;
  behaviourEtiquette: number;
  groomingStandards: number;
  hygieneStandards: number;
  materialQualityFeedback: 'excellent' | 'good' | 'average' | 'poor' | '';
  serviceQualityFeedback: 'excellent' | 'good' | 'average' | 'poor' | '';
  clientRemark: string;
}

export interface PhotoDoc {
  id: string;
  category: 'site_overview' | 'washroom' | 'hk_staff' | 'store_room'
    | 'equipment' | 'issues' | 'before_after';
  fileName: string;
  isMandatory: boolean;
}

export type SiteIssue =
  | 'staff_shortage' | 'material_shortage' | 'equipment_breakdown'
  | 'attendance_issue' | 'uniform_noncompliance' | 'grooming_issue'
  | 'client_complaint' | 'safety_concern' | 'cleaning_quality' | 'other';

export interface CorrectiveAction {
  id: string;
  issue: string;
  assignedTo: string;
  priority: 'high' | 'medium' | 'low';
  targetClosureDate: string;
  status: 'open' | 'in_progress' | 'closed';
}

export type FinalSiteStatus = 'excellent' | 'good' | 'needs_improvement' | 'critical';

export interface SiteVisitReportData {
  // Section 1: Visit Details
  visitType: VisitType;
  gpsLocation: { lat: number; lng: number } | null;
  // Section 2: Site Quality Audit
  qualityRatings: QualityRating;
  observations: ObservationItem[];
  siteQualityScore: number;
  // Section 3: HK Assessment
  hkAssessment: HKAssessment;
  // Section 4: Material & Equipment
  materialAvailability: MaterialAvailability;
  equipmentStatus: EquipmentStatusType;
  equipmentIssue?: EquipmentIssue;
  // Section 5: Training
  trainingTopics: TrainingTopic[];
  trainingConducted: boolean;
  trainingRemarks: string;
  // Section 6: Client Feedback
  clientFeedback: ClientFeedbackData;
  // Section 7: Photos
  photos: PhotoDoc[];
  // Section 8: Issues
  issuesIdentified: SiteIssue[];
  // Section 9: Corrective Actions
  correctiveActions: CorrectiveAction[];
  // Section 10: Positive Recognition
  positiveRecognition: string;
  // Section 11: Final Status
  finalSiteStatus: FinalSiteStatus;
  supervisorRemarks: string;
  // Computed scores
  hkAssessmentScore: number;
  trainingCoverageScore: number;
  overallSiteHealthScore: number;
}

// ── Final Closing Report (ACT-OPS-03) ──
export interface QueryResolution {
  actionId: string;
  issue: string;
  assignedTo: string;
  resolutionStatus: 'resolved' | 'unresolved';
  resolutionRemarks: string;
  evidencePhotoId?: string;
}

export interface FinalClosingReportData {
  originalSiteVisitTaskId: string;
  visitDate: string;
  queryResolutions: QueryResolution[];
  overallStatus: 'fully_resolved' | 'partially_resolved' | 'unresolved';
  closingRemarks: string;
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
  withinTAT?: boolean;
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
  zhRating?: number;
  zhRemarks?: string;
  drRating?: number;
  drRemarks?: string;
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

// ── MOM Report (10-Section Form) ──
export type ClientSentiment = 'very_happy' | 'satisfied' | 'neutral' | 'concerned' | 'escalated';
export type MOMDiscussionTopic = 'service_quality' | 'cleaning_standards' | 'manpower' | 'attendance' | 'material_availability' | 'equipment_issues' | 'complaint_followup' | 'additional_requirement' | 'contract_commercial' | 'other';
export type MOMIssue = 'cleaning_quality' | 'attendance' | 'staff_behaviour' | 'material_shortage' | 'equipment_breakdown' | 'safety_concern' | 'service_delay' | 'other';
export type MOMOpportunityType = 'additional_manpower' | 'deep_cleaning' | 'facade_cleaning' | 'pest_control' | 'landscaping' | 'pantry_services' | 'technical_services' | 'other';
export type MOMOutcome = 'no_action' | 'action_plan_created' | 'escalation_required' | 'business_opportunity';

export interface MOMActionItem {
  id: string;
  description: string;
  assignedTo: string;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'closed';
}

export interface MOMBusinessOpportunity {
  types: MOMOpportunityType[];
  value: 'low' | 'medium' | 'high' | '';
}

export interface MOMReportData {
  // Section 1: Meeting Details
  meetingDate: string;
  clientRepName: string;
  clientDesignation: string;
  
  // Section 2: Client Interaction
  clientMet: boolean;
  
  // Section 3: Client Sentiment
  sentiment: ClientSentiment | '';
  
  // Section 4: Discussion Topics
  topics: MOMDiscussionTopic[];
  
  // Section 5: Issues Raised
  issuesRaised: boolean;
  issues: MOMIssue[];
  
  // Section 6: Action Required
  actionRequired: boolean;
  actionItems: MOMActionItem[];
  
  // Section 7: Business Opportunity
  opportunityDiscussed: boolean;
  opportunity: MOMBusinessOpportunity;
  
  // Section 8: Meeting Summary
  summary: string;
  
  // Section 9: Follow-up
  followupRequired: boolean;
  followupDate: string;
  
  // Section 10: Meeting Outcome
  outcome: MOMOutcome | '';
}

// ── Daily Closure Report ──
export type CleanedArea = 'washrooms' | 'common_areas' | 'office_floors' | 'pantry' | 'staircase' | 'parking' | 'outdoor' | 'other';
export type CleaningFrequency = '2_times' | '4_times' | '6_times' | 'more_than_6';
export type WorkCompletionStatus = 'fully_completed' | 'partially_completed' | 'not_completed';
export type IncompletionReason = 'staff_shortage' | 'material_shortage' | 'area_inaccessible' | 'extra_work' | 'other';
export type DailyIssue = 'no_issues' | 'washroom_issue' | 'electrical_issue' | 'plumbing_issue' | 'material_shortage' | 'safety_hazard' | 'customer_complaint' | 'other';
export type FinalShiftStatus = 'all_clean' | 'cleaning_in_progress' | 'issue_pending' | 'supervisor_informed';

export interface DailyClosureReportData {
  // Section 1
  cleanedAreas: CleanedArea[];
  cleanedAreasOther: string;
  
  // Section 2
  cleaningFrequency: CleaningFrequency | '';
  
  // Section 3
  completionStatus: WorkCompletionStatus | '';
  incompletionReasons: IncompletionReason[];
  incompletionReasonsOther: string;
  
  // Section 4
  issuesNoticed: DailyIssue[];
  issuesOther: string;
  issuePhotos: PhotoDoc[];
  
  // Section 5
  finalStatus: FinalShiftStatus | '';
  additionalComments: string;
}
