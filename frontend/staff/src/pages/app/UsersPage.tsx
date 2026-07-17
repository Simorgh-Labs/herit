import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listOrganisations } from '../../api/organisations';
import {
  createOrganisationAdmin,
  createStaffUser,
  deleteOrganisationAdmin,
  deleteStaffUser,
  listUsers,
  updateStaffUser,
} from '../../api/users';
import { getErrorMessage } from '../../api/errors';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { isAdminRole, roleLabel } from '../../types';
import type { User, UserRole } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';

type RoleTab = 'All' | UserRole;

const ROLE_TABS: RoleTab[] = ['All', 'Staff', 'OrganisationAdmin', 'SuperAdmin', 'Expat'];

function tabLabel(tab: RoleTab): string {
  return tab === 'All' ? 'All' : roleLabel(tab);
}

const PlusIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const UserPlusIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18 7.5v6m3-3h-6M6 21v-2a4 4 0 014-4h1m5-8a4 4 0 11-8 0 4 4 0 018 0z"
    />
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

const PenLargeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const TrashSmallIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9.5 4h5a1 1 0 011 1v2h-7V5a1 1 0 011-1z"
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

const InfoIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v3.75m0 3.75h.007M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

/** The account this person signs in with through Entra — no JIT registration (ADR-015). */
const EMAIL_HELP_TEXT = "Must match the identity this person signs in with through Entra.";

interface OrgOption {
  readonly id: string;
  readonly label: string;
}

interface CreateUserModalProps {
  readonly title: string;
  readonly description: string;
  readonly submitLabel: string;
  readonly pendingLabel: string;
  readonly orgOptions: readonly OrgOption[];
  readonly isPending: boolean;
  readonly error: unknown;
  readonly onSubmit: (payload: { email: string; fullName: string; organisationId: string }) => void;
  readonly onClose: () => void;
}

function CreateUserModal({
  title,
  description,
  submitLabel,
  pendingLabel,
  orgOptions,
  isPending,
  error,
  onSubmit,
  onClose,
}: CreateUserModalProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [organisationId, setOrganisationId] = useState('');

  const trimmedEmail = email.trim();
  const trimmedName = fullName.trim();
  const canSubmit = !!trimmedEmail && !!trimmedName && !!organisationId;

  return (
    <Modal
      tone="neutral"
      icon={<UserPlusIcon />}
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
            onClick={() => onSubmit({ email: trimmedEmail, fullName: trimmedName, organisationId })}
            disabled={!canSubmit || isPending}
            className="inline-flex items-center px-4 h-9 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            {isPending ? pendingLabel : submitLabel}
          </button>
        </>
      }
    >
      <div className="pt-2 border-t border-neutral-200 flex flex-col gap-3.5">
        <div>
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Work email"
            className="w-full px-3.5 h-11 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-shadow"
          />
          <p className="mt-1.5 text-xs text-neutral-400 text-left">{EMAIL_HELP_TEXT}</p>
        </div>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          className="w-full px-3.5 h-11 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-shadow"
        />
        <select
          value={organisationId}
          onChange={(e) => setOrganisationId(e.target.value)}
          className="w-full px-3.5 h-11 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-shadow"
        >
          <option value="" disabled>
            Organisation
          </option>
          {orgOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error !== undefined && error !== null && (
        <p className="mt-3 text-sm text-status-danger-text text-center">
          {getErrorMessage(error, 'Something went wrong. Please try again.')}
        </p>
      )}
    </Modal>
  );
}

interface EditStaffModalProps {
  readonly user: User;
  readonly isPending: boolean;
  readonly error: unknown;
  readonly onSubmit: (payload: { email: string; fullName: string }) => void;
  readonly onClose: () => void;
}

