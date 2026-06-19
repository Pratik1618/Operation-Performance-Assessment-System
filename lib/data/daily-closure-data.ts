import type { 
  DailyClosureReportData, CleanedArea, CleaningFrequency, 
  WorkCompletionStatus, IncompletionReason, DailyIssue, FinalShiftStatus 
} from '../types';

export const cleanedAreaLabels: Record<CleanedArea, string> = {
  washrooms: 'Washrooms',
  common_areas: 'Common Areas / Lobby',
  office_floors: 'Office Floors / Workstations / Glass Partitions / Conference Rooms / Cabins',
  pantry: 'Pantry / Cafeteria',
  staircase: 'Staircase',
  parking: 'Parking Area',
  outdoor: 'Outdoor Area',
  other: 'Other',
};

export const cleaningFrequencyLabels: Record<CleaningFrequency, string> = {
  '2_times': '2 times',
  '4_times': '4 times',
  '6_times': '6 times',
  'more_than_6': 'More than 6 times',
};

export const completionStatusLabels: Record<WorkCompletionStatus, string> = {
  fully_completed: 'Yes, all work completed',
  partially_completed: 'Partially completed',
  not_completed: 'Could not complete',
};

export const incompletionReasonLabels: Record<IncompletionReason, string> = {
  staff_shortage: 'Shortage of staff',
  material_shortage: 'Material not available',
  area_inaccessible: 'Area inaccessible',
  extra_work: 'Extra work assigned',
  other: 'Other',
};

export const dailyIssueLabels: Record<DailyIssue, string> = {
  no_issues: 'No issues',
  washroom_issue: 'Washroom issue',
  electrical_issue: 'Electrical issue',
  plumbing_issue: 'Plumbing issue',
  material_shortage: 'Housekeeping material shortage',
  safety_hazard: 'Safety hazard',
  customer_complaint: 'Customer complaint',
  other: 'Other',
};

export const finalShiftStatusLabels: Record<FinalShiftStatus, string> = {
  all_clean: 'All assigned areas clean and ready',
  cleaning_in_progress: 'Cleaning in progress for next shift',
  issue_pending: 'Issue pending attention',
  supervisor_informed: 'Supervisor informed (if any issues identified)',
};

export function createEmptyDailyClosureReport(): DailyClosureReportData {
  return {
    cleanedAreas: [],
    cleanedAreasOther: '',
    cleaningFrequency: '',
    completionStatus: '',
    incompletionReasons: [],
    incompletionReasonsOther: '',
    issuesNoticed: [],
    issuesOther: '',
    issuePhotos: [],
    finalStatus: '',
    additionalComments: '',
  };
}
