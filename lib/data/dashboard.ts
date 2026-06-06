import { DashboardKPI, ActivityTrend, RegionPerformance, RecentActivity } from '@/lib/types';

export const dashboardKPI: DashboardKPI = {
  totalActivities: 156,
  completedActivities: 142,
  pendingActivities: 14,
  compliancePercent: 89.5,
  averagePerformanceScore: 8.2,
  assessmentsAwaitingApproval: 2,
};

export const activityTrends: ActivityTrend[] = [
  { month: 'Jan', completed: 45, pending: 8, inProgress: 7 },
  { month: 'Feb', completed: 48, pending: 6, inProgress: 6 },
  { month: 'Mar', completed: 51, pending: 5, inProgress: 4 },
  { month: 'Apr', completed: 55, pending: 4, inProgress: 1 },
  { month: 'May', completed: 58, pending: 4, inProgress: 0 },
  { month: 'Jun', completed: 42, pending: 10, inProgress: 4 },
];

export const complianceTrends = [
  { month: 'Jan', compliance: 82 },
  { month: 'Feb', compliance: 84 },
  { month: 'Mar', compliance: 86 },
  { month: 'Apr', compliance: 88 },
  { month: 'May', compliance: 89.5 },
  { month: 'Jun', compliance: 87 },
];

export const activityCompletionBreakdown = [
  { name: 'Completed', value: 142, fill: '#10b981' },
  { name: 'In Progress', value: 11, fill: '#f59e0b' },
  { name: 'Pending', value: 3, fill: '#ef4444' },
];

export const regionPerformance: RegionPerformance[] = [
  {
    region: 'North',
    compliancePercent: 91,
    averageScore: 8.4,
    totalAssessments: 12,
  },
  {
    region: 'East',
    compliancePercent: 88,
    averageScore: 8.1,
    totalAssessments: 8,
  },
  {
    region: 'South',
    compliancePercent: 87,
    averageScore: 7.9,
    totalAssessments: 10,
  },
  {
    region: 'West',
    compliancePercent: 89,
    averageScore: 8.2,
    totalAssessments: 9,
  },
  {
    region: 'Central',
    compliancePercent: 86,
    averageScore: 7.8,
    totalAssessments: 7,
  },
];

export const recentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'assessment_submitted',
    description: 'Priya Saxena submitted May 2025 assessment',
    timestamp: new Date('2025-05-14T10:30:00'),
    userName: 'Priya Saxena',
    userRole: 'AVP',
  },
  {
    id: '2',
    type: 'assessment_approved',
    description: 'Neha Verma assessment approved for May 2025',
    timestamp: new Date('2025-05-15T14:20:00'),
    userName: 'Rajesh Kumar',
    userRole: 'Regional Manager',
  },
  {
    id: '3',
    type: 'evidence_uploaded',
    description: 'New evidence uploaded for Operations Audit activity',
    timestamp: new Date('2025-05-15T09:15:00'),
    userName: 'Anjali Desai',
    userRole: 'Operations Officer',
  },
  {
    id: '4',
    type: 'activity_archived',
    description: 'Quarterly Risk Assessment activity archived',
    timestamp: new Date('2025-05-13T16:45:00'),
    userName: 'Amit Sharma',
    userRole: 'Business Head',
  },
  {
    id: '5',
    type: 'assessment_submitted',
    description: 'Anjali Desai submitted April 2025 assessment',
    timestamp: new Date('2025-05-10T11:00:00'),
    userName: 'Anjali Desai',
    userRole: 'Operations Officer',
  },
];

export const awaitingApprovals = [
  {
    id: 'APR_001',
    assessmentId: 'ASS_002',
    employeeName: 'Anjali Desai',
    month: 'May 2025',
    status: 'pending_review' as const,
    compliancePercent: 85,
    performanceScore: 7.8,
  },
  {
    id: 'APR_002',
    assessmentId: 'ASS_003',
    employeeName: 'Priya Saxena',
    month: 'May 2025',
    status: 'submitted' as const,
    compliancePercent: 88,
    performanceScore: 8.2,
  },
];