function EditStaffModal({ user, isPending, error, onSubmit, onClose }: EditStaffModalProps) {
  const [email, setEmail] = useState(user.email);
  const [fullName, setFullName] = useState(user.fullName);

  const trimmedEmail = email.trim();
  const trimmedName = fullName.trim();
  const canSubmit = !!trimmedEmail && !!trimmedName;

  return (
    <Modal
      tone="neutral"
      icon={<PenLargeIcon />}
      title="Edit staff user"
      description={`Editing ${user.fullName}. Organisation isn't editable here — there's no update endpoint for reassigning a user's organisation; delete and recreate the account if it needs to move.`}
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
            onClick={() => onSubmit({ email: trimmedEmail, fullName: trimmedName })}
            disabled={!canSubmit || isPending}
            className="inline-flex items-center px-4 h-9 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            {isPending ? 'Saving...' : 'Save changes'}
          </button>
        </>
      }
    >
      <div className="pt-2 border-t border-neutral-200 flex flex-col gap-3.5">
        <div>
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Work email"
            className="w-full px-3.5 h-11 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-shadow"
          />
          <p className="mt-1.5 text-xs text-neutral-400 text-left">{EMAIL_HELP_TEXT}</p>
        </div>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
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

/**
 * Client-side delete guards, evaluated before any request goes out (per the design's
 * decided behaviour). Mirrors the server-side checks added in PR #288 — self-delete
 * (403) and last-remaining-OrganisationAdmin (409) — which still run as a backstop
 * for races this client check can't fully close.
 */
export function guardDelete(target: User, currentUserId: string, allUsers: readonly User[]): string | null {
  if (target.id === currentUserId) {
    return `${target.fullName} is the account you're currently signed in as. Have another admin remove this account instead.`;
  }
  if (target.role === 'OrganisationAdmin') {
    const remainingAdmins = allUsers.filter((u) => u.role === 'OrganisationAdmin').length;
    if (remainingAdmins <= 1) {
      return `${target.fullName} is the last remaining Organisation Admin. Promote another user to Organisation Admin before deleting this account.`;
    }
  }
  return null;
}

interface DeleteUserModalProps {
  readonly user: User;
  readonly guardReason: string | null;
  readonly isPending: boolean;
  readonly error: unknown;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

function DeleteUserModal({ user, guardReason, isPending, error, onConfirm, onClose }: DeleteUserModalProps) {
  const [checked, setChecked] = useState(false);

  if (guardReason) {
    return (
      <Modal
        tone="danger"
        icon={<TrashIcon />}
        title={`Can't delete ${user.fullName}`}
        description={guardReason}
        onClose={onClose}
        actions={
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 h-9 bg-neutral-0 border border-neutral-200 text-sm font-medium text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Close
          </button>
        }
      />
    );
  }

  return (
    <Modal
      tone="danger"
      icon={<TrashIcon />}
      title={`Delete ${user.fullName}?`}
      description="This permanently removes this person's platform access. Content they authored — RFPs, proposals — stays in place and keeps referencing their user id; it is not deleted or reassigned. This cannot be undone."
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
            onClick={onConfirm}
            disabled={!checked || isPending}
            className="inline-flex items-center px-4 h-9 bg-status-danger-text text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-60"
          >
            {isPending ? 'Deleting...' : 'Delete user'}
          </button>
        </>
      }
    >
      <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-neutral-200">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-brand"
        />
        <span className="text-sm text-neutral-700 text-left">I understand this cannot be undone.</span>
      </label>
      {error !== undefined && error !== null && (
        <p className="mt-3 text-sm text-status-danger-text text-center">
          {getErrorMessage(error, 'Something went wrong. Please try again.')}
        </p>
      )}
    </Modal>
  );
}

type ModalState =
  | { kind: 'createStaff' }
  | { kind: 'createOrgAdmin' }
  | { kind: 'editStaff'; user: User }
  | { kind: 'delete'; user: User }
  | null;

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useCurrentUser();
  const isAdmin = !!currentUser && isAdminRole(currentUser.role);

  const [roleTab, setRoleTab] = useState<RoleTab>('All');
  const [modal, setModal] = useState<ModalState>(null);

  const {
    data: users,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useQuery({ queryKey: ['users'], queryFn: listUsers, enabled: isAdmin });

  const { data: organisations } = useQuery({
    queryKey: ['organisations'],
    queryFn: listOrganisations,
    enabled: isAdmin,
  });

  const orgNameById = useMemo(
    () => Object.fromEntries((organisations ?? []).map((o) => [o.id, o.name])),
    [organisations],
  );

  const orgOptions: OrgOption[] = useMemo(
    () => (organisations ?? []).map((o) => ({ id: o.id, label: o.name })),
    [organisations],
  );

  const filtered = useMemo(() => {
    const all = users ?? [];
    return roleTab === 'All' ? all : all.filter((u) => u.role === roleTab);
  }, [users, roleTab]);

  const closeModal = () => {
    if (createStaffMutation.isPending || createOrgAdminMutation.isPending || editStaffMutation.isPending || deleteMutation.isPending) {
      return;
    }
    setModal(null);
    createStaffMutation.reset();
    createOrgAdminMutation.reset();
    editStaffMutation.reset();
    deleteMutation.reset();
  };

  const createStaffMutation = useMutation({
    mutationFn: (payload: { email: string; fullName: string; organisationId: string }) => createStaffUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setModal(null);
    },
  });

  const createOrgAdminMutation = useMutation({
    mutationFn: (payload: { email: string; fullName: string; organisationId: string }) =>
      createOrganisationAdmin(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setModal(null);
    },
  });

  const editStaffMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { email: string; fullName: string } }) =>
      updateStaffUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setModal(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (target: User) =>
      target.role === 'OrganisationAdmin' ? deleteOrganisationAdmin(target.id) : deleteStaffUser(target.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setModal(null);
    },
  });

  if (!isAdmin) {
    return (
      <div className="max-w-[1080px] mx-auto px-6 py-8">
        <p className="text-sm text-neutral-500">You don't have access to user management.</p>
      </div>
    );
  }

  const rowNote = (user: User): string | null => {
    if (user.role === 'Expat') return 'Read-only';
    if (user.role === 'SuperAdmin') return 'Read-only';
    return null;
  };

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8 pb-16">
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Users</h1>
          <p className="text-sm text-neutral-500 max-w-[560px]">
            Every user on the platform. Expats are listed read-only — they are managed by no one; they're visible
            because this endpoint returns all users.
          </p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={() => setModal({ kind: 'createStaff' })}
            className="inline-flex items-center gap-2 px-4 h-10 bg-neutral-0 border border-neutral-200 text-sm font-medium text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <PlusIcon /> Create staff
          </button>
          <button
            onClick={() => setModal({ kind: 'createOrgAdmin' })}
            className="inline-flex items-center gap-2 px-4 h-10 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
          >
            <PlusIcon /> Create org admin
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setRoleTab(tab)}
            className={`px-3 h-8 text-xs font-semibold rounded-full border transition-colors ${
              roleTab === tab
                ? 'bg-brand text-white border-brand'
                : 'bg-neutral-0 text-neutral-500 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            {tabLabel(tab)}
          </button>
        ))}
      </div>

      {isUsersLoading && <LoadingSpinner className="py-32" />}
      {isUsersError && (
        <div className="py-10 text-center text-sm text-status-danger-text">Failed to load users. Please try again.</div>
      )}

      {!isUsersLoading && !isUsersError && filtered.length === 0 && (
        <EmptyState
          title="No users found"
          description={roleTab === 'All' ? 'No users exist on the platform yet.' : `No ${tabLabel(roleTab)} users match this filter.`}
        />
      )}

      {!isUsersLoading && !isUsersError && filtered.length > 0 && (
        <div className="bg-neutral-0 border border-neutral-200 rounded-lg shadow-soft overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_1.2fr_1.6fr_1.4fr] gap-3 px-5 py-2.5 bg-neutral-50 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Organisation</span>
            <span className="text-right">Actions</span>
          </div>
          {filtered.map((user) => {
            const isYou = user.id === currentUser?.id;
            const canEdit = user.role === 'Staff';
            const canDelete = (user.role === 'Staff' || user.role === 'OrganisationAdmin') && !isYou;
            const note = rowNote(user);

            return (
              <div
                key={user.id}
                className="grid grid-cols-[2fr_2fr_1.2fr_1.6fr_1.4fr] gap-3 px-5 py-3.5 border-t border-neutral-200 items-center text-sm"
              >
                <span className="font-medium text-neutral-900 truncate">
                  {user.fullName}
                  {isYou && <span className="ml-1.5 font-normal text-neutral-400">(you)</span>}
                </span>
                <span className="text-neutral-500 truncate">{user.email}</span>
                <StatusBadge type="role" status={user.role} label={roleLabel(user.role)} />
                <span className="text-neutral-500 truncate">{user.organisationId ? (orgNameById[user.organisationId] ?? '—') : '—'}</span>
                <div className="flex items-center justify-end gap-1.5">
                  {canEdit && (
                    <button
                      onClick={() => setModal({ kind: 'editStaff', user })}
                      title="Edit"
                      className="w-7 h-7 rounded-md border border-neutral-200 bg-neutral-0 text-neutral-500 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                    >
                      <PenIcon />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setModal({ kind: 'delete', user })}
                      title="Delete"
                      className="w-7 h-7 rounded-md border border-neutral-200 bg-neutral-0 text-status-danger-text flex items-center justify-center hover:bg-neutral-50 transition-colors"
                    >
                      <TrashSmallIcon />
                    </button>
                  )}
                  {user.role === 'OrganisationAdmin' && (
                    <span
                      title="Org admins have no update endpoint — create/delete only"
                      className="text-neutral-400 cursor-help"
                    >
                      <InfoIcon />
                    </span>
                  )}
                  {note && <span className="text-xs text-neutral-400">{note}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal?.kind === 'createStaff' && (
        <CreateUserModal
          title="Create staff user"
          description="Provisions a Staff account. Staff can act on any RFP or proposal, platform-wide."
          submitLabel="Create staff user"
          pendingLabel="Creating..."
          orgOptions={orgOptions}
          isPending={createStaffMutation.isPending}
          error={createStaffMutation.error}
          onClose={closeModal}
          onSubmit={(payload) => createStaffMutation.mutate(payload)}
        />
      )}

      {modal?.kind === 'createOrgAdmin' && (
        <CreateUserModal
          title="Create organisation admin"
          description="Provisions an Organisation Admin account, scoped to the organisation below in name only — enforcement isn't org-scoped yet. Org admins can create and delete users, but have no edit action."
          submitLabel="Create org admin"
          pendingLabel="Creating..."
          orgOptions={orgOptions}
          isPending={createOrgAdminMutation.isPending}
          error={createOrgAdminMutation.error}
          onClose={closeModal}
          onSubmit={(payload) => createOrgAdminMutation.mutate(payload)}
        />
      )}

      {modal?.kind === 'editStaff' && (
        <EditStaffModal
          user={modal.user}
          isPending={editStaffMutation.isPending}
          error={editStaffMutation.error}
          onClose={closeModal}
          onSubmit={(payload) => editStaffMutation.mutate({ id: modal.user.id, payload })}
        />
      )}

      {modal?.kind === 'delete' && currentUser && (
        <DeleteUserModal
          user={modal.user}
          guardReason={guardDelete(modal.user, currentUser.id, users ?? [])}
          isPending={deleteMutation.isPending}
          error={deleteMutation.error}
          onClose={closeModal}
          onConfirm={() => deleteMutation.mutate(modal.user)}
        />
      )}
    </div>
  );
}
