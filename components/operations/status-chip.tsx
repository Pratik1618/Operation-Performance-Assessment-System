import { ActivityStatus } from '@/lib/types';

const statusConfig: Record<ActivityStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'bg-gray-100', text: 'text-gray-800' },
  submitted: { label: 'Submitted', bg: 'bg-blue-100', text: 'text-blue-800' },
  achieved: { label: 'Achieved', bg: 'bg-green-100', text: 'text-green-800' },
  partially_achieved: { label: 'Partially Achieved', bg: 'bg-amber-100', text: 'text-amber-800' },
  not_achieved: { label: 'Not Achieved', bg: 'bg-red-100', text: 'text-red-800' },
  approved: { label: 'Approved', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  rejected: { label: 'Rejected', bg: 'bg-rose-100', text: 'text-rose-800' },
};

interface StatusChipProps {
  status: ActivityStatus;
  size?: 'sm' | 'md';
}

export function StatusChip({ status, size = 'md' }: StatusChipProps) {
  const config = statusConfig[status];

  const padding = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-block font-medium rounded-full ${config.bg} ${config.text} ${padding} whitespace-nowrap`}>
      {config.label}
    </span>
  );
}
