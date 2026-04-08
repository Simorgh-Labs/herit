import { useQuery } from '@tanstack/react-query';
import { useMsal } from '@azure/msal-react';
import { getUserById } from '../api/users';
import type { User } from '../types';

export function useCurrentUser(): { user: User | undefined; isLoading: boolean; error: Error | null } {
  const { accounts } = useMsal();
  const accountId = accounts[0]?.localAccountId;

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['currentUser', accountId],
    queryFn: () => getUserById(accountId!),
    enabled: !!accountId,
  });

  return { user, isLoading, error: error as Error | null };
}
