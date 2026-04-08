import { Link } from 'react-router-dom';
import type { Proposal } from '../types';
import StatusBadge from './StatusBadge';

interface ProposalCardProps {
  proposal: Proposal;
  orgName?: string;
  /** If true, renders a compact inline variant suitable for sidebar lists */
  compact?: boolean;
}

export default function ProposalCard({ proposal, orgName, compact }: ProposalCardProps) {
  if (compact) {
    return (
      <Link
        to={`/proposals/${proposal.id}`}
        className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-brand hover:shadow-sm transition-all"
      >
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge type="proposal" status={proposal.status} />
        </div>
        <h4 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">{proposal.title}</h4>
        {orgName && <p className="text-xs text-gray-500 mb-3">{orgName}</p>}
        <span className="text-xs font-medium text-brand hover:underline">View Proposal →</span>
      </Link>
    );
  }

  return (
    <div className="group bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-sm transition-all duration-300 flex flex-col h-full">
      <div className="flex items-start justify-between gap-4 mb-3">
        <StatusBadge type="proposal" status={proposal.status} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand transition-colors">
        {proposal.title}
      </h3>
      {orgName && (
        <p className="text-sm text-gray-500 mb-2">{orgName}</p>
      )}
      <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">
        {proposal.shortDescription}
      </p>
      <div className="mt-auto pt-4 border-t border-gray-200/70">
        <Link
          to={`/proposals/${proposal.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark transition-colors"
        >
          View Details
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
