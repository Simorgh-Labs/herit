import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProposalDetailPage from './ProposalDetailPage';
import { deleteProposal, getProposalById, updateProposalStatus } from '../../api/proposals';
import { listCfeois } from '../../api/cfeois';
import { listEoisByCfeoi } from '../../api/eois';
import { listOrganisations } from '../../api/organisations';
import { listUsers } from '../../api/users';
import { getRfpById } from '../../api/rfps';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { Cfeoi, Eoi, Organisation, Proposal, Rfp, User } from '../../types';

vi.mock('../../api/proposals', () => ({
  getProposalById: vi.fn(),
  updateProposalStatus: vi.fn(),
  deleteProposal: vi.fn(),
}));
vi.mock('../../api/cfeois', () => ({ listCfeois: vi.fn() }));
vi.mock('../../api/eois', () => ({ listEoisByCfeoi: vi.fn() }));
vi.mock('../../api/organisations', () => ({ listOrganisations: vi.fn() }));
vi.mock('../../api/users', () => ({ listUsers: vi.fn() }));
vi.mock('../../api/rfps', () => ({ getRfpById: vi.fn() }));
vi.mock('../../hooks/useCurrentUser', () => ({ useCurrentUser: vi.fn() }));

const mockGetProposalById = vi.mocked(getProposalById);
const mockUpdateProposalStatus = vi.mocked(updateProposalStatus);
const mockDeleteProposal = vi.mocked(deleteProposal);
const mockListCfeois = vi.mocked(listCfeois);
const mockListEoisByCfeoi = vi.mocked(listEoisByCfeoi);
const mockListOrganisations = vi.mocked(listOrganisations);
const mockListUsers = vi.mocked(listUsers);
const mockGetRfpById = vi.mocked(getRfpById);
const mockUseCurrentUser = vi.mocked(useCurrentUser);

const organisations: Organisation[] = [{ id: 'o1', name: 'Ministry of Health' }];
const users: User[] = [{ id: 'u1', email: 'amara@example.com', fullName: 'Amara Chen', role: 'Expat' }];

const baseProposal: Proposal = {
  id: 'p1',
  title: 'Community Health Outreach Expansion',
  shortDescription: 'A short description.',
  longDescription: 'A long description.',
  status: 'Submitted',
  visibility: 'Public',
  authorId: 'u1',
  organisationId: 'o1',
};

const cfeois: Cfeoi[] = [
  { id: 'c1', title: 'Program Coordinator', description: '', proposalId: 'p1', status: 'Open' },
];

const eois: Eoi[] = [
  { id: 'e1', message: 'msg', status: 'Pending', cfeoiId: 'c1', submittedById: 'u2', submitterName: 'Sara Osei' },
];

function renderPage(proposal: Proposal, initialEntries = ['/proposals/p1']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  mockGetProposalById.mockResolvedValue(proposal);
  mockListOrganisations.mockResolvedValue(organisations);
  mockListUsers.mockResolvedValue(users);
  mockListCfeois.mockResolvedValue(cfeois);
  mockListEoisByCfeoi.mockResolvedValue(eois);
  mockGetRfpById.mockResolvedValue({ id: 'rfp1', title: 'Rural Clinics Modernisation' } as Rfp);
  mockUseCurrentUser.mockReturnValue({
    user: { id: 'staff-1', email: 'jonas@example.com', fullName: 'Jonas Weber', role: 'SuperAdmin' },
    isLoading: false,
    error: null,
    isNotFound: false,
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/proposals/:id" element={<ProposalDetailPage />} />
          <Route path="/proposals" element={<div>proposals queue</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProposalDetailPage — Submitted', () => {
  it('shows Start review and opens a bare confirm modal', async () => {
    const user = userEvent.setup();
    renderPage(baseProposal);

    await screen.findByText('Community Health Outreach Expansion');
    expect(screen.getByText('Amara Chen')).toBeInTheDocument();
    expect(screen.getByText('Program Coordinator')).toBeInTheDocument();
    expect(screen.getByText('1 EOIs')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Start review' }));
    expect(screen.getByRole('dialog', { name: 'Start review?' })).toBeInTheDocument();
  });

  it('calls the status endpoint with UnderReview when confirming', async () => {
    const user = userEvent.setup();
    mockUpdateProposalStatus.mockResolvedValue(undefined);
    renderPage(baseProposal);

    await user.click(await screen.findByRole('button', { name: 'Start review' }));
    const dialog = screen.getByRole('dialog', { name: 'Start review?' });
    await user.click(within(dialog).getByRole('button', { name: 'Start review' }));

    await waitFor(() => expect(mockUpdateProposalStatus).toHaveBeenCalledWith('p1', 'UnderReview'));
  });
});

describe('ProposalDetailPage — UnderReview', () => {
  it('shows Approve and calls the status endpoint with Approved', async () => {
    const user = userEvent.setup();
    mockUpdateProposalStatus.mockResolvedValue(undefined);
    renderPage({ ...baseProposal, status: 'UnderReview' });

    await user.click(await screen.findByRole('button', { name: 'Approve' }));
    const dialog = screen.getByRole('dialog', { name: 'Approve this proposal?' });
    await user.click(within(dialog).getByRole('button', { name: 'Approve' }));

    await waitFor(() => expect(mockUpdateProposalStatus).toHaveBeenCalledWith('p1', 'Approved'));
  });
});

describe('ProposalDetailPage — Approved', () => {
  it('shows the terminal notice with no transition actions', async () => {
    renderPage({ ...baseProposal, status: 'Approved' });

    expect(await screen.findByText(/completed the review lifecycle/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start review' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
  });
});

describe('ProposalDetailPage — takedown', () => {
  it('is available in every status, gates on the checkbox, and states the cascade', async () => {
    const user = userEvent.setup();
    renderPage(baseProposal);

    await user.click(await screen.findByRole('button', { name: 'Delete proposal' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete this proposal?' });
    expect(within(dialog).getByText(/its CFEOIs and their EOIs are permanently deleted/)).toBeInTheDocument();

    const confirmButton = within(dialog).getByRole('button', { name: 'Delete proposal' });
    expect(confirmButton).toBeDisabled();

    await user.click(within(dialog).getByRole('checkbox'));
    expect(confirmButton).toBeEnabled();
  });

  it('deletes and returns to the queue with a confirmation', async () => {
    const user = userEvent.setup();
    mockDeleteProposal.mockResolvedValue(undefined);
    renderPage(baseProposal);

    await user.click(await screen.findByRole('button', { name: 'Delete proposal' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete this proposal?' });
    await user.click(within(dialog).getByRole('checkbox'));
    await user.click(within(dialog).getByRole('button', { name: 'Delete proposal' }));

    await waitFor(() => expect(mockDeleteProposal).toHaveBeenCalledWith('p1'));
    expect(await screen.findByText('proposals queue')).toBeInTheDocument();
  });
});
