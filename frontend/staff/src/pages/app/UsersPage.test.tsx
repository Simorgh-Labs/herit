import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import UsersPage, { guardDelete } from './UsersPage';
import {
  createOrganisationAdmin,
  createStaffUser,
  deleteOrganisationAdmin,
  deleteStaffUser,
  listUsers,
  updateStaffUser,
} from '../../api/users';
import { listOrganisations } from '../../api/organisations';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { Organisation, User } from '../../types';

vi.mock('../../api/users', () => ({
  listUsers: vi.fn(),
  getCurrentUser: vi.fn(),
  createStaffUser: vi.fn(),
  createOrganisationAdmin: vi.fn(),
  updateStaffUser: vi.fn(),
  deleteStaffUser: vi.fn(),
  deleteOrganisationAdmin: vi.fn(),
}));
vi.mock('../../api/organisations', () => ({
  listOrganisations: vi.fn(),
}));
vi.mock('../../hooks/useCurrentUser', () => ({ useCurrentUser: vi.fn() }));

const mockListUsers = vi.mocked(listUsers);
const mockListOrganisations = vi.mocked(listOrganisations);
const mockUseCurrentUser = vi.mocked(useCurrentUser);
const mockCreateStaffUser = vi.mocked(createStaffUser);
const mockCreateOrganisationAdmin = vi.mocked(createOrganisationAdmin);
const mockUpdateStaffUser = vi.mocked(updateStaffUser);
const mockDeleteStaffUser = vi.mocked(deleteStaffUser);
const mockDeleteOrganisationAdmin = vi.mocked(deleteOrganisationAdmin);

const adminUser: User = { id: 'u1', email: 'amara@example.com', fullName: 'Amara Chen', role: 'SuperAdmin' };
const staffUser: User = { id: 'u2', email: 'jonas@example.com', fullName: 'Jonas Weber', role: 'Staff' };

const organisations: Organisation[] = [{ id: 'health', name: 'Ministry of Health' }];

