import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { listProposals } from '../../api/proposals';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import type { ProposalStatus } from '../../types';

type FilterTab = 'All' | ProposalStatus;

const TAB_LABELS: Record<FilterTab, string> = {
  All: 'All',
  Ideation: 'Ideation',
  Resourcing: 'Resourcing',
  Submitted: 'Submitted',
  UnderReview: 'Under Review',
  Approved: 'Approved',
  Withdrawn: 'Withdrawn',
};

const STATUS_BADGE: Record<ProposalStatus, { label: string; className: string }> = {
  Ideation:    { label: 'Ideation',      className: 'bg-gray-100 text-gray-600 border-gray-200' },
  Resourcing:  { label: 'Resourcing',    className: 'bg-blue-50 text-blue-600 border-blue-200' },
  Submitted:   { label: 'Submitted',     className: 'bg-amber-50 text-amber-700 border-amber-200' },
  UnderReview: { label: 'Under Review',  className: 'bg-orange-50 text-orange-600 border-orange-200' },
  Approved:    { label: 'Approved',      className: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  Withdrawn:   { label: 'Withdrawn',     className: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const VISIBILITY_LABELS: Record<string, string> = {
  Private: 'Private',
  Shared: 'Shared',
  Public: 'Public',
};

export default function MyProposalsPage() {
  const { user } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  const { data: allProposals = [], isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: listProposals,
  });

  const myProposals = allProposals.filter((p) => p.authorId === user?.id);

  const tabs: FilterTab[] = ['All', 'Ideation', 'Resourcing', 'Submitted', 'UnderReview', 'Approved', 'Withdrawn'];

  const counts = tabs.reduce<Record<FilterTab, number>>((acc, tab) => {
    acc[tab] = tab === 'All' ? myProposals.length : myProposals.filter((p) => p.status === tab).length;
    return acc;
  }, {} as Record<FilterTab, number>);

  const filtered = activeTab === 'All' ? myProposals : myProposals.filter((p) => p.status === activeTab);

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Proposals</h1>
        <Link
          to="/proposals/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Proposal
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap bg-gray-100 p-1 rounded-xl w-max mb-6 max-w-full overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {TAB_LABELS[tab]}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-md ${
              activeTab === tab ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-400 shadow-sm'
            }`}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {isLoading && <LoadingSpinner className="py-20" />}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          title={activeTab === 'All' ? 'No proposals yet' : `No ${TAB_LABELS[activeTab]} proposals`}
          description={
            activeTab === 'All' ?
              "You haven't created any proposals. Start by creating a new one." :
              `You have no proposals in the ${TAB_LABELS[activeTab]} stage.`
          }
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((proposal) => {
            const badge = STATUS_BADGE[proposal.status];
            return (
              <Link
                key={proposal.id}
                to={`/proposals/${proposal.id}`}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-brand transition-colors">
                    {proposal.title}
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap flex-shrink-0 ${badge.className}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {badge.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-1">{proposal.shortDescription}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Visibility: {VISIBILITY_LABELS[proposal.visibility] ?? proposal.visibility}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
