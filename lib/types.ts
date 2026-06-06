// User and Employee Types
export interface Employee {
  id: string;
  name: string;
  code: string;
  designation: string;
  region: string;
  state: string;
  zone: string;
  reportsTo: string;
  email: string;
  phone: string;
}

export interface User extends Employee {
  role: 'employee' | 'rm' | 'avp' | 'bh' | 'admin';
  lastLogin?: Date;
}

// Assessment Types
export type AssessmentStatus =
  | 'draft'
  | 'submitted' // Compatibility
  | 'pending_review' // Compatibility
  | 'submitted_l2' // Pending RM (L2) Review
  | 'submitted_l3' // Pending AVP (L3) Review
  | 'submitted_l4' // Pending BH (L4) Review
  | 'approved'
  | 'rejected';

export interface Assessment {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  region: string;
  state: string;
  zone: string;
  month: string;
  year: number;
  status: AssessmentStatus;
  compliancePercent: number;
  performanceScore: number;
  l1Score?: number; // L1 self-score (out of 10)
  l2Score?: number; // L2 Regional Manager score (out of 10)
  l3Score?: number; // L3 AVP Operations score (out of 10)
  l4Score?: number; // L4 Business Head final score (out of 10)
  totalActivities: number;
  completedActivities: number;
  evidencesSubmitted: number;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
}

// Activity Types
export interface Activity {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  weightage: number;
  evidenceType: 'document' | 'photo' | 'video' | 'excel' | 'mixed';
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Activity Status for Operations Compliance Tracking
export type ActivityStatus = 'pending' | 'submitted' | 'achieved' | 'partially_achieved' | 'not_achieved' | 'approved' | 'rejected';

// Assessment Activity (mapping of activity to assessment)
export interface AssessmentActivity {
  id: string;
  assessmentId: string;
  activityId: string;
  activityName: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  weightage: number;
  rating: number; // 0-5
  l1Rating?: number; // L1 rating (0-5)
  l2Rating?: number; // L2 rating (0-5)
  l3Rating?: number; // L3 rating (0-5)
  l4Rating?: number; // L4 rating (0-5)
  status: ActivityStatus;
  dueDate: Date;
  submissionDate?: Date;
  completedDate?: Date;
  evidenceCount: number;
  remarks?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

// Evidence Types
export interface Evidence {
  id: string;
  assessmentActivityId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string;
  url?: string;
}

// Approval Types
export type ApprovalStage = 'rm_review' | 'avp_review' | 'bh_approval';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'returned';

export interface Approval {
  id: string;
  assessmentId: string;
  stage: ApprovalStage;
  status: ApprovalStatus;
  assignedTo: string;
  assignedToName: string;
  remarks?: string;
  createdAt: Date;
  processedAt?: Date;
  processedBy?: string;
}

// Report Types
export interface DashboardKPI {
  totalActivities: number;
  completedActivities: number;
  pendingActivities: number;
  compliancePercent: number;
  averagePerformanceScore: number;
  assessmentsAwaitingApproval: number;
}

export interface ActivityTrend {
  month: string;
  completed: number;
  pending: number;
  inProgress: number;
}

export interface RegionPerformance {
  region: string;
  compliancePercent: number;
  averageScore: number;
  totalAssessments: number;
}

export interface RecentActivity {
  id: string;
  type: 'assessment_submitted' | 'assessment_approved' | 'evidence_uploaded' | 'activity_archived';
  description: string;
  timestamp: Date;
  userName: string;
  userRole: string;
}

// Filter Types
export interface AssessmentFilters {
  status?: AssessmentStatus;
  region?: string;
  state?: string;
  zone?: string;
  month?: string;
  year?: number;
  searchTerm?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}
