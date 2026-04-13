import { Link } from 'react-router-dom';
import type { Cfeoi } from '../types';
import StatusBadge from './StatusBadge';

interface CfeoiCardProps {
  cfeoi: Cfeoi;
  proposalTitle?: string;
  orgName?: string;
  /** If true, renders a compact variant for sidebar lists */
  compact?: boolean;
}

export default function CfeoiCard({ cfeoi, proposalTitle, orgName, compact }: CfeoiCardProps) {
  if (compact) {
    return (
      <Link to={`/cfeois/${cfeoi.id}`} className="block group">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-brand uppercase tracking-wider">{cfeoi.title}</span>
          <p className="text-xs text-gray-500 line-clamp-2">{cfeoi.description}</p>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
      <div className="flex-grow">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <StatusBadge type="cfeoi" status={cfeoi.status} />
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 rounded">
            {cfeoi.title}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-3">{cfeoi.description}</p>
        <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          {orgName && (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
              {orgName}
            </span>
          )}
          {proposalTitle && (
            <>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Parent:{' '}
                <Link to={`/proposals/${cfeoi.proposalId}`} className="text-brand hover:underline">
                  {proposalTitle}
                </Link>
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col items-start sm:items-end gap-3 min-w-[140px]">
        <Link
          to={`/cfeois/${cfeoi.id}`}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
