import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCfeoiById } from '../../api/cfeois';
import { getProposalById } from '../../api/proposals';
import { listEoisByCfeoi, updateEoiStatus } from '../../api/eois';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import type { Eoi, EoiStatus } from '../../types';

type StatusFilter = 'All' | EoiStatus;

function EoiCard({ eoi, onApprove, onReject, isMutating }: {
  eoi: Eoi;
  onApprove: () => void;
  onReject: () => void;
  isMutating: boolean;
}) {
  return (
    <div className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-medium text-gray-900">
            Submitter #{eoi.submittedById.slice(0, 8)}
          </span>
          <StatusBadge type="eoi" status={eoi.status} />
        </div>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{eoi.message}</p>
      </div>

      {eoi.status === 'Pending' && (
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={onApprove}
            disabled={isMutating}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            Approve
          </button>
          <button
            onClick={onReject}
            disabled={isMutating}
            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default function CfeoiEoiInboxPage() {
  const { cfeoiId } = useParams<{ cfeoiId: string }>();
  const { user: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [mutatingEoiId, setMutatingEoiId] = useState<string | null>(null);

  const { data: cfeoi, isLoading: isCfeoiLoading, isError } = useQuery({
    queryKey: ['cfeois', cfeoiId],
    queryFn: () => getCfeoiById(cfeoiId!),
    enabled: !!cfeoiId,
  });

  const { data: proposal, isLoading: isProposalLoading } = useQuery({
    queryKey: ['proposals', cfeoi?.proposalId],
    queryFn: () => getProposalById(cfeoi!.proposalId),
    enabled: !!cfeoi?.proposalId,
  });

  const isOwner = !!currentUser && !!proposal && currentUser.id === proposal.authorId;

  const { data: allEois, isLoading: isEoisLoading } = useQuery({
    queryKey: ['eois', 'cfeoi', cfeoiId],
    queryFn: () => listEoisByCfeoi(cfeoiId!),
    enabled: isOwner && !!cfeoiId,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EoiStatus }) => updateEoiStatus(id, status),
    onMutate: ({ id }) => setMutatingEoiId(id),
    onSettled: () => setMutatingEoiId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eois', 'cfeoi', cfeoiId] });
    },
  });

  // Only EOIs the submitter has explicitly shared are visible to the owner.
  const sharedEois = useMemo(() => (allEois ?? []).filter((eoi) => eoi.visibility === 'Shared'), [allEois]);

  const counts = useMemo(
    () => ({
      All: sharedEois.length,
      Pending: sharedEois.filter((e) => e.status === 'Pending').length,
      Approved: sharedEois.filter((e) => e.status === 'Approved').length,
      Rejected: sharedEois.filter((e) => e.status === 'Rejected').length,
    }),
    [sharedEois]
  );

  const filteredEois = statusFilter === 'All' ? sharedEois : sharedEois.filter((e) => e.status === statusFilter);

  if (isCfeoiLoading || isUserLoading || (cfeoi && isProposalLoading)) return <LoadingSpinner className="py-32" />;

  if (isError || !cfeoi) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">CFEOI not found</h2>
        <p className="text-gray-600 mb-6">This CFEOI may have been removed or is not available.</p>
        <Link to="/cfeois" className="text-brand hover:underline font-medium">← Back to CFEOI Directory</Link>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cannot view this inbox</h2>
        <p className="text-gray-600 mb-6">You do not have permission to view expressions of interest for this CFEOI.</p>
        <Link to={`/cfeois/${cfeoiId}`} className="text-brand hover:underline font-medium">← Back to CFEOI Details</Link>
      </div>
    );
  }

  return (
    <div className="w-full pb-16 bg-gray-50">
      {/* Closed-state banner */}
      {cfeoi.status === 'Closed' && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="max-w-[1200px] mx-auto flex items-start sm:items-center gap-3">
            <svg className="w-4 h-4 text-blue-700 mt-0.5 sm:mt-0 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-900">
              <span className="font-semibold">This CFEOI is now closed.</span> It is no longer accepting new expressions of interest. You can still review submitted applications below.
            </p>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-[1200px] mx-auto px-6">
          <nav aria-label="Breadcrumb" className="flex text-sm text-gray-500">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li><Link to="/" className="hover:text-brand transition-colors">Home</Link></li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <Link to={`/cfeois/${cfeoiId}`} className="hover:text-brand transition-colors">{cfeoi.title}</Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <span className="text-gray-900 font-medium">Expressions of Interest</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Expressions of Interest</h1>
            <p className="mt-1 text-sm text-gray-500">Review and manage applicants for {cfeoi.title}.</p>
          </div>

          <div className="flex items-center gap-3">
            {(['All', 'Pending', 'Approved', 'Rejected'] as StatusFilter[]).map((status) => (
              <div key={status} className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex flex-col items-center min-w-[90px]">
                <span className="text-2xl font-bold text-gray-900">{counts[status]}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">{status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
            >
              <option value="All">Status: All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {isEoisLoading ? (
            <LoadingSpinner className="py-16" />
          ) : filteredEois.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-500 text-sm">
                {sharedEois.length === 0
                  ? 'No expressions of interest have been shared for this CFEOI yet.'
                  : 'No expressions of interest match the selected filter.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredEois.map((eoi) => (
                <EoiCard
                  key={eoi.id}
                  eoi={eoi}
                  isMutating={statusMutation.isPending && mutatingEoiId === eoi.id}
                  onApprove={() => statusMutation.mutate({ id: eoi.id, status: 'Approved' })}
                  onReject={() => statusMutation.mutate({ id: eoi.id, status: 'Rejected' })}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
