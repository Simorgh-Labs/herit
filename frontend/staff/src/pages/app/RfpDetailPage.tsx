import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteRfp, getRfpById, updateRfpStatus } from '../../api/rfps';
import { getErrorMessage } from '../../api/errors';
import { listOrganisations } from '../../api/organisations';
import type { RfpStatus } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL ?? 'https://herit.app';

type ModalKind = 'approve' | 'publish' | 'delete' | null;

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12h18M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9z"
    />
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

export default function RfpDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const created = searchParams.get('created') === 'true';
  const updated = searchParams.get('updated') === 'true';

  const [modal, setModal] = useState<ModalKind>(null);
  const [deleteChecked, setDeleteChecked] = useState(false);

  const {
    data: rfp,
    isLoading,
    isError,
  } = useQuery({ queryKey: ['rfps', id], queryFn: () => getRfpById(id!) });

  const { data: organisations } = useQuery({ queryKey: ['organisations'], queryFn: listOrganisations });

  const statusMutation = useMutation({
    mutationFn: (status: RfpStatus) => updateRfpStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
      setModal(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteRfp(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
      navigate('/rfps?deleted=true');
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

  if (isError || !rfp) {
    return (
      <div className="max-w-[760px] mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold text-neutral-900 mb-2">RFP not found</h2>
        <p className="text-sm text-neutral-500 mb-6">This RFP may have been removed.</p>
        <Link to="/rfps" className="text-brand hover:underline font-medium text-sm">
          ← Back to RFPs
        </Link>
      </div>
    );
  }

  const org = organisations?.find((o) => o.id === rfp.organisationId);
  const subtitle = [org?.name, rfp.tags].filter(Boolean).join(' · ');
  const publicUrl = `${PORTAL_URL}/rfps/${rfp.id}`;

  const deleteDescription =
    rfp.status === 'Published'
      ? 'This RFP is currently live on the portal. Deleting it removes it from the portal immediately. Proposals that already reference this RFP keep their reference — deleting the RFP does not delete or alter them.'
      : 'This permanently deletes the RFP. It cannot be undone.';

  return (
    <div className="max-w-[800px] mx-auto px-6 py-8 pb-16">
      <Link to="/rfps" className="inline-block text-sm text-neutral-500 hover:text-neutral-900 mb-5">
        ← Back to RFPs
      </Link>

      {created && (
        <div className="mb-5 px-4 py-3 rounded-lg border border-status-success-text/20 bg-status-success-bg text-status-success-text text-sm font-medium">
          RFP created — it starts in Draft.
        </div>
      )}
      {updated && (
        <div className="mb-5 px-4 py-3 rounded-lg border border-status-success-text/20 bg-status-success-bg text-status-success-text text-sm font-medium">
          RFP changes saved.
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-1.5">
        <h1 className="text-2xl font-bold text-neutral-900">{rfp.title}</h1>
        <StatusBadge type="rfp" status={rfp.status} />
      </div>
      {subtitle && <p className="text-sm text-neutral-500 mb-5">{subtitle}</p>}

      {rfp.status === 'Published' && (
        <div className="mb-5 px-4 py-3 rounded-lg border border-status-success-text/20 bg-status-success-bg text-status-success-text text-sm">
          Live on the portal — expats can view and respond to this RFP right now.{' '}
          <a href={publicUrl} target="_blank" rel="noreferrer" className="font-semibold underline">
            View public page
          </a>
        </div>
      )}

      <div className="bg-neutral-0 border border-neutral-200 rounded-lg shadow-soft p-6">
        <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide mb-2">Short description</h3>
        <p className="text-sm text-neutral-500 leading-relaxed mb-5">{rfp.shortDescription}</p>
        <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide mb-2">Long description</h3>
        <p className="text-sm text-neutral-500 leading-relaxed whitespace-pre-line">{rfp.longDescription}</p>
      </div>

      <div className="mt-6 pt-5 border-t border-neutral-200 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-3">
          <Link
            to={`/rfps/${rfp.id}/edit`}
            className="inline-flex items-center px-4 h-10 bg-neutral-0 border border-neutral-200 text-sm font-medium text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Edit
          </Link>
          {rfp.status === 'Draft' && (
            <button
              onClick={() => setModal('approve')}
              className="inline-flex items-center px-4 h-10 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
            >
              Approve
            </button>
          )}
          {rfp.status === 'Approved' && (
            <button
              onClick={() => setModal('publish')}
              className="inline-flex items-center px-4 h-10 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
            >
              Publish
            </button>
          )}
        </div>
        <button
          onClick={() => setModal('delete')}
          className="inline-flex items-center px-4 h-10 bg-status-danger-bg text-status-danger-text text-sm font-medium rounded-lg hover:bg-status-danger-bg/70 transition-colors"
        >
          Delete
        </button>
      </div>

      {modal === 'approve' && (
        <Modal
          tone="neutral"
          icon={<CheckIcon />}
          title="Approve this RFP?"
          description="Marks it ready to publish. Staff can still edit before publishing — this does not put it on the portal yet."
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
              {getErrorMessage(statusMutation.error, 'Failed to approve this RFP. Please try again.')}
            </p>
          )}
        </Modal>
      )}

      {modal === 'publish' && (
        <Modal
          tone="neutral"
          icon={<GlobeIcon />}
          title="Publish this RFP?"
          description="This puts the RFP live on the public Herit Portal immediately. Here's what expats will see:"
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
                onClick={() => statusMutation.mutate('Published')}
                disabled={statusMutation.isPending}
                className="inline-flex items-center px-4 h-9 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {statusMutation.isPending ? 'Publishing...' : 'Publish'}
              </button>
            </>
          }
        >
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-left">
            <p className="text-sm font-semibold text-neutral-900 mb-1">{rfp.title}</p>
            <p className="text-sm text-neutral-500 mb-1.5">{rfp.shortDescription}</p>
            {subtitle && <p className="text-xs text-neutral-400">{subtitle}</p>}
          </div>
          {statusMutation.isError && (
            <p className="mt-3 text-sm text-status-danger-text text-center">
              {getErrorMessage(statusMutation.error, 'Failed to publish this RFP. Please try again.')}
            </p>
          )}
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal
          tone="danger"
          icon={<TrashIcon />}
          title="Delete this RFP?"
          description={deleteDescription}
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
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
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
              {getErrorMessage(deleteMutation.error, 'Failed to delete this RFP. Please try again.')}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
