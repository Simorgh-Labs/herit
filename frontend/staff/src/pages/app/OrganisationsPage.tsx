import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { createOrganisation, deleteOrganisation, listOrganisations, updateOrganisation } from '../../api/organisations';
import { getErrorMessage } from '../../api/errors';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { isAdminRole } from '../../types';
import type { Organisation } from '../../types';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

const INDENT_PER_LEVEL = 28;
const BASE_INDENT = 16;

interface TreeNode extends Organisation {
  depth: number;
}

function buildTree(organisations: Organisation[]): TreeNode[] {
  const byParent = new Map<string | undefined, Organisation[]>();
  for (const org of organisations) {
    const key = org.parentId;
    const siblings = byParent.get(key) ?? [];
    siblings.push(org);
    byParent.set(key, siblings);
  }
  for (const siblings of byParent.values()) siblings.sort((a, b) => a.name.localeCompare(b.name));

  const result: TreeNode[] = [];
  const visit = (parentId: string | undefined, depth: number) => {
    for (const org of byParent.get(parentId) ?? []) {
      result.push({ ...org, depth });
      visit(org.id, depth + 1);
    }
  };
  visit(undefined, 0);
  return result;
}

type ModalState =
  | { kind: 'create'; parent: Organisation | null }
  | { kind: 'rename'; org: Organisation }
  | { kind: 'delete'; org: Organisation }
  | null;

const BuildingIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1"
    />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const PenIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
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

const AlertIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 4.5c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    />
  </svg>
);

function TrashSmallIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9.5 4h5a1 1 0 011 1v2h-7V5a1 1 0 011-1z"
      />
    </svg>
  );
}

function isConflict(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 409;
}

interface NameModalProps {
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly description: string;
  readonly initialName: string;
  readonly submitLabel: string;
  readonly pendingLabel: string;
  readonly isPending: boolean;
  readonly error: unknown;
  readonly onSubmit: (name: string) => void;
  readonly onClose: () => void;
}

function NameModal({
  icon,
  title,
  description,
  initialName,
  submitLabel,
  pendingLabel,
  isPending,
  error,
  onSubmit,
  onClose,
}: NameModalProps) {
  const [name, setName] = useState(initialName);
  const trimmed = name.trim();

  return (
    <Modal
      tone="neutral"
      icon={icon}
      title={title}
      description={description}
      onClose={onClose}
      actions={
        <>
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 h-9 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(trimmed)}
            disabled={!trimmed || isPending}
            className="inline-flex items-center px-4 h-9 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            {isPending ? pendingLabel : submitLabel}
          </button>
        </>
      }
    >
      <div className="pt-2 border-t border-neutral-200">
        <input
          type="text"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Organisation name"
          className="w-full px-3.5 h-11 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-shadow"
        />
      </div>
      {error !== undefined && error !== null && (
        <p className="mt-3 text-sm text-status-danger-text text-center">
          {getErrorMessage(error, 'Something went wrong. Please try again.')}
        </p>
      )}
    </Modal>
  );
}

