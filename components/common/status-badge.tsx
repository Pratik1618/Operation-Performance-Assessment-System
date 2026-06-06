import { AssessmentStatus } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: AssessmentStatus | string
  variant?: 'default' | 'outline' | 'secondary' | 'destructive'
}

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    draft: 'secondary',
    submitted: 'default',
    pending_review: 'outline',
    approved: 'default',
    rejected: 'destructive',
  }

  const statusLabel: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    pending_review: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
  }

  const badgeVariant = statusVariant[status] || 'secondary'
  const label = statusLabel[status] || status

  return <Badge variant={badgeVariant}>{label}</Badge>
}
