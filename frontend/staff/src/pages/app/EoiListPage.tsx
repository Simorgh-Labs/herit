import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCfeoiById } from '../../api/cfeois';
import { getProposalById } from '../../api/proposals';
import { deleteEoi, listEoisByCfeoi, updateEoiStatus } from '../../api/eois';
import { getErrorMessage } from '../../api/errors';
import type { Eoi, EoiStatus } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9.5 4h5a1 1 0 011 1v2h-7V5a1 1 0 011-1z"
    />
  </svg>
);

export default function EoiListPage() {
  const { proposalId, cfeoiId } = useParams<{ proposalId: string; cfeoiId: string }>();
  const queryClient = useQueryClient();

  const [statusMutatingId, setStatusMutatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Eoi | null>(null);
  const [deleteChecked, setDeleteChecked] = useState(false);

  const {
    data: cfeoi,
    isLoading: isCfeoiLoading,
    isError: isCfeoiError,
  } = useQuery({ queryKey: ['cfeois', cfeoiId], queryFn: () => getCfeoiById(cfeoiId!), enabled: !!cfeoiId });

  const { data: proposal } = useQuery({
    queryKey: ['proposals', proposalId],
    queryFn: () => getProposalById(proposalId!),
    enabled: !!proposalId,
  });

  const {
    data: eois,
    isLoading: isEoisLoading,
    isError: isEoisError,
  } = useQuery({
    queryKey: ['eois', 'cfeoi', cfeoiId],
    queryFn: () => listEoisByCfeoi(cfeoiId!),
    enabled: !!cfeoiId,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EoiStatus }) => updateEoiStatus(id, status),
    onMutate: ({ id }) => setStatusMutatingId(id),
    onSettled: () => setStatusMutatingId(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['eois', 'cfeoi', cfeoiId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEoi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eois', 'cfeoi', cfeoiId] });
      closeDeleteModal();
    },
  });

  const closeDeleteModal = () => {
    if (deleteMutation.isPending) return;
    setDeleteTarget(null);
    setDeleteChecked(false);
    deleteMutation.reset();
  };

  const isLoading = isCfeoiLoading || isEoisLoading;
  const isError = isCfeoiError || isEoisError;

  if (isLoading) return <LoadingSpinner className="py-32" />;

  if (isError || !cfeoi) {
    return (
      <div className="max-w-[1120px] mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold text-neutral-900 mb-2">CFEOI not found</h2>
        <p className="text-sm text-neutral-500 mb-6">This CFEOI may have been removed.</p>
        {proposalId && (
          <Link to={`/proposals/${proposalId}`} className="text-brand hover:underline font-medium text-sm">
            ← Back to proposal
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[1120px] mx-auto px-6 py-8 pb-16">
      <Link to={`/proposals/${proposalId}`} className="inline-block text-sm text-neutral-500 hover:text-neutral-900 mb-5">
        ← Back to {proposal?.title ?? 'proposal'}
      </Link>

      {cfeoi.status === 'Closed' && (
        <div className="mb-5 px-4 py-3 rounded-lg border border-status-info-text/20 bg-status-info-bg text-status-info-text text-sm leading-relaxed">
          This CFEOI is now closed. It is no longer accepting new expressions of interest. Staff can still review,
          approve, reject, and delete existing submissions below.
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Expressions of Interest</h1>
        <p className="text-sm text-neutral-500 max-w-[560px]">
          Reviewing applicants for {cfeoi.title}. Staff see every submission, including ones the applicant marked
          Private — visibility rules restrict other expats, not staff review.
        </p>
      </div>

      {!eois || eois.length === 0 ? (
        <EmptyState
          title="No expressions of interest yet"
          description="No one has submitted an expression of interest for this CFEOI yet."
        />
      ) : (
        <div className="bg-neutral-0 border border-neutral-200 rounded-lg shadow-soft overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 px-5 py-3 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            <span>Applicant</span>
            <span>Visibility</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          {eois.map((eoi) => (
            <div
              key={eoi.id}
              className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 px-5 py-4 border-b border-neutral-200 last:border-b-0 items-center"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-neutral-900 truncate">{eoi.submitterName}</span>
                <span className="text-xs text-neutral-500 truncate">{eoi.submitterEmail ?? '—'}</span>
              </div>
              <StatusBadge type="eoiVisibility" status={eoi.visibility} />
              <StatusBadge type="eoi" status={eoi.status} />
              <div className="flex items-center justify-end gap-2">
                {eoi.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => statusMutation.mutate({ id: eoi.id, status: 'Approved' })}
                      disabled={statusMutation.isPending && statusMutatingId === eoi.id}
                      title="Approve"
                      className="w-8 h-8 rounded-md border border-status-success-bg bg-status-success-bg text-status-success-text flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                      <CheckIcon />
                    </button>
                    <button
                      onClick={() => statusMutation.mutate({ id: eoi.id, status: 'Rejected' })}
                      disabled={statusMutation.isPending && statusMutatingId === eoi.id}
                      title="Reject"
                      className="w-8 h-8 rounded-md border border-status-danger-bg bg-status-danger-bg text-status-danger-text flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                      <XIcon />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setDeleteTarget(eoi)}
                  title="Delete (staff only)"
                  className="w-8 h-8 rounded-md border border-neutral-200 bg-neutral-0 text-status-danger-text flex items-center justify-center hover:bg-neutral-50 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9.5 4h5a1 1 0 011 1v2h-7V5a1 1 0 011-1z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-neutral-400 leading-relaxed">
        Staff read-access spans every visibility level by design (Shared, Private) — visibility rules restrict other
        expats, not staff review, by design.
      </p>

      {deleteTarget && (
        <Modal
          tone="danger"
          icon={<TrashIcon />}
          title="Delete this expression of interest?"
          description={`This permanently removes ${deleteTarget.submitterName}'s submission. They will lose their own record of it — this cannot be undone.`}
          onClose={closeDeleteModal}
          actions={
            <>
              <button
                onClick={closeDeleteModal}
                className="inline-flex items-center px-4 h-9 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={!deleteChecked || deleteMutation.isPending}
                className="inline-flex items-center px-4 h-9 bg-status-danger-text text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete permanently'}
              </button>
            </>
          }
        >
          <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-neutral-200">
            <input
              type="checkbox"
              checked={deleteChecked}
              onChange={(e) => setDeleteChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-brand"
            />
            <span className="text-sm text-neutral-700 text-left">
              I understand this permanently deletes another person's submission and cannot be undone.
            </span>
          </label>
          {deleteMutation.isError && (
            <p className="mt-3 text-sm text-status-danger-text text-center">
              {getErrorMessage(deleteMutation.error, 'Failed to delete this submission. Please try again.')}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