export default function OrganisationsPage() {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const isAdmin = !!user && isAdminRole(user.role);

  const [modal, setModal] = useState<ModalState>(null);
  const [deleteChecked, setDeleteChecked] = useState(false);

  const {
    data: organisations,
    isLoading,
    isError,
  } = useQuery({ queryKey: ['organisations'], queryFn: listOrganisations });

  const tree = useMemo(() => buildTree(organisations ?? []), [organisations]);
  const root = organisations?.find((o) => !o.parentId) ?? null;

  const closeModal = () => {
    if (createMutation.isPending || renameMutation.isPending || deleteMutation.isPending) return;
    setModal(null);
    setDeleteChecked(false);
    createMutation.reset();
    renameMutation.reset();
    deleteMutation.reset();
  };

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; parentId?: string }) => createOrganisation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisations'] });
      setModal(null);
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateOrganisation(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisations'] });
      setModal(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOrganisation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisations'] });
      setModal(null);
      setDeleteChecked(false);
    },
  });

  if (!isAdmin) {
    return (
      <div className="max-w-[1080px] mx-auto px-6 py-8">
        <p className="text-sm text-neutral-500">You don't have access to organisation management.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8 pb-16">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Organisations</h1>
          <p className="text-sm text-neutral-500">
            Single root hierarchy. This spans every organisation on the platform — there is no per-admin scoping yet.
          </p>
        </div>
        {!!organisations?.length && (
          <button
            onClick={() => setModal({ kind: 'create', parent: root })}
            className="shrink-0 inline-flex items-center gap-2 px-4 h-10 bg-neutral-0 border border-neutral-200 text-sm font-medium text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <PlusIcon /> Create sub-organisation
          </button>
        )}
      </div>

      {isLoading && <LoadingSpinner className="py-32" />}
      {isError && (
        <div className="py-10 text-center text-sm text-status-danger-text">
          Failed to load organisations. Please try again.
        </div>
      )}

      {!isLoading && !isError && organisations?.length === 0 && (
        <EmptyState
          title="No organisations yet"
          description="Create the root organisation to get started — Herit has a single root, and every other organisation nests underneath it."
          action={
            <button
              onClick={() => setModal({ kind: 'create', parent: null })}
              className="inline-flex items-center gap-2 px-4 h-10 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
            >
              <PlusIcon /> Create root organisation
            </button>
          }
        />
      )}

      {!isLoading && !isError && !!organisations?.length && (
        <div className="bg-neutral-0 border border-neutral-200 rounded-lg shadow-soft overflow-hidden">
          {tree.map((node) => (
            <div
              key={node.id}
              className="flex items-center gap-2.5 px-4 py-3 border-b border-neutral-200 last:border-b-0"
              style={{ paddingLeft: BASE_INDENT + node.depth * INDENT_PER_LEVEL }}
            >
              <span className="text-neutral-500">
                <BuildingIcon />
              </span>
              <span className="text-sm font-medium text-neutral-900">{node.name}</span>
              {node.depth === 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-status-info-bg text-status-info-text">
                  Root
                </span>
              )}
              <div className="ml-auto flex gap-1.5">
                <button
                  onClick={() => setModal({ kind: 'create', parent: node })}
                  title="Create sub-organisation"
                  className="w-7 h-7 rounded-md border border-neutral-200 bg-neutral-0 text-neutral-500 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                >
                  <PlusIcon />
                </button>
                <button
                  onClick={() => setModal({ kind: 'rename', org: node })}
                  title="Rename"
                  className="w-7 h-7 rounded-md border border-neutral-200 bg-neutral-0 text-neutral-500 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                >
                  <PenIcon />
                </button>
                <button
                  onClick={() => setModal({ kind: 'delete', org: node })}
                  title="Delete"
                  className="w-7 h-7 rounded-md border border-neutral-200 bg-neutral-0 text-status-danger-text flex items-center justify-center hover:bg-neutral-50 transition-colors"
                >
                  <TrashSmallIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal?.kind === 'create' && (
        <NameModal
          key={modal.parent?.id ?? 'root'}
          icon={<PlusIcon />}
          title={modal.parent ? 'Create sub-organisation' : 'Create root organisation'}
          description={
            modal.parent
              ? `Creating a sub-organisation under ${modal.parent.name}. It will appear nested one level below its parent in the tree.`
              : 'This becomes the single root of the hierarchy — every other organisation nests underneath it.'
          }
          initialName=""
          submitLabel="Create"
          pendingLabel="Creating..."
          isPending={createMutation.isPending}
          error={createMutation.error}
          onClose={closeModal}
          onSubmit={(name) => createMutation.mutate({ name, parentId: modal.parent?.id })}
        />
      )}

      {modal?.kind === 'rename' && (
        <NameModal
          key={modal.org.id}
          icon={<PenIcon />}
          title="Rename organisation"
          description={`Renaming ${modal.org.name}. This only changes the display name — its position in the hierarchy is unaffected.`}
          initialName={modal.org.name}
          submitLabel="Save"
          pendingLabel="Saving..."
          isPending={renameMutation.isPending}
          error={renameMutation.error}
          onClose={closeModal}
          onSubmit={(name) => renameMutation.mutate({ id: modal.org.id, name })}
        />
      )}

      {modal?.kind === 'delete' &&
        (isConflict(deleteMutation.error) ? (
          <Modal
            tone="danger"
            icon={<AlertIcon />}
            title={`Couldn't delete ${modal.org.name}`}
            description={getErrorMessage(
              deleteMutation.error,
              'This organisation still has attached records and cannot be deleted.',
            )}
            onClose={closeModal}
            actions={
              <button
                onClick={closeModal}
                className="inline-flex items-center px-4 h-9 bg-neutral-0 border border-neutral-200 text-sm font-medium text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Close
              </button>
            }
          />
        ) : (
          <Modal
            tone="danger"
            icon={<TrashIcon />}
            title={`Delete ${modal.org.name}?`}
            description="This permanently deletes the organisation. Organisations with attached users, child organisations, RFPs, or proposals cannot be deleted — move or remove those first. This action cannot be undone once it succeeds."
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
                  onClick={() => deleteMutation.mutate(modal.org.id)}
                  disabled={!deleteChecked || deleteMutation.isPending}
                  className="inline-flex items-center px-4 h-9 bg-status-danger-text text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-60"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete organisation'}
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
                I understand this cannot be undone.
              </span>
            </label>
          </Modal>
        ))}
    </div>
  );
}
