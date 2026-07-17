import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteProposal, getProposalById, updateProposalStatus } from '../../api/proposals';
import { listCfeois } from '../../api/cfeois';
import { listEoisByCfeoi } from '../../api/eois';
import { getErrorMessage } from '../../api/errors';
import { getRfpById } from '../../api/rfps';
import type { ProposalStatus } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';

type ModalKind = 'start-review' | 'approve' | 'delete' | null;

const SearchIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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

export default function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<ModalKind>(null);
  const [deleteChecked, setDeleteChecked] = useState(false);

  const {
    data: proposal,
    isLoading,
    isError,
  } = useQuery({ queryKey: ['proposals', id], queryFn: () => getProposalById(id!) });

  const { data: rfp } = useQuery({
    queryKey: ['rfps', proposal?.rfpId],
    queryFn: () => getRfpById(proposal!.rfpId!),
    enabled: !!proposal?.rfpId,
  });

  const { data: cfeois } = useQuery({
    queryKey: ['cfeois', id],
    queryFn: () => listCfeois(id!),
    enabled: !!id,
  });

  const eoiCountQueries = useQueries({
    queries: (cfeois ?? []).map((c) => ({
      queryKey: ['eois', 'cfeoi', c.id],
      queryFn: () => listEoisByCfeoi(c.id),
    })),
  });

  const statusMutation = useMutation({
    mutationFn: (status: ProposalStatus) => updateProposalStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setModal(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProposal(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      navigate('/proposals?deleted=true');
    },
  });

  const closeModal = () => {
    if (statusMutation.isPending || deleteMutation.isPending) return;
    setModal(null);
    setDeleteChecked(false);
    statusMutation.reset();
    deleteMutation.reset();
  };

  if (isLoading) return <LoadingSpinner className="py-32" />;

  if (isError || !proposal) {
    return (
      <div className="max-w-[760px] mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Proposal not found</h2>
        <p className="text-sm text-neutral-500 mb-6">This proposal may have been removed.</p>
        <Link to="/proposals" className="text-brand hover:underline font-medium text-sm">
          ← Back to review queue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1120px] mx-auto px-6 py-8 pb-16">
      <Link to="/proposals" className="inline-block text-sm text-neutral-500 hover:text-neutral-900 mb-5">
        ← Back to review queue
      </Link>

      <div className="flex items-center gap-2 mb-2">
        <StatusBadge type="proposal" status={proposal.status} />
        <StatusBadge type="visibility" status={proposal.visibility} />
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">{proposal.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
        <div className="flex flex-col gap-5">
          <div className="bg-neutral-0 border border-neutral-200 rounded-lg shadow-soft p-6">
            <h2 className="text-sm font-semibold text-neutral-900 mb-3">Proposal content</h2>
            <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide mb-2">Short description</h3>
            <p className="text-sm text-neutral-500 leading-relaxed mb-4">{proposal.shortDescription}</p>
            <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide mb-2">Long description</h3>
            <p className="text-sm text-neutral-500 leading-relaxed whitespace-pre-line mb-4">
              {proposal.longDescription}
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              This content is read-only here — staff review and move proposals through the lifecycle but never edit
              what an expat submitted.
            </p>
          </div>

          <div className="bg-neutral-0 border border-neutral-200 rounded-lg shadow-soft p-6">
            <h2 className="text-sm font-semibold text-neutral-900 mb-3">CFEOIs under this proposal</h2>
            {!cfeois || cfeois.length === 0 ? (
              <p className="text-sm text-neutral-500">No CFEOIs have been published under this proposal yet.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {cfeois.map((c, i) => (
                  <Link
                    key={c.id}
                    to={`/proposals/${proposal.id}/cfeois/${c.id}/eois`}
                    className="flex items-center justify-between px-3.5 py-2.5 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-neutral-900">{c.title}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-500">
                        {eoiCountQueries[i]?.data?.length ?? '—'} EOIs
                      </span>
                      <span
                        className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                          c.status === 'Open'
                            ? 'bg-status-info-bg text-status-info-text'
                            : 'bg-status-neutral-bg text-status-neutral-text'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {proposal.status === 'Approved' && (
            <div className="px-4 py-3 rounded-lg border border-status-success-text/20 bg-status-success-bg text-status-success-text text-sm leading-relaxed">
              This proposal has completed the review lifecycle; there is no further staff transition. Project
              conversion is out of scope for this app. Future: the owner will be notified by email once
              notifications are available.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-neutral-0 border border-neutral-200 rounded-lg shadow-soft p-5">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Submitted by</h3>
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">
                {proposal.authorName.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <div className="text-sm font-medium text-neutral-900">{proposal.authorName}</div>
                <div className="text-xs text-neutral-500">{proposal.organisationName}</div>
              </div>
            </div>
          </div>

          {proposal.rfpId && (
            <div className="bg-neutral-0 border border-neutral-200 rounded-lg shadow-soft p-5">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Linked RFP</h3>
              <Link to={`/rfps/${proposal.rfpId}`} className="text-sm text-brand hover:underline font-medium">
                {rfp?.title ?? 'View RFP'} →
              </Link>
            </div>
          )}

          <div className="bg-neutral-0 border border-neutral-200 rounded-lg shadow-soft p-5">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Review action</h3>
            {proposal.status === 'Submitted' && (
              <button
                onClick={() => setModal('start-review')}
                className="w-full inline-flex items-center justify-center px-4 h-10 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
              >
                Start review
              </button>
            )}
            {proposal.status === 'UnderReview' && (
              <button
                onClick={() => setModal('approve')}
                className="w-full inline-flex items-center justify-center px-4 h-10 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
              >
                Approve
              </button>
            )}
            {proposal.status === 'Approved' && (
              <p className="text-xs text-neutral-500 leading-relaxed">No further review action — approval is terminal.</p>
            )}
            {proposal.status !== 'Submitted' && proposal.status !== 'UnderReview' && proposal.status !== 'Approved' && (
              <p className="text-xs text-neutral-500 leading-relaxed">No staff review action is available in this status.</p>
            )}
          </div>

          <div className="border border-status-danger-bg bg-neutral-0 rounded-lg p-5">
            <h3 className="text-xs font-semibold text-status-danger-text uppercase tracking-wide mb-1.5">Takedown</h3>
            <p className="text-xs text-neutral-500 leading-relaxed mb-3">
              Deletion is the only moderation action available — it is separate from the review lifecycle and
              available in every status.
            </p>
            <button
              onClick={() => setModal('delete')}
              className="w-full inline-flex items-center justify-center px-4 h-9 bg-status-danger-bg text-status-danger-text text-sm font-medium rounded-lg hover:bg-status-danger-bg/70 transition-colors"
            >
              Delete proposal
            </button>
          </div>
        </div>
      </div>

      {modal === 'start-review' && (
        <Modal
          tone="neutral"
          icon={<SearchIcon />}
          title="Start review?"
          description="Moves this proposal to Under Review. You can approve it once you've finished reviewing."
          onClose={closeModal}
          actions={
            <>
              <button
                onClick={closeModal}
                className="inline-flex items-center px-4 h-9 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => statusMutation.mutate('UnderReview')}
                disabled={statusMutation.isPending}
                className="inline-flex items-center px-4 h-9 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {statusMutation.isPending ? 'Starting...' : 'Start review'}
              </button>
            </>
          }
        >
          {statusMutation.isError && (
            <p className="text-sm text-status-danger-text text-center">
              {getErrorMessage(statusMutation.error, 'Failed to start review. Please try again.')}
            </p>
          )}
        </Modal>
      )}

      {modal === 'approve' && (
        <Modal
          tone="neutral"
          icon={<CheckIcon />}
          title="Approve this proposal?"
          description="Marks it Approved — the terminal state in this app. There is no further staff transition."
          onClose={closeModal}
          actions={
            <>
              <button
                onClick={closeModal}
                className="inline-flex items-center px-4 h-9 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => statusMutation.mutate('Approved')}
                disabled={statusMutation.isPending}
                className="inline-flex items-center px-4 h-9 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {statusMutation.isPending ? 'Approving...' : 'Approve'}
              </button>
            </>
          }
        >
          {statusMutation.isError && (
            <p className="text-sm text-status-danger-text text-center">
              {getErrorMessage(statusMutation.error, 'Failed to approve this proposal. Please try again.')}
            </p>
          )}
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal
          tone="danger"
          icon={<TrashIcon />}
          title="Delete this proposal?"
          description={`This permanently removes "${proposal.title}" — the proposal and its CFEOIs and their EOIs are permanently deleted. It cannot be undone.`}
          onClose={closeModal}
          actions={
            <>
              <button
                onClick={closeModal}
                className="inline-flex items-center px-4 h-9 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={!deleteChecked || deleteMutation.isPending}
                className="inline-flex items-center px-4 h-9 bg-status-danger-text text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete proposal'}
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
              I understand this action is permanent and cannot be undone.
            </span>
          </label>
          {deleteMutation.isError && (
            <p className="mt-3 text-sm text-status-danger-text text-center">
              {getErrorMessage(deleteMutation.error, 'Failed to delete this proposal. Please try again.')}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
