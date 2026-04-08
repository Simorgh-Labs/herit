import type { ProposalStatus, CfeoiStatus, EoiStatus } from '../types';

const proposalStatusStyles: Record<ProposalStatus, string> = {
  Ideation:    'bg-gray-100 text-gray-700 border-gray-200',
  Resourcing:  'bg-blue-100 text-blue-700 border-blue-200',
  Submitted:   'bg-amber-100 text-amber-700 border-amber-200',
  UnderReview: 'bg-orange-100 text-orange-700 border-orange-200',
  Approved:    'bg-green-100 text-green-700 border-green-200',
  Withdrawn:   'bg-red-100 text-red-600 border-red-200',
};

const cfeoiStatusStyles: Record<CfeoiStatus, string> = {
  Open:   'bg-green-100 text-green-700 border-green-200',
  Closed: 'bg-gray-100 text-gray-500 border-gray-200',
};

const eoiStatusStyles: Record<EoiStatus, string> = {
  Pending:  'bg-gray-100 text-gray-700 border-gray-200',
  Approved: 'bg-green-100 text-green-700 border-green-200',
  Rejected: 'bg-red-100 text-red-600 border-red-200',
};

type StatusBadgeProps =
  | { type: 'proposal'; status: ProposalStatus }
  | { type: 'cfeoi'; status: CfeoiStatus }
  | { type: 'eoi'; status: EoiStatus };

export default function StatusBadge(props: StatusBadgeProps) {
  let styles = '';
  if (props.type === 'proposal') styles = proposalStatusStyles[props.status];
  else if (props.type === 'cfeoi') styles = cfeoiStatusStyles[props.status];
  else styles = eoiStatusStyles[props.status];

  const label = props.status === 'UnderReview' ? 'Under Review' : props.status;

  return (
    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${styles}`}>
      {label}
    </span>
  );
}
