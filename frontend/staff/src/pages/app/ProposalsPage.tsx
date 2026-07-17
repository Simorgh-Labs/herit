import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listProposals } from '../../api/proposals';
import type { ProposalStatus } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

type QueueTab = 'Submitted' | 'UnderReview' | 'All';

const PRIMARY_TABS: { value: QueueTab; label: string }[] = [
  { value: 'Submitted', label: 'Submitted' },
  { value: 'UnderReview', label: 'Under Review' },
];

const EMPTY_STATE_COPY: Record<QueueTab, { title: string; description: string }> = {
  Submitted: {
    title: 'Nothing submitted for review',
    description: 'No proposals are waiting for review right now. New submissions will appear here.',
  },
  UnderReview: {
    title: 'Nothing under review',
    description: 'No proposals are currently under review. Proposals move here once staff start reviewing a submission.',
  },
  All: {
    title: 'No proposals yet',
    description: 'No proposals have been created on the platform yet.',
  },
};

function isQueueTab(value: string | null): value is QueueTab {
  return value === 'Submitted' || value === 'UnderReview' || value === 'All';
}

export default function ProposalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const deleted = searchParams.get('deleted') === 'true';

  const statusParam = searchParams.get('status');
  const activeTab: QueueTab = isQueueTab(statusParam) ? statusParam : 'Submitted';

  const setActiveTab = (tab: QueueTab) => {
    setSearchParams({ status: tab });
  };

  const {
    data: proposals,
    isLoading,
    isError,
  } = useQuery({ queryKey: ['proposals'], queryFn: listProposals });

  const filtered = useMemo(() => {
    if (activeTab === 'All') return proposals ?? [];
    return (proposals ?? []).filter((p) => p.status === (activeTab as ProposalStatus));
  }, [proposals, activeTab]);

  return (
    <div className="max-w-[1120px] mx-auto px-6 py-8 pb-16">
      {deleted && (
        <div className="mb-5 px-4 py-3 rounded-lg border border-status-success-text/20 bg-status-success-bg text-status-success-text text-sm font-medium">
          Proposal deleted.
        </div>
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Proposal review queue</h1>
        <p className="text-sm text-neutral-500">
          Staff drive proposals from Submitted through Approved. There is no reject transition — deletion is the
          only negative outcome.
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-neutral-200 mb-5">
        {PRIMARY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-1 py-2.5 -mb-px text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.value
                ? 'border-brand text-brand'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="w-px h-5 bg-neutral-200 mx-2" />
        <button
          onClick={() => setActiveTab('All')}
          className={`px-1 py-2.5 -mb-px text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'All'
              ? 'border-brand text-brand'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          All proposals
        </button>
      </div>

      {activeTab === 'All' && (
        <p className="mb-4 px-3.5 py-2.5 text-xs text-neutral-500 bg-neutral-50 border border-dashed border-neutral-200 rounded-lg leading-relaxed">
          Staff read-access spans every proposal regardless of visibility — Private proposals submitted by an expat
          are included in this tab by design, not a leak.
        </p>
      )}

      {isLoading && <LoadingSpinner />}
      {isError && (
        <div className="py-10 text-center text-sm text-status-danger-text">
          Failed to load proposals. Please try again.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {filtered.length === 0 ? (
            <EmptyState
              title={EMPTY_STATE_COPY[activeTab].title}
              description={EMPTY_STATE_COPY[activeTab].description}
            />
          ) : (
            <div className="bg-neutral-0 border border-neutral-200 rounded-lg shadow-soft overflow-hidden">
              <div className="grid grid-cols-[2.2fr_1.3fr_1.3fr_0.9fr_0.9fr_24px] gap-3 px-5 py-3 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                <span>Title</span>
                <span>Author</span>
                <span>Organisation</span>
                <span>Status</span>
                <span>Visibility</span>
                <span />
              </div>
              {filtered.map((proposal) => (
                <Link
                  key={proposal.id}
                  to={`/proposals/${proposal.id}`}
                  className="grid grid-cols-[2.2fr_1.3fr_1.3fr_0.9fr_0.9fr_24px] gap-3 px-5 py-4 border-b border-neutral-200 last:border-b-0 items-center hover:bg-neutral-50 transition-colors"
                >
                  <span className="text-sm font-medium text-neutral-900">{proposal.title}</span>
                  <span className="text-sm text-neutral-500">{proposal.authorName}</span>
                  <span className="text-sm text-neutral-500">{proposal.organisationName}</span>
                  <StatusBadge type="proposal" status={proposal.status} />
                  <StatusBadge type="visibility" status={proposal.visibility} />
                  <span className="text-neutral-300">›</span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
