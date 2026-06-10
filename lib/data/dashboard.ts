// OCRMS Dashboard Data (re-exported from central data)
import {
  dashboardKPI,
  dailyComplianceTrend,
  monthlyComplianceTrend,
  regionPerformance,
  categoryCompletion,
  todaysPendingTasks,
  overdueReports,
  recentSiteVisits,
  openGrievances,
  openClientIssues,
  openIncidentsList,
  upcomingRREvents,
} from './ocrms-data'

// Re-export for backward compatibility
export {
  dashboardKPI,
  dailyComplianceTrend,
  monthlyComplianceTrend,
  regionPerformance,
  categoryCompletion,
  todaysPendingTasks,
  overdueReports,
  recentSiteVisits,
  openGrievances,
  openClientIssues,
  openIncidentsList,
  upcomingRREvents,
}

// Legacy exports for existing pages (deprecated)
export const activityTrends = monthlyComplianceTrend.map(m => ({
  month: m.month,
  completed: Math.round(m.tasks * m.compliance / 100),
  pending: Math.round(m.tasks * (100 - m.compliance) / 200),
  inProgress: Math.round(m.tasks * (100 - m.compliance) / 200),
}))

export const complianceTrends = monthlyComplianceTrend.map(m => ({
  month: m.month,
  compliance: m.compliance,
}))

export const activityCompletionBreakdown = [
  { name: 'Completed', value: dashboardKPI.completed, fill: '#10b981' },
  { name: 'In Progress', value: Math.round(dashboardKPI.pending / 2), fill: '#f59e0b' },
  { name: 'Pending', value: Math.round(dashboardKPI.pending / 2), fill: '#ef4444' },
]

export const recentActivities = [
  { id: '1', type: 'assessment_submitted' as const, description: 'Ravi Shankar submitted Absent Report for Infosys Gurgaon', timestamp: new Date('2025-06-05T10:30:00'), userName: 'Ravi Shankar', userRole: 'Operation Executive' },
  { id: '2', type: 'assessment_approved' as const, description: 'Site Visit Report approved by Suresh Kumar', timestamp: new Date('2025-06-05T14:20:00'), userName: 'Suresh Kumar', userRole: 'Regional Manager' },
  { id: '3', type: 'evidence_uploaded' as const, description: 'Deep Cleaning evidence uploaded for Wipro Hinjewadi', timestamp: new Date('2025-06-04T09:15:00'), userName: 'Kiran Nair', userRole: 'Operation Executive' },
]

export const awaitingApprovals = [
  { id: 'APR_001', assessmentId: 'TASK_0001', employeeName: 'Ravi Shankar', month: 'June 2025', status: 'pending_review' as const, compliancePercent: 85, performanceScore: 7.8 },
  { id: 'APR_002', assessmentId: 'TASK_0037', employeeName: 'Anjali Desai', month: 'June 2025', status: 'submitted' as const, compliancePercent: 88, performanceScore: 8.2 },
]
