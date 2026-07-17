import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OrganisationsPage from './OrganisationsPage';
import { createOrganisation, deleteOrganisation, listOrganisations, updateOrganisation } from '../../api/organisations';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { Organisation, User } from '../../types';

vi.mock('../../api/organisations', () => ({
  listOrganisations: vi.fn(),
  createOrganisation: vi.fn(),
  updateOrganisation: vi.fn(),
  deleteOrganisation: vi.fn(),
}));
vi.mock('../../hooks/useCurrentUser', () => ({ useCurrentUser: vi.fn() }));

const mockListOrganisations = vi.mocked(listOrganisations);
const mockCreateOrganisation = vi.mocked(createOrganisation);
const mockUpdateOrganisation = vi.mocked(updateOrganisation);
const mockDeleteOrganisation = vi.mocked(deleteOrganisation);
const mockUseCurrentUser = vi.mocked(useCurrentUser);

const adminUser: User = { id: 'u1', email: 'amara@example.com', fullName: 'Amara Chen', role: 'SuperAdmin' };
const staffUser: User = { id: 'u2', email: 'jonas@example.com', fullName: 'Jonas Weber', role: 'Staff' };

const organisations: Organisation[] = [
  { id: 'root', name: 'Republic of Herit Government', parentId: null },
  { id: 'health', name: 'Ministry of Health', parentId: 'root' },
  { id: 'piv', name: 'Patient Identity Verification Unit', parentId: 'health' },
];

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/organisations']}>
        <OrganisationsPage />
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
});

describe('OrganisationsPage', () => {
  it('denies access to non-admin staff', async () => {
    mockUseCurrentUser.mockReturnValue({
      user: staffUser,
      isLoading: false,
      error: null,
      isNotFound: false,
    });
    mockListOrganisations.mockResolvedValue(organisations);
    renderPage();

    expect(screen.getByText(/don't have access/i)).toBeInTheDocument();
    expect(screen.queryByText('Republic of Herit Government')).not.toBeInTheDocument();
  });

  it('renders the tree flat-indented by depth with a Root badge on the top node', async () => {
    mockListOrganisations.mockResolvedValue(organisations);
    renderPage();

    await screen.findByText('Republic of Herit Government');
    expect(screen.getByText('Ministry of Health')).toBeInTheDocument();
    expect(screen.getByText('Patient Identity Verification Unit')).toBeInTheDocument();
    expect(screen.getByText('Root')).toBeInTheDocument();
  });

  it('shows the bootstrap empty state and creates the root organisation', async () => {
    const user = userEvent.setup();
    mockListOrganisations.mockResolvedValue([]);
    mockCreateOrganisation.mockResolvedValue('new-id');
    renderPage();

    expect(await screen.findByText('No organisations yet')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /create root organisation/i }));
    const dialog = screen.getByRole('dialog', { name: 'Create root organisation' });
    await user.type(within(dialog).getByPlaceholderText('Organisation name'), 'Republic of Herit Government');
    await user.click(within(dialog).getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(mockCreateOrganisation).toHaveBeenCalledWith({ name: 'Republic of Herit Government', parentId: undefined }),
    );
  });

  it('creates a sub-organisation under the selected node', async () => {
    const user = userEvent.setup();
    mockListOrganisations.mockResolvedValue(organisations);
    mockCreateOrganisation.mockResolvedValue('new-id');
    renderPage();

    await screen.findByText('Ministry of Health');
    await user.click(screen.getAllByTitle('Create sub-organisation')[1]);

    const dialog = screen.getByRole('dialog', { name: 'Create sub-organisation' });
    expect(within(dialog).getByText(/under Ministry of Health/)).toBeInTheDocument();
    await user.type(within(dialog).getByPlaceholderText('Organisation name'), 'New Unit');
    await user.click(within(dialog).getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(mockCreateOrganisation).toHaveBeenCalledWith({ name: 'New Unit', parentId: 'health' }));
  });

  it('renames an organisation', async () => {
    const user = userEvent.setup();
    mockListOrganisations.mockResolvedValue(organisations);
    mockUpdateOrganisation.mockResolvedValue(undefined);
    renderPage();

    await screen.findByText('Ministry of Health');
    await user.click(screen.getAllByTitle('Rename')[1]);

    const dialog = screen.getByRole('dialog', { name: 'Rename organisation' });
    const input = within(dialog).getByDisplayValue('Ministry of Health');
    await user.clear(input);
    await user.type(input, 'Ministry of Public Health');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(mockUpdateOrganisation).toHaveBeenCalledWith('health', 'Ministry of Public Health'));
  });

  it('gates delete on the checkbox and calls the delete endpoint', async () => {
    const user = userEvent.setup();
    mockListOrganisations.mockResolvedValue(organisations);
    mockDeleteOrganisation.mockResolvedValue(undefined);
    renderPage();

    await screen.findByText('Patient Identity Verification Unit');
    await user.click(screen.getAllByTitle('Delete')[2]);

    const dialog = screen.getByRole('dialog', { name: 'Delete Patient Identity Verification Unit?' });
    const confirmButton = within(dialog).getByRole('button', { name: 'Delete organisation' });
    expect(confirmButton).toBeDisabled();

    await user.click(within(dialog).getByRole('checkbox'));
    expect(confirmButton).toBeEnabled();

    await user.click(confirmButton);
    await waitFor(() => expect(mockDeleteOrganisation).toHaveBeenCalledWith('piv'));
  });

  it('surfaces the 409 conflict as a delete-refused message instead of deleting', async () => {
    const user = userEvent.setup();
    mockListOrganisations.mockResolvedValue(organisations);
    mockDeleteOrganisation.mockRejectedValue({
      isAxiosError: true,
      toJSON: () => ({}),
      response: { status: 409, data: { detail: "Organisation 'health' still has attached users and cannot be deleted." } },
    });
    renderPage();

    await screen.findByText('Ministry of Health');
    await user.click(screen.getAllByTitle('Delete')[1]);

    const confirmDialog = screen.getByRole('dialog', { name: "Delete Ministry of Health?" });
    await user.click(within(confirmDialog).getByRole('checkbox'));
    await user.click(within(confirmDialog).getByRole('button', { name: 'Delete organisation' }));

    const refusedDialog = await screen.findByRole('dialog', { name: "Couldn't delete Ministry of Health" });
    expect(
      within(refusedDialog).getByText("Organisation 'health' still has attached users and cannot be deleted."),
    ).toBeInTheDocument();
  });
});
