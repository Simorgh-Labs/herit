import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppNav from './AppNav';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { User } from '../../types';

vi.mock('@azure/msal-react', () => ({
  useMsal: vi.fn(() => ({ instance: {}, accounts: [] })),
}));
vi.mock('../../hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}));
vi.mock('../../api/client', () => ({
  msalInstance: { logoutRedirect: vi.fn() },
}));

const mockUseCurrentUser = vi.mocked(useCurrentUser);

function renderNav() {
  return render(
    <MemoryRouter>
      <AppNav />
    </MemoryRouter>,
  );
}

describe('AppNav', () => {
  it('hides Organisations and Users links for a Staff user', () => {
    const user: User = { id: '1', email: 'a@b.com', fullName: 'Jonas Weber', role: 'Staff' };
    mockUseCurrentUser.mockReturnValue({ user, isLoading: false, error: null, isNotFound: false });

    renderNav();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('RFPs')).toBeInTheDocument();
    expect(screen.getByText('Proposals')).toBeInTheDocument();
    expect(screen.queryByText('Organisations')).not.toBeInTheDocument();
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
    expect(screen.getByText('Jonas Weber')).toBeInTheDocument();
  });

  it.each(['OrganisationAdmin', 'SuperAdmin'] as const)(
    'shows Organisations and Users links for %s',
    (role) => {
      const user: User = { id: '1', email: 'a@b.com', fullName: 'Amara Chen', role };
      mockUseCurrentUser.mockReturnValue({ user, isLoading: false, error: null, isNotFound: false });

      renderNav();

      expect(screen.getByText('Organisations')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    },
  );
});
