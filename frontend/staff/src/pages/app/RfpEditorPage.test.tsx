import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RfpEditorPage from './RfpEditorPage';
import { createRfp, getRfpById, updateRfp } from '../../api/rfps';
import { listOrganisations } from '../../api/organisations';
import type { Organisation, Rfp } from '../../types';

vi.mock('../../api/rfps', () => ({
  createRfp: vi.fn(),
  updateRfp: vi.fn(),
  getRfpById: vi.fn(),
}));
vi.mock('../../api/organisations', () => ({ listOrganisations: vi.fn() }));

const mockCreateRfp = vi.mocked(createRfp);
const mockUpdateRfp = vi.mocked(updateRfp);
const mockGetRfpById = vi.mocked(getRfpById);
const mockListOrganisations = vi.mocked(listOrganisations);

const organisations: Organisation[] = [
  { id: 'o1', name: 'Ministry of Digital Economy' },
  { id: 'o2', name: 'Diaspora Engagement Bureau' },
];

const draftRfp: Rfp = {
  id: 'rfp-1',
  title: 'Digital ID Verification',
  shortDescription: 'A short description.',
  longDescription: 'A long description.',
  status: 'Draft',
  organisationId: 'o1',
  authorId: 'u1',
  tags: 'identity',
};

function renderPage(initialEntries: string[], path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path={path} element={<RfpEditorPage />} />
          <Route path="/rfps/:id" element={<div>detail page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mockListOrganisations.mockResolvedValue(organisations);
  mockGetRfpById.mockResolvedValue(draftRfp);
});

describe('RfpEditorPage — create mode', () => {
  it('shows validation errors and does not submit when required fields are empty', async () => {
    const user = userEvent.setup();
    renderPage(['/rfps/new'], '/rfps/new');

    await screen.findByText('Ministry of Digital Economy');
    await user.click(screen.getByRole('button', { name: 'Create RFP' }));

    expect(await screen.findByText('Title is required.')).toBeInTheDocument();
    expect(screen.getByText('Short description is required.')).toBeInTheDocument();
    expect(screen.getByText('Long description is required.')).toBeInTheDocument();
    expect(screen.getByText('Organisation is required.')).toBeInTheDocument();
    expect(mockCreateRfp).not.toHaveBeenCalled();
  });

  it('submits the form and redirects to the detail page with a created confirmation', async () => {
    const user = userEvent.setup();
    mockCreateRfp.mockResolvedValue('new-rfp-id');
    renderPage(['/rfps/new'], '/rfps/new');

    await user.type(screen.getByLabelText('Title'), 'New RFP Title');
    await user.type(screen.getByLabelText('Short description'), 'Short desc');
    await user.type(screen.getByLabelText('Long description'), 'Long desc');
    await user.selectOptions(await screen.findByLabelText('Organisation'), 'o1');
    await user.click(screen.getByRole('button', { name: 'Create RFP' }));

    await waitFor(() =>
      expect(mockCreateRfp).toHaveBeenCalledWith({
        title: 'New RFP Title',
        shortDescription: 'Short desc',
        longDescription: 'Long desc',
        tags: undefined,
        organisationId: 'o1',
      }),
    );
    expect(await screen.findByText('detail page')).toBeInTheDocument();
  });
});

describe('RfpEditorPage — edit mode', () => {
  it('prefills the form from the existing RFP and disables the organisation field', async () => {
    renderPage(['/rfps/rfp-1/edit'], '/rfps/:id/edit');

    expect(await screen.findByDisplayValue('Digital ID Verification')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A short description.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A long description.')).toBeInTheDocument();
    expect(screen.getByLabelText('Organisation')).toBeDisabled();
  });

  it('shows the published warning when editing a published RFP', async () => {
    mockGetRfpById.mockResolvedValue({ ...draftRfp, status: 'Published' });
    renderPage(['/rfps/rfp-1/edit'], '/rfps/:id/edit');

    expect(await screen.findByText('This RFP is live on the portal')).toBeInTheDocument();
  });

  it('submits changes via PUT and redirects with an updated confirmation', async () => {
    const user = userEvent.setup();
    mockUpdateRfp.mockResolvedValue(undefined);
    renderPage(['/rfps/rfp-1/edit'], '/rfps/:id/edit');

    await screen.findByDisplayValue('Digital ID Verification');
    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Updated Title');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(mockUpdateRfp).toHaveBeenCalledWith('rfp-1', {
        title: 'Updated Title',
        shortDescription: 'A short description.',
        longDescription: 'A long description.',
        tags: 'identity',
      }),
    );
    expect(await screen.findByText('detail page')).toBeInTheDocument();
  });
});
