import Badge from '@/components/ui/Badge';

const statusConfig: Record<string, { variant: 'primary' | 'success' | 'warning' | 'danger' | 'gray' | 'purple'; label: string }> = {
  Active: { variant: 'success', label: 'Active' },
  Inactive: { variant: 'danger', label: 'Inactive' },
  Draft: { variant: 'warning', label: 'Draft' },
  Published: { variant: 'success', label: 'Published' },
  Closed: { variant: 'gray', label: 'Closed' },
  Submitted: { variant: 'primary', label: 'Submitted' },
  LateSubmitted: { variant: 'warning', label: 'Late' },
  Graded: { variant: 'success', label: 'Graded' },
  Rejected: { variant: 'danger', label: 'Rejected' },
  Resubmitted: { variant: 'purple', label: 'Resubmitted' },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { variant: 'gray' as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}