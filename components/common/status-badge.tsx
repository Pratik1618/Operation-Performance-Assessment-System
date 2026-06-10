import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'outline' | 'secondary' | 'destructive'
}

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    draft: 'secondary',
    submitted: 'default',
    pending: 'outline',
    pending_review: 'outline',
    in_progress: 'outline',
    approved: 'default',
    rejected: 'destructive',
    overdue: 'destructive',
    open: 'outline',
    resolved: 'default',
    closed: 'secondary',
  }

  const statusLabel: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    pending: 'Pending',
    pending_review: 'Pending Review',
    in_progress: 'In Progress',
    approved: 'Approved',
    rejected: 'Rejected',
    overdue: 'Overdue',
    open: 'Open',
    under_review: 'Under Review',
    resolved: 'Resolved',
    closed: 'Closed',
    investigating: 'Investigating',
    escalated: 'Escalated',
    follow_up: 'Follow Up',
  }

  const badgeVariant = statusVariant[status] || 'secondary'
  const label = statusLabel[status] || status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return <Badge variant={badgeVariant}>{label}</Badge>
}
