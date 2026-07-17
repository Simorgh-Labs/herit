import type { RfpStatus } from '../types';

const rfpStatusStyles: Record<RfpStatus, string> = {
  Draft: 'bg-status-neutral-bg text-status-neutral-text',
  Approved: 'bg-status-info-bg text-status-info-text',
  Published: 'bg-status-success-bg text-status-success-text',
};

interface StatusBadgeProps {
  readonly type: 'rfp';
  readonly status: RfpStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border border-transparent ${rfpStatusStyles[status]}`}
    >
      {status}
    </span>
  );
}
