import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RfpsPage from './RfpsPage';
import { listRfps } from '../../api/rfps';
import { listOrganisations } from '../../api/organisations';
import type { Organisation, Rfp } from '../../types';

vi.mock('../../api/rfps', () => ({ listRfps: vi.fn() }));
vi.mock('../../api/organisations', () => ({ listOrganisations: vi.fn() }));

const mockListRfps = vi.mocked(listRfps);
const mockListOrganisations = vi.mocked(listOrganisations);

const rfps: Rfp[] = [
  { id: '1', title: 'Digital ID Verification', shortDescription: '', longDescription: '', status: 'Draft', organisationId: 'o1', authorId: 'u1', tags: 'identity' },
  { id: '2', title: 'Remote Voting Portal', shortDescription: '', longDescription: '', status: 'Draft', organisationId: 'o2', authorId: 'u1' },
  { id: '3', title: 'Consular Records', shortDescription: '', longDescription: '', status: 'Approved', organisationId: 'o1', authorId: 'u1' },
  { id: '4', title: 'Diaspora Outreach', shortDescription: '', longDescription: '', status: 'Published', organisationId: 'o1', authorId: 'u1' },
];

const organisations: Organisation[] = [
  { id: 'o1', name: 'Ministry of Digital Economy' },
  { id: 'o2', name: 'Diaspora Engagement Bureau' },
];

function renderPage(initialEntries = ['/rfps']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <RfpsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mockListRfps.mockResolvedValue(rfps);
  mockListOrganisations.mockResolvedValue(organisations);
});

describe('RfpsPage', () => {
  it('defaults to the Draft tab and lists matching RFPs with org names', async () => {
    renderPage();

    expect(await screen.findByText('Digital ID Verification')).toBeInTheDocument();
    expect(screen.getByText('Remote Voting Portal')).toBeInTheDocument();
    expect(screen.queryByText('Consular Records')).not.toBeInTheDocument();
    expect(screen.getByText('Ministry of Digital Economy')).toBeInTheDocument();
    expect(screen.getByText('Diaspora Engagement Bureau')).toBeInTheDocument();
  });

  it('respects a status query param and switches tabs on click', async () => {
    const user = userEvent.setup();
    renderPage(['/rfps?status=Published']);

    expect(await screen.findByText('Diaspora Outreach')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Approved/ }));
    expect(await screen.findByText('Consular Records')).toBeInTheDocument();
    expect(screen.queryByText('Diaspora Outreach')).not.toBeInTheDocument();
  });

  it('filters by search text within the active tab', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Digital ID Verification');
    await user.type(screen.getByPlaceholderText('Search RFPs'), 'identity');

    expect(screen.getByText('Digital ID Verification')).toBeInTheDocument();
    expect(screen.queryByText('Remote Voting Portal')).not.toBeInTheDocument();
  });

  it('shows an empty state when a status tab has no RFPs', async () => {
    mockListRfps.mockResolvedValue([]);
    renderPage();

    await waitFor(() => expect(screen.getByText('No draft RFPs')).toBeInTheDocument());
    expect(screen.getByText('New RFPs start in Draft. Create one to get started.')).toBeInTheDocument();
  });

  it('shows a deletion confirmation banner when redirected with ?deleted=true', async () => {
    renderPage(['/rfps?deleted=true']);
    expect(await screen.findByText('RFP deleted.')).toBeInTheDocument();
  });

  it('links rows to the detail page and the New RFP action to the editor', async () => {
    renderPage();

    const row = await screen.findByText('Digital ID Verification');
    expect(row.closest('a')).toHaveAttribute('href', '/rfps/1');
    expect(screen.getByRole('link', { name: 'New RFP' })).toHaveAttribute('href', '/rfps/new');
  });
});
