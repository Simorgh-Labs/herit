import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UsersPage from './UsersPage';
import { listUsers } from '../../api/users';
import { listOrganisations } from '../../api/organisations';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { Organisation, User } from '../../types';

vi.mock('../../api/users', () => ({
  listUsers: vi.fn(),
  getCurrentUser: vi.fn(),
}));
vi.mock('../../api/organisations', () => ({
  listOrganisations: vi.fn(),
}));
vi.mock('../../hooks/useCurrentUser', () => ({ useCurrentUser: vi.fn() }));

const mockListUsers = vi.mocked(listUsers);
const mockListOrganisations = vi.mocked(listOrganisations);
const mockUseCurrentUser = vi.mocked(useCurrentUser);

const adminUser: User = { id: 'u1', email: 'amara@example.com', fullName: 'Amara Chen', role: 'SuperAdmin' };
const staffUser: User = { id: 'u2', email: 'jonas@example.com', fullName: 'Jonas Weber', role: 'Staff' };

const organisations: Organisation[] = [{ id: 'health', name: 'Ministry of Health' }];

const users: User[] = [
  adminUser,
  { id: 'u3', email: 'marcus@example.com', fullName: 'Marcus Ade', role: 'Staff', organisationId: 'health' },
  { id: 'u4', email: 'nadia@example.com', fullName: 'Nadia Osei', role: 'OrganisationAdmin', organisationId: 'health' },
  { id: 'u5', email: 'expat@example.com', fullName: 'Expat User', role: 'Expat' },
];

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
    mockListUsers.mockResolvedValue(users);
    renderPage();

    expect(screen.getByText(/don't have access/i)).toBeInTheDocument();
    expect(screen.queryByText('Marcus Ade')).not.toBeInTheDocument();
  });

  it('lists every user with role badge and resolved organisation name', async () => {
    mockListUsers.mockResolvedValue(users);
    renderPage();

    await screen.findByText('Marcus Ade');
    expect(screen.getByText('Nadia Osei')).toBeInTheDocument();
    expect(screen.getByText('Expat User')).toBeInTheDocument();
    expect(screen.getAllByText('Ministry of Health')).toHaveLength(2);
    expect(screen.getByText('(you)')).toBeInTheDocument();
  });

  it('filters the list client-side by the role tabs', async () => {
    const user = userEvent.setup();
    mockListUsers.mockResolvedValue(users);
    renderPage();

    await screen.findByText('Marcus Ade');
    await user.click(screen.getByRole('button', { name: 'Staff' }));

    expect(screen.getByText('Marcus Ade')).toBeInTheDocument();
    expect(screen.queryByText('Nadia Osei')).not.toBeInTheDocument();
    expect(screen.queryByText('Expat User')).not.toBeInTheDocument();
  });

  it('marks the current user delete-disabled and shows read-only affordances for expats', async () => {
    mockListUsers.mockResolvedValue(users);
    renderPage();

    await screen.findByText('Marcus Ade');

    const staffRow = screen.getByText('Marcus Ade').closest('div.grid') as HTMLElement;
    expect(within(staffRow).getAllByTitle(/#294/)).toHaveLength(2);

    const orgAdminRow = screen.getByText('Nadia Osei').closest('div.grid') as HTMLElement;
    expect(within(orgAdminRow).getByTitle(/no update endpoint/i)).toBeInTheDocument();

    const expatRow = screen.getByText('Expat User').closest('div.grid') as HTMLElement;
    expect(within(expatRow).getByText('Read-only')).toBeInTheDocument();

    const ownRow = screen.getByText('Amara Chen').closest('div.grid') as HTMLElement;
    expect(within(ownRow).queryAllByTitle(/#294/)).toHaveLength(0);
  });
});
