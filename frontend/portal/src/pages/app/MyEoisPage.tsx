import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listMyEois, setEoiVisibility, withdrawEoi } from '../../api/eois';
import { listCfeois } from '../../api/cfeois';
import { listProposals } from '../../api/proposals';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import type { Eoi, EoiVisibility } from '../../types';

type FilterTab = 'All' | 'Pending' | 'Approved' | 'Rejected';

const TABS: FilterTab[] = ['All', 'Pending', 'Approved', 'Rejected'];

export default function MyEoisPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [withdrawTarget, setWithdrawTarget] = useState<Eoi | null>(null);
  const [withdrawConfirmed, setWithdrawConfirmed] = useState(false);

  const { data: eois = [], isLoading } = useQuery({
    queryKey: ['eois', 'my'],
    queryFn: listMyEois,
  });

  const { data: cfeois = [] } = useQuery({
    queryKey: ['cfeois'],
    queryFn: () => listCfeois(),
  });

  const { data: proposals = [] } = useQuery({
    queryKey: ['proposals'],
    queryFn: listProposals,
  });

  const cfeoiById = new Map(cfeois.map((c) => [c.id, c]));
  const proposalById = new Map(proposals.map((p) => [p.id, p]));

  const counts = TABS.reduce<Record<FilterTab, number>>((acc, tab) => {
    acc[tab] = tab === 'All' ? eois.length : eois.filter((e) => e.status === tab).length;
    return acc;
  }, {} as Record<FilterTab, number>);

  const filtered = activeTab === 'All' ? eois : eois.filter((e) => e.status === activeTab);

  const visibilityMutation = useMutation({
    mutationFn: ({ id, visibility }: { id: string; visibility: EoiVisibility }) => setEoiVisibility(id, visibility),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['eois', 'my'] }),
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: string) => withdrawEoi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eois', 'my'] });
      setWithdrawTarget(null);
      setWithdrawConfirmed(false);
    },
  });

  const closeWithdrawModal = () => {
    setWithdrawTarget(null);
    setWithdrawConfirmed(false);
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My EOIs</h1>
      <p className="text-sm text-gray-500 mb-6">Expressions of interest you've submitted to Calls for Expression of Interest.</p>

      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 flex items-center gap-2 mb-6">
        <svg className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-blue-900">Filters are applied client-side — server-side status filtering isn't implemented yet.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap bg-gray-100 p-1 rounded-xl w-max mb-6 max-w-full overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
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
          title={activeTab === 'All' ? 'No expressions of interest yet' : `No ${activeTab} EOIs`}
          description={
            activeTab === 'All'
              ? "When you express interest in a Call for Expression of Interest, it'll appear here so you can track its status, manage visibility, or withdraw it."
              : `You have no EOIs with ${activeTab} status.`
          }
          action={
            activeTab === 'All' ? (
              <Link
                to="/cfeois"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium rounded-lg transition-colors"
              >
                Browse the CFEOI Directory
              </Link>
            ) : undefined
          }
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((eoi) => {
            const cfeoi = cfeoiById.get(eoi.cfeoiId);
            const proposal = cfeoi ? proposalById.get(cfeoi.proposalId) : undefined;
            const isVisibilityPending = visibilityMutation.isPending && visibilityMutation.variables?.id === eoi.id;

            return (
              <div key={eoi.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-2">
                  {cfeoi ? (
                    <Link to={`/cfeois/${cfeoi.id}`} className="text-base font-semibold text-gray-900 hover:text-brand transition-colors">
                      {cfeoi.title}
                    </Link>
                  ) : (
                    <span className="text-base font-semibold text-gray-900">CFEOI unavailable</span>
                  )}
                  <StatusBadge type="eoi" status={eoi.status} />
                </div>

                {proposal && <p className="text-xs text-gray-500 mb-3">{proposal.title}</p>}

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">"{eoi.message}"</p>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center bg-gray-100 p-1 rounded-lg" role="group" aria-label="EOI visibility">
                    <button
                      onClick={() => visibilityMutation.mutate({ id: eoi.id, visibility: 'Private' })}
                      disabled={isVisibilityPending}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-60 ${
                        eoi.visibility === 'Private' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Private
                    </button>
                    <button
                      onClick={() => visibilityMutation.mutate({ id: eoi.id, visibility: 'Shared' })}
                      disabled={isVisibilityPending}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-60 ${
                        eoi.visibility === 'Shared' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Shared
                    </button>
                  </div>

                  <button
                    onClick={() => setWithdrawTarget(eoi)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg font-medium text-xs hover:bg-red-50 transition-colors"
                  >
                    {eoi.status === 'Rejected' ? 'Delete' : 'Withdraw'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Withdraw / Delete confirmation modal */}
      {withdrawTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
                <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {withdrawTarget.status === 'Rejected' ? 'Delete expression of interest?' : 'Withdraw expression of interest?'}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                This will permanently delete your EOI for{' '}
                <span className="font-medium text-gray-700">{cfeoiById.get(withdrawTarget.cfeoiId)?.title ?? 'this CFEOI'}</span>.
                It is not archived and cannot be undone — the record is removed entirely and disappears from your list and the owner's inbox.
                You'd need to submit a brand-new EOI to express interest again.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-y border-gray-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={withdrawConfirmed}
                  onChange={(e) => setWithdrawConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-brand border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I understand that {withdrawTarget.status === 'Rejected' ? 'deleting' : 'withdrawing'} this EOI permanently deletes it and cannot be undone.
                </span>
              </label>
            </div>
            {withdrawMutation.isError && (
              <p className="text-sm text-red-600 px-6 pt-4">Something went wrong. Please try again.</p>
            )}
            <div className="px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={closeWithdrawModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => withdrawMutation.mutate(withdrawTarget.id)}
                disabled={!withdrawConfirmed || withdrawMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {withdrawMutation.isPending
                  ? (withdrawTarget.status === 'Rejected' ? 'Deleting...' : 'Withdrawing...')
                  : (withdrawTarget.status === 'Rejected' ? 'Delete EOI' : 'Withdraw EOI')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
