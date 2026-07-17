import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from './DashboardPage';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { listRfps } from '../../api/rfps';
import { listProposals } from '../../api/proposals';
import { listOrganisations } from '../../api/organisations';
import { listUsers } from '../../api/users';
import type { Organisation, Proposal, Rfp, User } from '../../types';

vi.mock('../../hooks/useCurrentUser', () => ({ useCurrentUser: vi.fn() }));
vi.mock('../../api/rfps', () => ({ listRfps: vi.fn() }));
vi.mock('../../api/proposals', () => ({ listProposals: vi.fn() }));
vi.mock('../../api/organisations', () => ({ listOrganisations: vi.fn() }));
vi.mock('../../api/users', () => ({ listUsers: vi.fn(), getCurrentUser: vi.fn() }));

const mockUseCurrentUser = vi.mocked(useCurrentUser);
const mockListRfps = vi.mocked(listRfps);
const mockListProposals = vi.mocked(listProposals);
const mockListOrganisations = vi.mocked(listOrganisations);
const mockListUsers = vi.mocked(listUsers);

const rfps: Rfp[] = [
  { id: '1', title: 'a', shortDescription: '', longDescription: '', status: 'Draft', organisationId: 'o1', organisationName: 'Org One', authorId: 'u1', authorName: 'Staff One' },
  { id: '2', title: 'b', shortDescription: '', longDescription: '', status: 'Draft', organisationId: 'o1', organisationName: 'Org One', authorId: 'u1', authorName: 'Staff One' },
  { id: '3', title: 'c', shortDescription: '', longDescription: '', status: 'Approved', organisationId: 'o1', organisationName: 'Org One', authorId: 'u1', authorName: 'Staff One' },
  { id: '4', title: 'd', shortDescription: '', longDescription: '', status: 'Published', organisationId: 'o1', organisationName: 'Org One', authorId: 'u1', authorName: 'Staff One' },
];

const proposals: Proposal[] = [
  { id: '1', title: 'a', shortDescription: '', longDescription: '', status: 'Submitted', authorId: 'u1', authorName: 'Staff One', organisationId: 'o1', organisationName: 'Org One' },
  { id: '2', title: 'b', shortDescription: '', longDescription: '', status: 'UnderReview', authorId: 'u1', authorName: 'Staff One', organisationId: 'o1', organisationName: 'Org One' },
  { id: '3', title: 'c', shortDescription: '', longDescription: '', status: 'UnderReview', authorId: 'u1', authorName: 'Staff One', organisationId: 'o1', organisationName: 'Org One' },
  { id: '4', title: 'd', shortDescription: '', longDescription: '', status: 'Approved', authorId: 'u1', authorName: 'Staff One', organisationId: 'o1', organisationName: 'Org One' },
];

const organisations: Organisation[] = [{ id: 'o1', name: 'Org One' }, { id: 'o2', name: 'Org Two' }];

const users: User[] = [
  { id: 'u1', email: 'staff@a.com', fullName: 'Staff One', role: 'Staff' },
  { id: 'u2', email: 'admin@a.com', fullName: 'Admin One', role: 'SuperAdmin' },
  { id: 'u3', email: 'expat@a.com', fullName: 'Expat One', role: 'Expat' },
];

function renderDashboard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mockListRfps.mockResolvedValue(rfps);
  mockListProposals.mockResolvedValue(proposals);
  mockListOrganisations.mockResolvedValue(organisations);
  mockListUsers.mockResolvedValue(users);
});

describe('DashboardPage', () => {
  it('computes RFP and proposal counts for a Staff user and hides the admin section', async () => {
    const user: User = { id: 'u1', email: 'staff@a.com', fullName: 'Staff One', role: 'Staff' };
    mockUseCurrentUser.mockReturnValue({ user, isLoading: false, error: null, isNotFound: false });

    renderDashboard();

    expect(await screen.findByText('Welcome back, Staff One')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Draft').previousSibling?.textContent).toBe('2'));
    expect(screen.getByText('Approved').previousSibling?.textContent).toBe('1');
    expect(screen.getByText('Published').previousSibling?.textContent).toBe('1');
    expect(screen.getByText('Submitted').previousSibling?.textContent).toBe('1');
    expect(screen.getByText('Under Review').previousSibling?.textContent).toBe('2');

    expect(screen.queryByText('Organisations & users')).not.toBeInTheDocument();
    expect(mockListOrganisations).not.toHaveBeenCalled();
    expect(mockListUsers).not.toHaveBeenCalled();
  });

  it('shows the admin section with organisation and staff/admin counts for an admin role', async () => {
    const user: User = { id: 'u2', email: 'admin@a.com', fullName: 'Admin One', role: 'SuperAdmin' };
    mockUseCurrentUser.mockReturnValue({ user, isLoading: false, error: null, isNotFound: false });

    renderDashboard();

    await waitFor(() => expect(screen.getByText('Organisations').previousSibling?.textContent).toBe('2'));
    // Staff & admins excludes the Expat user in the fixture.
    expect(screen.getByText('Staff & admins').previousSibling?.textContent).toBe('2');
  });
});
