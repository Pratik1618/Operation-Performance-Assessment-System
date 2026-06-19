import type { 
  MOMReportData, ClientSentiment, MOMDiscussionTopic, MOMIssue, 
  MOMOpportunityType, MOMOutcome 
} from '../types';

export const sentimentLabels: Record<ClientSentiment, { label: string; emoji: string }> = {
  very_happy: { label: 'Very Happy', emoji: '😀' },
  satisfied: { label: 'Satisfied', emoji: '🙂' },
  neutral: { label: 'Neutral', emoji: '😐' },
  concerned: { label: 'Concerned', emoji: '☹️' },
  escalated: { label: 'Escalated', emoji: '😠' },
};

export const discussionTopicLabels: Record<MOMDiscussionTopic, string> = {
  service_quality: 'Service Quality',
  cleaning_standards: 'Cleaning Standards',
  manpower: 'Manpower',
  attendance: 'Attendance',
  material_availability: 'Material Availability',
  equipment_issues: 'Equipment Issues',
  complaint_followup: 'Complaint Follow-up',
  additional_requirement: 'Additional Requirement',
  contract_commercial: 'Contract / Commercial',
  other: 'Other',
};

export const momIssueLabels: Record<MOMIssue, string> = {
  cleaning_quality: 'Cleaning Quality',
  attendance: 'Attendance',
  staff_behaviour: 'Staff Behaviour',
  material_shortage: 'Material Shortage',
  equipment_breakdown: 'Equipment Breakdown',
  safety_concern: 'Safety Concern',
  service_delay: 'Service Delay',
  other: 'Other',
};

export const opportunityTypeLabels: Record<MOMOpportunityType, string> = {
  additional_manpower: 'Additional Manpower',
  deep_cleaning: 'Deep Cleaning',
  facade_cleaning: 'Facade Cleaning',
  pest_control: 'Pest Control',
  landscaping: 'Landscaping',
  pantry_services: 'Pantry Services',
  technical_services: 'Technical Services',
  other: 'Other',
};

export const outcomeLabels: Record<MOMOutcome, string> = {
  no_action: 'No Action Required',
  action_plan_created: 'Action Plan Created',
  escalation_required: 'Escalation Required',
  business_opportunity: 'Business Opportunity Identified',
};

export function createEmptyMOMReport(): MOMReportData {
  return {
    meetingDate: new Date().toISOString().split('T')[0],
    clientRepName: '',
    clientDesignation: '',
    clientMet: true,
    sentiment: '',
    topics: [],
    issuesRaised: false,
    issues: [],
    actionRequired: false,
    actionItems: [],
    opportunityDiscussed: false,
    opportunity: {
      types: [],
      value: '',
    },
    summary: '',
    followupRequired: false,
    followupDate: '',
    outcome: '',
  };
}
