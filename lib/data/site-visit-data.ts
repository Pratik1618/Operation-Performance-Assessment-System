import type {
  SiteVisitReportData,
  QualityRating,
  HKAssessment,
  ClientFeedbackData,
  ObservationItem,
  TrainingTopic,
  SiteIssue,
} from '@/lib/types'

// ── Default empty state for a new Site Visit Report ──
export const defaultQualityRatings: QualityRating = {
  overallCleanliness: 0,
  workstationCondition: 0,
  cabinCleanliness: 0,
  washroomCleanliness: 0,
  officeEntranceCondition: 0,
  glassCleaning: 0,
  furnitureChairCondition: 0,
  housekeepingStandards: 0,
}

export const defaultHKAssessment: HKAssessment = {
  associateMet: false,
  compliance: {
    wearingUniform: false,
    hasTwoUniforms: false,
    wearingSafetyShoes: false,
    wearingIdCard: false,
    groomingMaintained: false,
  },
  knowledge: {
    chemicalKnowledge: 0,
    dilutionRatioKnowledge: 0,
    washroomCleaningProcedure: 0,
    machineryUsageKnowledge: 0,
  },
  discipline: {
    attendanceMarkedInApp: false,
    leaveReportingUnderstood: false,
    materialReceivedOnTime: false,
  },
}

export const defaultClientFeedback: ClientFeedbackData = {
  clientMet: false,
  staffAppearance: 0,
  behaviourEtiquette: 0,
  groomingStandards: 0,
  hygieneStandards: 0,
  materialQualityFeedback: '',
  serviceQualityFeedback: '',
  clientRemark: '',
}

export function createEmptySiteVisitReport(): SiteVisitReportData {
  return {
    visitType: 'routine',
    gpsLocation: null,
    qualityRatings: { ...defaultQualityRatings },
    observations: [],
    siteQualityScore: 0,
    hkAssessment: JSON.parse(JSON.stringify(defaultHKAssessment)),
    materialAvailability: 'fully_available',
    equipmentStatus: 'fully_functional',
    trainingTopics: [],
    trainingConducted: false,
    trainingRemarks: '',
    clientFeedback: { ...defaultClientFeedback },
    photos: [],
    issuesIdentified: [],
    correctiveActions: [],
    positiveRecognition: '',
    finalSiteStatus: 'good',
    supervisorRemarks: '',
    complianceScore: 0,
    trainingCoverageScore: 0,
    overallSiteHealthScore: 0,
  }
}

// ── Score Calculation Helpers ──
export function calculateSiteQualityScore(ratings: QualityRating): number {
  const values = Object.values(ratings)
  if (values.length === 0) return 0
  const sum = values.reduce((a, b) => a + b, 0)
  const avg = sum / values.length
  return Math.round((avg / 5) * 100)
}

export function calculateComplianceScore(hk: HKAssessment): number {
  if (!hk.associateMet) return 0
  const complianceChecks = Object.values(hk.compliance)
  const disciplineChecks = Object.values(hk.discipline)
  const allChecks = [...complianceChecks, ...disciplineChecks]
  const passed = allChecks.filter(Boolean).length
  return Math.round((passed / allChecks.length) * 100)
}

export function calculateTrainingCoverageScore(topics: TrainingTopic[], conducted: boolean): number {
  if (!conducted) return 0
  const totalTopics = 10
  return Math.round((topics.length / totalTopics) * 100)
}

export function calculateOverallSiteHealthScore(
  qualityScore: number,
  complianceScore: number,
  trainingScore: number
): number {
  // Weighted: Quality 50%, Compliance 30%, Training 20%
  return Math.round(qualityScore * 0.5 + complianceScore * 0.3 + trainingScore * 0.2)
}

// ── Display Labels ──
export const visitTypeLabels: Record<string, string> = {
  routine: 'Routine Visit',
  surprise: 'Surprise Visit',
  complaint: 'Complaint Visit',
  followup: 'Follow-up Visit',
  new_site: 'New Site Inspection',
}

export const qualityRatingLabels: Record<keyof QualityRating, string> = {
  overallCleanliness: 'Overall Cleanliness',
  workstationCondition: 'Workstation Condition',
  cabinCleanliness: 'Cabin Cleanliness',
  washroomCleanliness: 'Washroom Cleanliness',
  officeEntranceCondition: 'Office Entrance Condition',
  glassCleaning: 'Glass Cleaning',
  furnitureChairCondition: 'Furniture & Chair Condition',
  housekeepingStandards: 'Housekeeping Standards',
}

export const observationLabels: Record<ObservationItem, string> = {
  cobwebs: 'Cobwebs Observed',
  doormat_not_maintained: 'Doormat Not Maintained',
  broken_fittings: 'Broken Fittings',
  dust_accumulation: 'Dust Accumulation',
  stains_spillage: 'Stains / Spillage',
  none: 'None',
}

export const trainingTopicLabels: Record<TrainingTopic, string> = {
  chemical_usage: 'Chemical Usage',
  chemical_dilution: 'Chemical Dilution Ratio',
  washroom_cleaning: 'Washroom Cleaning',
  cabin_cleaning: 'Cabin Cleaning',
  workstation_cleaning: 'Workstation Cleaning',
  open_area_cleaning: 'Open Area Cleaning',
  lobby_cleaning: 'Lobby Cleaning',
  machinery_usage: 'Machinery Usage',
  mobile_app_usage: 'Mobile App Usage',
  grooming_hygiene: 'Grooming & Hygiene',
}

export const issueLabels: Record<SiteIssue, string> = {
  staff_shortage: 'Staff Shortage',
  material_shortage: 'Material Shortage',
  equipment_breakdown: 'Equipment Breakdown',
  attendance_issue: 'Attendance Issue',
  uniform_noncompliance: 'Uniform Non-Compliance',
  grooming_issue: 'Grooming Issue',
  client_complaint: 'Client Complaint',
  safety_concern: 'Safety Concern',
  cleaning_quality: 'Cleaning Quality Issue',
  other: 'Other',
}

export const materialAvailabilityLabels: Record<string, string> = {
  fully_available: 'Fully Available',
  low_stock: 'Low Stock',
  critical_shortage: 'Critical Shortage',
}

export const equipmentStatusLabels: Record<string, string> = {
  fully_functional: 'Fully Functional',
  minor_issue: 'Minor Issue',
  major_breakdown: 'Major Breakdown',
}

export const finalStatusLabels: Record<string, string> = {
  excellent: 'Excellent',
  good: 'Good',
  needs_improvement: 'Needs Improvement',
  critical: 'Critical',
}

export const complianceCheckLabels: Record<string, string> = {
  wearingUniform: 'Wearing Uniform',
  hasTwoUniforms: 'Has 2 Sets of Uniform',
  wearingSafetyShoes: 'Wearing Safety Shoes',
  wearingIdCard: 'Wearing ID Card',
  groomingMaintained: 'Grooming Standards Maintained',
}

export const knowledgeRatingLabels: Record<string, string> = {
  chemicalKnowledge: 'Chemical Knowledge',
  dilutionRatioKnowledge: 'Dilution Ratio Knowledge',
  washroomCleaningProcedure: 'Washroom Cleaning Procedure',
  machineryUsageKnowledge: 'Machinery Usage Knowledge',
}

export const disciplineCheckLabels: Record<string, string> = {
  attendanceMarkedInApp: 'Attendance Marked in App',
  leaveReportingUnderstood: 'Leave Reporting Process Understood',
  materialReceivedOnTime: 'Material Received on Time',
}
