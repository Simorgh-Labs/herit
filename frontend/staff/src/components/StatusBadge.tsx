import type { EoiStatus, EoiVisibility, ProposalStatus, ProposalVisibility, RfpStatus, UserRole } from '../types';

const rfpStatusStyles: Record<RfpStatus, string> = {
  Draft: 'bg-status-neutral-bg text-status-neutral-text',
  Approved: 'bg-status-info-bg text-status-info-text',
  Published: 'bg-status-success-bg text-status-success-text',
};

const proposalStatusStyles: Record<ProposalStatus, string> = {
  Ideation: 'bg-status-neutral-bg text-status-neutral-text',
  Resourcing: 'bg-status-info-bg text-status-info-text',
  Submitted: 'bg-status-amber-bg text-status-amber-text',
  UnderReview: 'bg-status-orange-bg text-status-orange-text',
  Approved: 'bg-status-success-bg text-status-success-text',
  Withdrawn: 'bg-status-danger-bg text-status-danger-text',
};

const visibilityStyles: Record<ProposalVisibility, string> = {
  Public: 'bg-status-neutral-bg text-status-neutral-text',
  Private: 'bg-status-neutral-bg text-status-neutral-text',
  Shared: 'bg-status-info-bg text-status-info-text',
};

const eoiStatusStyles: Record<EoiStatus, string> = {
  Pending: 'bg-status-neutral-bg text-status-neutral-text',
  Approved: 'bg-status-success-bg text-status-success-text',
  Rejected: 'bg-status-danger-bg text-status-danger-text',
};

const eoiVisibilityStyles: Record<EoiVisibility, string> = {
  Private: 'bg-status-neutral-bg text-status-neutral-text',
  Shared: 'bg-status-info-bg text-status-info-text',
};

const roleStyles: Record<UserRole, string> = {
  SuperAdmin: 'bg-status-danger-bg text-status-danger-text',
  OrganisationAdmin: 'bg-status-amber-bg text-status-amber-text',
  Staff: 'bg-status-info-bg text-status-info-text',
  Expat: 'bg-status-neutral-bg text-status-neutral-text',
};

type StatusBadgeProps =
  | { readonly type: 'rfp'; readonly status: RfpStatus }
  | { readonly type: 'proposal'; readonly status: ProposalStatus }
  | { readonly type: 'visibility'; readonly status: ProposalVisibility }
  | { readonly type: 'eoi'; readonly status: EoiStatus }
  | { readonly type: 'eoiVisibility'; readonly status: EoiVisibility }
  | { readonly type: 'role'; readonly status: UserRole; readonly label: string };

function styleFor(props: StatusBadgeProps): string {
  switch (props.type) {
    case 'rfp':
      return rfpStatusStyles[props.status];
    case 'proposal':
      return proposalStatusStyles[props.status];
    case 'visibility':
      return visibilityStyles[props.status];
    case 'eoi':
      return eoiStatusStyles[props.status];
    case 'eoiVisibility':
      return eoiVisibilityStyles[props.status];
    case 'role':
      return roleStyles[props.status];
  }
}

export default function StatusBadge(props: StatusBadgeProps) {
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border border-transparent whitespace-nowrap ${styleFor(props)}`}
    >
      {props.type === 'role' ? props.label : props.status}
    </span>
  );
}
