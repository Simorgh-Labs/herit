import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EoiListPage from './EoiListPage';
import { getCfeoiById } from '../../api/cfeois';
import { getProposalById } from '../../api/proposals';
import { deleteEoi, listEoisByCfeoi, updateEoiStatus } from '../../api/eois';
import type { Cfeoi, Eoi, Proposal } from '../../types';

vi.mock('../../api/cfeois', () => ({ getCfeoiById: vi.fn() }));
vi.mock('../../api/proposals', () => ({ getProposalById: vi.fn() }));
vi.mock('../../api/eois', () => ({
  listEoisByCfeoi: vi.fn(),
  updateEoiStatus: vi.fn(),
  deleteEoi: vi.fn(),
}));

const mockGetCfeoiById = vi.mocked(getCfeoiById);
const mockGetProposalById = vi.mocked(getProposalById);
const mockListEoisByCfeoi = vi.mocked(listEoisByCfeoi);
const mockUpdateEoiStatus = vi.mocked(updateEoiStatus);
const mockDeleteEoi = vi.mocked(deleteEoi);

const proposal: Proposal = {
  id: 'p1',
  title: 'Community Health Outreach Expansion',
  shortDescription: '',
  longDescription: '',
  status: 'UnderReview',
  visibility: 'Public',
  authorId: 'u1',
  organisationId: 'o1',
};

const cfeoi: Cfeoi = {
  id: 'c1',
  title: 'Program Coordinator',
  description: '',
  proposalId: 'p1',
  status: 'Open',
};

const eois: Eoi[] = [
  {
    id: 'e1',
    message: 'Pending applicant',
    status: 'Pending',
    visibility: 'Private',
    cfeoiId: 'c1',
    submittedById: 'u2',
    submitterName: 'Sara Osei',
    submitterEmail: 'sara@example.com',
  },
  {
    id: 'e2',
    message: 'Already approved',
    status: 'Approved',
    visibility: 'Shared',
    cfeoiId: 'c1',
    submittedById: 'u3',
    submitterName: 'Marcus Johnson',
    submitterEmail: 'marcus@example.com',
  },
];

function renderPage(cfeoiOverrides: Partial<Cfeoi> = {}, eoisOverride = eois) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  mockGetCfeoiById.mockResolvedValue({ ...cfeoi, ...cfeoiOverrides });
  mockGetProposalById.mockResolvedValue(proposal);
  mockListEoisByCfeoi.mockResolvedValue(eoisOverride);
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/proposals/p1/cfeois/c1/eois']}>
        <Routes>
          <Route path="/proposals/:proposalId/cfeois/:cfeoiId/eois" element={<EoiListPage />} />
          <Route path="/proposals/:id" element={<div>proposal detail</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('EoiListPage', () => {
  it('lists EOIs with submitter name, email, visibility and status', async () => {
    renderPage();

    await screen.findByText('Sara Osei');
    expect(screen.getByText('sara@example.com')).toBeInTheDocument();
    expect(screen.getByText('Marcus Johnson')).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.getByText('Shared')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('shows Approve/Reject only on Pending rows and calls the status endpoint', async () => {
    const user = userEvent.setup();
    mockUpdateEoiStatus.mockResolvedValue(undefined);
    renderPage();

    await screen.findByText('Sara Osei');
    expect(screen.getAllByTitle('Approve')).toHaveLength(1);
    expect(screen.getAllByTitle('Reject')).toHaveLength(1);

    await user.click(screen.getByTitle('Approve'));
    await waitFor(() => expect(mockUpdateEoiStatus).toHaveBeenCalledWith('e1', 'Approved'));
  });

  it('shows the closed-CFEOI banner when the CFEOI is closed', async () => {
    renderPage({ status: 'Closed' });

    expect(await screen.findByText(/This CFEOI is now closed/)).toBeInTheDocument();
  });

  it('includes the Private-EOI footnote', async () => {
    renderPage();

    await screen.findByText('Sara Osei');
    expect(
      screen.getByText(/visibility rules restrict other expats, not staff review, by design/),
    ).toBeInTheDocument();
  });

  it('gates delete on the checkbox and calls the delete endpoint', async () => {
    const user = userEvent.setup();
    mockDeleteEoi.mockResolvedValue(undefined);
    renderPage();

    await screen.findByText('Sara Osei');
    const deleteButtons = screen.getAllByTitle('Delete (staff only)');
    await user.click(deleteButtons[0]);

    const dialog = screen.getByRole('dialog', { name: 'Delete this expression of interest?' });
    expect(within(dialog).getByText(/Sara Osei's submission/)).toBeInTheDocument();

    const confirmButton = within(dialog).getByRole('button', { name: 'Delete permanently' });
    expect(confirmButton).toBeDisabled();

    await user.click(within(dialog).getByRole('checkbox'));
    expect(confirmButton).toBeEnabled();

    await user.click(confirmButton);
    await waitFor(() => expect(mockDeleteEoi).toHaveBeenCalledWith('e1'));
  });
});
