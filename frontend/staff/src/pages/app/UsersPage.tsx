import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listOrganisations } from '../../api/organisations';
import { listUsers } from '../../api/users';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { isAdminRole, roleLabel } from '../../types';
import type { User, UserRole } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

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

const COMING_SOON = 'Ships with the user forms — see issue #294';

export default function UsersPage() {
  const { user: currentUser } = useCurrentUser();
  const isAdmin = !!currentUser && isAdminRole(currentUser.role);

  const [roleTab, setRoleTab] = useState<RoleTab>('All');

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

  const filtered = useMemo(() => {
    const all = users ?? [];
    return roleTab === 'All' ? all : all.filter((u) => u.role === roleTab);
  }, [users, roleTab]);

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
            disabled
            title={COMING_SOON}
            className="inline-flex items-center gap-2 px-4 h-10 bg-neutral-0 border border-neutral-200 text-sm font-medium text-neutral-400 rounded-lg cursor-not-allowed"
          >
            <PlusIcon /> Create staff
          </button>
          <button
            disabled
            title={COMING_SOON}
            className="inline-flex items-center gap-2 px-4 h-10 bg-brand text-white text-sm font-medium rounded-lg opacity-50 cursor-not-allowed"
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
                      disabled
                      title={COMING_SOON}
                      className="w-7 h-7 rounded-md border border-neutral-200 bg-neutral-0 text-neutral-300 flex items-center justify-center cursor-not-allowed"
                    >
                      <PenIcon />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      disabled
                      title={COMING_SOON}
                      className="w-7 h-7 rounded-md border border-neutral-200 bg-neutral-0 text-status-danger-text/40 flex items-center justify-center cursor-not-allowed"
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
    </div>
  );
}
