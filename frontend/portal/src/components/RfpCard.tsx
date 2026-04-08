import { Link } from 'react-router-dom';
import type { Rfp } from '../types';

interface RfpCardProps {
  rfp: Rfp;
  orgName?: string;
}

export default function RfpCard({ rfp, orgName }: RfpCardProps) {
  return (
    <div className="group bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-sm transition-all duration-300 flex flex-col h-full">
      {orgName && (
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="font-medium">{orgName}</span>
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand transition-colors">
        {rfp.title}
      </h3>
      <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">
        {rfp.shortDescription}
      </p>
      <div className="mt-auto pt-4 border-t border-gray-200/70">
        <Link
          to={`/rfps/${rfp.id}`}
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
