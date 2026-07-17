import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RfpDetailPage from './RfpDetailPage';
import { deleteRfp, getRfpById, updateRfpStatus } from '../../api/rfps';
import type { Rfp } from '../../types';

vi.mock('../../api/rfps', () => ({
  getRfpById: vi.fn(),
  updateRfpStatus: vi.fn(),
  deleteRfp: vi.fn(),
}));

const mockGetRfpById = vi.mocked(getRfpById);
const mockUpdateRfpStatus = vi.mocked(updateRfpStatus);
const mockDeleteRfp = vi.mocked(deleteRfp);

const baseRfp: Rfp = {
  id: 'rfp-1',
  title: 'Digital ID Verification',
  shortDescription: 'A short description.',
  longDescription: 'A long description.',
  status: 'Draft',
  organisationId: 'o1',
  organisationName: 'Ministry of Digital Economy',
  authorId: 'u1',
  authorName: 'Amara Chen',
  tags: 'identity',
};

function renderPage(rfp: Rfp, initialEntries = ['/rfps/rfp-1']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  mockGetRfpById.mockResolvedValue(rfp);
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/rfps/:id" element={<RfpDetailPage />} />
          <Route path="/rfps" element={<div>rfps list</div>} />
          <Route path="/rfps/:id/edit" element={<div>editor page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('RfpDetailPage — Draft', () => {
  it('shows Edit/Approve/Delete actions and opens a bare confirm for Approve', async () => {
    const user = userEvent.setup();
    renderPage(baseRfp);

    await screen.findByText('Digital ID Verification');
    expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Approve' }));
    expect(screen.getByRole('dialog', { name: 'Approve this RFP?' })).toBeInTheDocument();
  });
});

describe('RfpDetailPage — status transitions', () => {
  it('calls the status endpoint with Approved when confirming approve', async () => {
    const user = userEvent.setup();
    mockUpdateRfpStatus.mockResolvedValue(undefined);
    renderPage(baseRfp);

    await user.click(await screen.findByRole('button', { name: 'Approve' }));
    const dialog = screen.getByRole('dialog', { name: 'Approve this RFP?' });
    await user.click(within(dialog).getByRole('button', { name: 'Approve' }));

    await waitFor(() => expect(mockUpdateRfpStatus).toHaveBeenCalledWith('rfp-1', 'Approved'));
  });

  it('shows the publish confirm-with-summary modal for Approved RFPs and calls the status endpoint', async () => {
    const user = userEvent.setup();
    mockUpdateRfpStatus.mockResolvedValue(undefined);
    renderPage({ ...baseRfp, status: 'Approved' });

    await user.click(await screen.findByRole('button', { name: 'Publish' }));
    const dialog = screen.getByRole('dialog', { name: 'Publish this RFP?' });
    expect(within(dialog).getByText('Digital ID Verification')).toBeInTheDocument();
    expect(within(dialog).getByText('A short description.')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Publish' }));
    await waitFor(() => expect(mockUpdateRfpStatus).toHaveBeenCalledWith('rfp-1', 'Published'));
  });

  it('surfaces a backend error message instead of a generic failure', async () => {
    const user = userEvent.setup();
    mockUpdateRfpStatus.mockRejectedValue({
      isAxiosError: true,
      response: { data: { detail: "You don't have permission to approve this RFP." } },
    });
    renderPage(baseRfp);

    await user.click(await screen.findByRole('button', { name: 'Approve' }));
    const dialog = screen.getByRole('dialog', { name: 'Approve this RFP?' });
    await user.click(within(dialog).getByRole('button', { name: 'Approve' }));

    expect(await screen.findByText("You don't have permission to approve this RFP.")).toBeInTheDocument();
  });
});

describe('RfpDetailPage — Published', () => {
  it('shows the live-on-portal indicator with a link and no Approve/Publish action', async () => {
    renderPage({ ...baseRfp, status: 'Published' });
    expect(await screen.findByText(/Live on the portal/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View public page' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument();
  });
});

describe('RfpDetailPage — delete', () => {
  it('requires the confirmation checkbox before enabling Delete and uses published copy', async () => {
    const user = userEvent.setup();
    renderPage({ ...baseRfp, status: 'Published' });

    await user.click(await screen.findByRole('button', { name: 'Delete' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete this RFP?' });
    expect(within(dialog).getByText(/removes it from the portal immediately/)).toBeInTheDocument();

    const confirmButton = within(dialog).getByRole('button', { name: 'Delete' });
    expect(confirmButton).toBeDisabled();

    await user.click(within(dialog).getByRole('checkbox'));
    expect(confirmButton).toBeEnabled();
  });

  it('deletes and returns to the list with a confirmation', async () => {
    const user = userEvent.setup();
    mockDeleteRfp.mockResolvedValue(undefined);
    renderPage(baseRfp);

    await user.click(await screen.findByRole('button', { name: 'Delete' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete this RFP?' });
    await user.click(within(dialog).getByRole('checkbox'));
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(mockDeleteRfp).toHaveBeenCalledWith('rfp-1'));
    expect(await screen.findByText('rfps list')).toBeInTheDocument();
  });
});
