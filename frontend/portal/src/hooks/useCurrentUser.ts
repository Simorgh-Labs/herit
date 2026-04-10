import { useQuery } from '@tanstack/react-query';
import { useIsAuthenticated } from '@azure/msal-react';
import { getCurrentUser } from '../api/users';
import type { User } from '../types';
import type { AxiosError } from 'axios';

export function useCurrentUser(): { user: User | undefined; isLoading: boolean; error: AxiosError | null; isNotFound: boolean } {
  const isAuthenticated = useIsAuthenticated();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
    retry: (failureCount, err) => {
      const axiosErr = err as AxiosError;
      if (axiosErr?.response?.status === 404) return false;
      return failureCount < 1;
    },
  });

  const axiosError = error as AxiosError | null;
  const isNotFound = axiosError?.response?.status === 404;

  return { user, isLoading, error: axiosError, isNotFound };
}
