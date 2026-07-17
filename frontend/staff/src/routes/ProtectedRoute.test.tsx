import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { InteractionStatus } from '@azure/msal-browser';
import ProtectedRoute from './ProtectedRoute';
import { useCurrentUser } from '../hooks/useCurrentUser';
import type { User } from '../types';

// Explicit factories keep the real hooks/useCurrentUser (and its api/client, MSAL
// config env-var reads) from ever loading in the test environment.
vi.mock('@azure/msal-react', () => ({
  useIsAuthenticated: vi.fn(),
  useMsal: vi.fn(),
}));
vi.mock('../hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}));

import { useIsAuthenticated, useMsal } from '@azure/msal-react';

const mockUseIsAuthenticated = vi.mocked(useIsAuthenticated);
const mockUseMsal = vi.mocked(useMsal);
const mockUseCurrentUser = vi.mocked(useCurrentUser);

function renderGate() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/sign-in" element={<div>sign-in</div>} />
        <Route path="/access-denied" element={<div>access-denied</div>} />
        <Route path="/auth/error" element={<div>auth-error</div>} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>dashboard</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute (role gate)', () => {
  beforeEach(() => {
    mockUseMsal.mockReturnValue({ inProgress: InteractionStatus.None } as ReturnType<typeof useMsal>);
  });

  it('redirects to /sign-in when not authenticated', () => {
    mockUseIsAuthenticated.mockReturnValue(false);
    mockUseCurrentUser.mockReturnValue({ user: undefined, isLoading: false, error: null, isNotFound: false });

    renderGate();

    expect(screen.getByText('sign-in')).toBeInTheDocument();
  });

  it('redirects to /access-denied when there is no User record (404)', () => {
    mockUseIsAuthenticated.mockReturnValue(true);
    mockUseCurrentUser.mockReturnValue({ user: undefined, isLoading: false, error: null, isNotFound: true });

    renderGate();

    expect(screen.getByText('access-denied')).toBeInTheDocument();
  });

  it('redirects to /access-denied when the user has role Expat', () => {
    mockUseIsAuthenticated.mockReturnValue(true);
    const expat: User = { id: '1', email: 'a@b.com', fullName: 'A B', role: 'Expat' };
    mockUseCurrentUser.mockReturnValue({ user: expat, isLoading: false, error: null, isNotFound: false });

    renderGate();

    expect(screen.getByText('access-denied')).toBeInTheDocument();
  });

  it.each(['Staff', 'OrganisationAdmin', 'SuperAdmin'] as const)(
    'renders the protected content for role %s',
    (role) => {
      mockUseIsAuthenticated.mockReturnValue(true);
      const user: User = { id: '1', email: 'a@b.com', fullName: 'A B', role };
      mockUseCurrentUser.mockReturnValue({ user, isLoading: false, error: null, isNotFound: false });

      renderGate();

      expect(screen.getByText('dashboard')).toBeInTheDocument();
    },
  );

  it('redirects to /auth/error on a non-404 failure', () => {
    mockUseIsAuthenticated.mockReturnValue(true);
    mockUseCurrentUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      error: { name: 'AxiosError', message: 'boom' } as ReturnType<typeof useCurrentUser>['error'],
      isNotFound: false,
    });

    renderGate();

    expect(screen.getByText('auth-error')).toBeInTheDocument();
  });
});
