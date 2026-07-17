import { apiClient } from './client';
import type { Proposal } from '../types';

export const listProposals = (): Promise<Proposal[]> => apiClient.get('/Proposals').then((r) => r.data);
