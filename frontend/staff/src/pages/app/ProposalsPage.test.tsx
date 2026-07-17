import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProposalsPage from './ProposalsPage';
import { listProposals } from '../../api/proposals';
import { listOrganisations } from '../../api/organisations';
import { listUsers } from '../../api/users';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { Organisation, Proposal, User } from '../../types';

vi.mock('../../api/proposals', () => ({ listProposals: vi.fn() }));
vi.mock('../../api/organisations', () => ({ listOrganisations: vi.fn() }));
vi.mock('../../api/users', () => ({ listUsers: vi.fn() }));
vi.mock('../../hooks/useCurrentUser', () => ({ useCurrentUser: vi.fn() }));

const mockListProposals = vi.mocked(listProposals);
const mockListOrganisations = vi.mocked(listOrganisations);
const mockListUsers = vi.mocked(listUsers);
const mockUseCurrentUser = vi.mocked(useCurrentUser);

const proposals: Proposal[] = [
  { id: '1', title: 'Community Health Outreach Expansion', shortDescription: '', longDescription: '', status: 'Submitted', visibility: 'Public', authorId: 'u1', organisationId: 'o1' },
  { id: '2', title: 'Youth Coding Bootcamp', shortDescription: '', longDescription: '', status: 'Submitted', visibility: 'Private', authorId: 'u2', organisationId: 'o2' },
  { id: '3', title: 'Diaspora Mentorship Network', shortDescription: '', longDescription: '', status: 'UnderReview', visibility: 'Shared', authorId: 'u1', organisationId: 'o2' },
  { id: '4', title: 'Digital Literacy for Elders', shortDescription: '', longDescription: '', status: 'Approved', visibility: 'Public', authorId: 'u1', organisationId: 'o1' },
];

const organisations: Organisation[] = [
  { id: 'o1', name: 'Ministry of Health' },
  { id: 'o2', name: 'Ministry of Education' },
];

const users: User[] = [
  { id: 'u1', email: 'amara@example.com', fullName: 'Amara Chen', role: 'Staff' },
  { id: 'u2', email: 'sara@example.com', fullName: 'Sara Osei', role: 'Staff' },
];

function renderPage(initialEntries = ['/proposals']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <ProposalsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockListProposals.mockResolvedValue(proposals);
  mockListOrganisations.mockResolvedValue(organisations);
  mockListUsers.mockResolvedValue(users);
  mockUseCurrentUser.mockReturnValue({
    user: { id: 'staff-1', email: 'jonas@example.com', fullName: 'Jonas Weber', role: 'SuperAdmin' },
    isLoading: false,
    error: null,
    isNotFound: false,
  });
});

describe('ProposalsPage', () => {
  it('defaults to the Submitted tab and lists matching proposals with author and org names', async () => {
    renderPage();

    expect(await screen.findByText('Community Health Outreach Expansion')).toBeInTheDocument();
    expect(screen.getByText('Youth Coding Bootcamp')).toBeInTheDocument();
    expect(screen.queryByText('Diaspora Mentorship Network')).not.toBeInTheDocument();
    expect(screen.getByText('Amara Chen')).toBeInTheDocument();
    expect(screen.getByText('Ministry of Health')).toBeInTheDocument();
  });

  it('respects a status query param and switches tabs on click', async () => {
    const user = userEvent.setup();
    renderPage(['/proposals?status=UnderReview']);

    expect(await screen.findByText('Diaspora Mentorship Network')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'All proposals' }));
    expect(await screen.findByText('Digital Literacy for Elders')).toBeInTheDocument();
    expect(
      screen.getByText(/Staff read-access spans every proposal regardless of visibility/),
    ).toBeInTheDocument();
  });

  it('falls back to a dash for the author when the user list is unavailable', async () => {
    mockUseCurrentUser.mockReturnValue({
      user: { id: 'staff-1', email: 'jonas@example.com', fullName: 'Jonas Weber', role: 'Staff' },
      isLoading: false,
      error: null,
      isNotFound: false,
    });
    renderPage();

    await screen.findByText('Community Health Outreach Expansion');
    expect(mockListUsers).not.toHaveBeenCalled();
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('shows an empty state when a status tab has no proposals', async () => {
    mockListProposals.mockResolvedValue([]);
    renderPage();

    await waitFor(() => expect(screen.getByText('Nothing submitted for review')).toBeInTheDocument());
  });

  it('links rows to the review detail page', async () => {
    renderPage();

    const row = await screen.findByText('Community Health Outreach Expansion');
    expect(row.closest('a')).toHaveAttribute('href', '/proposals/1');
  });
});