function usersFixture(): User[] {
  return [
    adminUser,
    { id: 'u3', email: 'marcus@example.com', fullName: 'Marcus Ade', role: 'Staff', organisationId: 'health' },
    { id: 'u4', email: 'nadia@example.com', fullName: 'Nadia Osei', role: 'OrganisationAdmin', organisationId: 'health' },
    { id: 'u5', email: 'expat@example.com', fullName: 'Expat User', role: 'Expat' },
    { id: 'u6', email: 'priya@example.com', fullName: 'Priya Nair', role: 'OrganisationAdmin', organisationId: 'health' },
  ];
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/users']}>
        <UsersPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function axiosErrorWithStatus(status: number, detail: string): AxiosError {
  return new AxiosError('Request failed', String(status), undefined, undefined, {
    status,
    statusText: 'Error',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
    data: { detail },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseCurrentUser.mockReturnValue({
    user: adminUser,
    isLoading: false,
    error: null,
    isNotFound: false,
  });
  mockListOrganisations.mockResolvedValue(organisations);
});

describe('UsersPage', () => {
  it('denies access to non-admin staff', async () => {
    mockUseCurrentUser.mockReturnValue({ user: staffUser, isLoading: false, error: null, isNotFound: false });
    mockListUsers.mockResolvedValue(usersFixture());
    renderPage();

    expect(screen.getByText(/don't have access/i)).toBeInTheDocument();
    expect(screen.queryByText('Marcus Ade')).not.toBeInTheDocument();
  });

  it('lists every user with role badge and resolved organisation name', async () => {
    mockListUsers.mockResolvedValue(usersFixture());
    renderPage();

    await screen.findByText('Marcus Ade');
    expect(screen.getByText('Nadia Osei')).toBeInTheDocument();
    expect(screen.getByText('Expat User')).toBeInTheDocument();
    expect(screen.getByText('(you)')).toBeInTheDocument();
  });

  it('filters the list client-side by the role tabs', async () => {
    const user = userEvent.setup();
    mockListUsers.mockResolvedValue(usersFixture());
    renderPage();

    await screen.findByText('Marcus Ade');
    await user.click(screen.getByRole('button', { name: 'Staff' }));

    expect(screen.getByText('Marcus Ade')).toBeInTheDocument();
    expect(screen.queryByText('Nadia Osei')).not.toBeInTheDocument();
    expect(screen.queryByText('Expat User')).not.toBeInTheDocument();
  });

  it('shows row actions gated by role, with an info note for org admins and read-only for expats', async () => {
    mockListUsers.mockResolvedValue(usersFixture());
    renderPage();

    await screen.findByText('Marcus Ade');

    const staffRow = screen.getByText('Marcus Ade').closest('div.grid') as HTMLElement;
    expect(within(staffRow).getByTitle('Edit')).toBeInTheDocument();
    expect(within(staffRow).getByTitle('Delete')).toBeInTheDocument();

    const orgAdminRow = screen.getByText('Nadia Osei').closest('div.grid') as HTMLElement;
    expect(within(orgAdminRow).queryByTitle('Edit')).not.toBeInTheDocument();
    expect(within(orgAdminRow).getByTitle('Delete')).toBeInTheDocument();
    expect(within(orgAdminRow).getByTitle(/no update endpoint/i)).toBeInTheDocument();

    const expatRow = screen.getByText('Expat User').closest('div.grid') as HTMLElement;
    expect(within(expatRow).getByText('Read-only')).toBeInTheDocument();
    expect(within(expatRow).queryByTitle('Delete')).not.toBeInTheDocument();

    const ownRow = screen.getByText('Amara Chen').closest('div.grid') as HTMLElement;
    expect(within(ownRow).queryByTitle('Delete')).not.toBeInTheDocument();
  });

  it('creates a staff user via the create-staff form', async () => {
    const user = userEvent.setup();
    mockListUsers.mockResolvedValue(usersFixture());
    mockCreateStaffUser.mockResolvedValue('new-id');
    renderPage();

    await screen.findByText('Marcus Ade');
    await user.click(screen.getByRole('button', { name: /create staff/i }));

    const dialog = screen.getByRole('dialog', { name: 'Create staff user' });
    expect(within(dialog).getByText(/must match the identity/i)).toBeInTheDocument();
    await user.type(within(dialog).getByPlaceholderText('Work email'), 'new.staff@herit.gov');
    await user.type(within(dialog).getByPlaceholderText('Full name'), 'New Staff');
    await user.selectOptions(within(dialog).getByRole('combobox'), 'health');
    await user.click(within(dialog).getByRole('button', { name: 'Create staff user' }));

    await waitFor(() =>
      expect(mockCreateStaffUser).toHaveBeenCalledWith({
        email: 'new.staff@herit.gov',
        fullName: 'New Staff',
        organisationId: 'health',
      }),
    );
  });

  it('creates an organisation admin via the create-org-admin form', async () => {
    const user = userEvent.setup();
    mockListUsers.mockResolvedValue(usersFixture());
    mockCreateOrganisationAdmin.mockResolvedValue('new-id');
    renderPage();

    await screen.findByText('Marcus Ade');
    await user.click(screen.getByRole('button', { name: /create org admin/i }));

    const dialog = screen.getByRole('dialog', { name: 'Create organisation admin' });
    await user.type(within(dialog).getByPlaceholderText('Work email'), 'new.admin@herit.gov');
    await user.type(within(dialog).getByPlaceholderText('Full name'), 'New Admin');
    await user.selectOptions(within(dialog).getByRole('combobox'), 'health');
    await user.click(within(dialog).getByRole('button', { name: 'Create org admin' }));

    await waitFor(() =>
      expect(mockCreateOrganisationAdmin).toHaveBeenCalledWith({
        email: 'new.admin@herit.gov',
        fullName: 'New Admin',
        organisationId: 'health',
      }),
    );
  });

  it('edits a staff user via the edit form (email and full name only)', async () => {
    const user = userEvent.setup();
    mockListUsers.mockResolvedValue(usersFixture());
    mockUpdateStaffUser.mockResolvedValue(undefined);
    renderPage();

    await screen.findByText('Marcus Ade');
    const staffRow = screen.getByText('Marcus Ade').closest('div.grid') as HTMLElement;
    await user.click(within(staffRow).getByTitle('Edit'));

    const dialog = screen.getByRole('dialog', { name: 'Edit staff user' });
    expect(within(dialog).queryByRole('combobox')).not.toBeInTheDocument();
    const emailInput = within(dialog).getByDisplayValue('marcus@example.com');
    await user.clear(emailInput);
    await user.type(emailInput, 'marcus.new@example.com');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(mockUpdateStaffUser).toHaveBeenCalledWith('u3', {
        email: 'marcus.new@example.com',
        fullName: 'Marcus Ade',
      }),
    );
  });

  it('gates delete on the checkbox and calls the staff delete endpoint', async () => {
    const user = userEvent.setup();
    mockListUsers.mockResolvedValue(usersFixture());
    mockDeleteStaffUser.mockResolvedValue(undefined);
    renderPage();

    await screen.findByText('Marcus Ade');
    const staffRow = screen.getByText('Marcus Ade').closest('div.grid') as HTMLElement;
    await user.click(within(staffRow).getByTitle('Delete'));

    const dialog = screen.getByRole('dialog', { name: 'Delete Marcus Ade?' });
    const confirmButton = within(dialog).getByRole('button', { name: 'Delete user' });
    expect(confirmButton).toBeDisabled();

    await user.click(within(dialog).getByRole('checkbox'));
    expect(confirmButton).toBeEnabled();

    await user.click(confirmButton);
    await waitFor(() => expect(mockDeleteStaffUser).toHaveBeenCalledWith('u3'));
    expect(mockDeleteOrganisationAdmin).not.toHaveBeenCalled();
  });

  it('calls the organisation-admin delete endpoint for org admin rows', async () => {
    const user = userEvent.setup();
    mockListUsers.mockResolvedValue(usersFixture());
    mockDeleteOrganisationAdmin.mockResolvedValue(undefined);
    renderPage();

    await screen.findByText('Nadia Osei');
    const orgAdminRow = screen.getByText('Nadia Osei').closest('div.grid') as HTMLElement;
    await user.click(within(orgAdminRow).getByTitle('Delete'));

    const dialog = screen.getByRole('dialog', { name: 'Delete Nadia Osei?' });
    await user.click(within(dialog).getByRole('checkbox'));
    await user.click(within(dialog).getByRole('button', { name: 'Delete user' }));

    await waitFor(() => expect(mockDeleteOrganisationAdmin).toHaveBeenCalledWith('u4'));
    expect(mockDeleteStaffUser).not.toHaveBeenCalled();
  });

  it('client-side blocks deleting the last organisation admin before any request', async () => {
    const user = userEvent.setup();
    const users = usersFixture().filter((u) => u.id !== 'u6'); // only Nadia remains as OrganisationAdmin
    mockListUsers.mockResolvedValue(users);
    renderPage();

    await screen.findByText('Nadia Osei');
    const orgAdminRow = screen.getByText('Nadia Osei').closest('div.grid') as HTMLElement;
    await user.click(within(orgAdminRow).getByTitle('Delete'));

    const dialog = screen.getByRole('dialog', { name: "Can't delete Nadia Osei" });
    expect(within(dialog).getByText(/last remaining organisation admin/i)).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Delete user' })).not.toBeInTheDocument();

    expect(mockDeleteOrganisationAdmin).not.toHaveBeenCalled();
    expect(mockDeleteStaffUser).not.toHaveBeenCalled();
  });

  it('hides the delete action on the signed-in user\'s own row (first line of the self-delete guard)', async () => {
    mockListUsers.mockResolvedValue(usersFixture());
    renderPage();

    await screen.findByText('Amara Chen');
    const ownRow = screen.getByText('Amara Chen').closest('div.grid') as HTMLElement;
    expect(within(ownRow).queryByTitle('Delete')).not.toBeInTheDocument();
  });

  it('guardDelete blocks self-delete and last-org-admin delete before any request is made', () => {
    const users = usersFixture();
    const staffTarget = users.find((u) => u.id === 'u3')!;
    const orgAdminTarget = users.find((u) => u.id === 'u4')!;

    // Self-delete: blocked regardless of role, using the current user's own id.
    expect(guardDelete(staffTarget, staffTarget.id, users)).toMatch(/currently signed in as/i);

    // Last remaining OrganisationAdmin: blocked when only one exists.
    const singleAdminUsers = users.filter((u) => u.role !== 'OrganisationAdmin' || u.id === orgAdminTarget.id);
    expect(guardDelete(orgAdminTarget, 'someone-else', singleAdminUsers)).toMatch(/last remaining organisation admin/i);

    // Not blocked: a non-self staff delete with other admins present.
    expect(guardDelete(staffTarget, 'someone-else', users)).toBeNull();

    // Not blocked: an org admin delete when another org admin remains (fixture has two).
    expect(guardDelete(orgAdminTarget, 'someone-else', users)).toBeNull();
  });

  it('surfaces the server 403 self-delete response as a backstop error message', async () => {
    const user = userEvent.setup();
    mockListUsers.mockResolvedValue(usersFixture());
    mockDeleteStaffUser.mockRejectedValue(axiosErrorWithStatus(403, 'You cannot delete your own account.'));
    renderPage();

    await screen.findByText('Marcus Ade');
    const staffRow = screen.getByText('Marcus Ade').closest('div.grid') as HTMLElement;
    await user.click(within(staffRow).getByTitle('Delete'));

    const dialog = screen.getByRole('dialog', { name: 'Delete Marcus Ade?' });
    await user.click(within(dialog).getByRole('checkbox'));
    await user.click(within(dialog).getByRole('button', { name: 'Delete user' }));

    await waitFor(() => expect(screen.getByText('You cannot delete your own account.')).toBeInTheDocument());
  });

  it('surfaces the server 409 last-admin response as a backstop error message', async () => {
    const user = userEvent.setup();
    mockListUsers.mockResolvedValue(usersFixture());
    mockDeleteOrganisationAdmin.mockRejectedValue(
      axiosErrorWithStatus(409, 'The last remaining OrganisationAdmin cannot be deleted.'),
    );
    renderPage();

    await screen.findByText('Nadia Osei');
    const orgAdminRow = screen.getByText('Nadia Osei').closest('div.grid') as HTMLElement;
    await user.click(within(orgAdminRow).getByTitle('Delete'));

    const dialog = screen.getByRole('dialog', { name: 'Delete Nadia Osei?' });
    await user.click(within(dialog).getByRole('checkbox'));
    await user.click(within(dialog).getByRole('button', { name: 'Delete user' }));

    await waitFor(() =>
      expect(screen.getByText('The last remaining OrganisationAdmin cannot be deleted.')).toBeInTheDocument(),
    );
  });
});
