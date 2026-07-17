import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProposalsPage from './ProposalsPage';
import { listProposals } from '../../api/proposals';
import type { Proposal } from '../../types';

vi.mock('../../api/proposals', () => ({ listProposals: vi.fn() }));

const mockListProposals = vi.mocked(listProposals);

const proposals: Proposal[] = [
  {
    id: '1',
    title: 'Community Health Outreach Expansion',
    shortDescription: '',
    longDescription: '',
    status: 'Submitted',
    visibility: 'Public',
    authorId: 'u1',
    authorName: 'Amara Chen',
    organisationId: 'o1',
    organisationName: 'Ministry of Health',
  },
  {
    id: '2',
    title: 'Youth Coding Bootcamp',
    shortDescription: '',
    longDescription: '',
    status: 'Submitted',
    visibility: 'Private',
    authorId: 'u2',
    authorName: 'Sara Osei',
    organisationId: 'o2',
    organisationName: 'Ministry of Education',
  },
  {
    id: '3',
    title: 'Diaspora Mentorship Network',
    shortDescription: '',
    longDescription: '',
    status: 'UnderReview',
    visibility: 'Shared',
    authorId: 'u1',
    authorName: 'Amara Chen',
    organisationId: 'o2',
    organisationName: 'Ministry of Education',
  },
  {
    id: '4',
    title: 'Digital Literacy for Elders',
    shortDescription: '',
    longDescription: '',
    status: 'Approved',
    visibility: 'Public',
    authorId: 'u1',
    authorName: 'Amara Chen',
    organisationId: 'o1',
    organisationName: 'Ministry of Health',
  },
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
});

describe('ProposalsPage', () => {
  it('defaults to the Submitted tab and lists matching proposals with author and org names', async () => {
    renderPage();

    expect(await screen.findByText('Community Health Outreach Expansion')).toBeInTheDocument();
    expect(screen.getByText('Youth Coding Bootcamp')).toBeInTheDocument();
    expect(screen.queryByText('Diaspora Mentorship Network')).not.toBeInTheDocument();
    expect(screen.getAllByText('Amara Chen').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ministry of Health').length).toBeGreaterThan(0);
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
