import { apiClient } from './client';
import type { Proposal, ProposalStatus } from '../types';

export const listProposals = (): Promise<Proposal[]> => apiClient.get('/Proposals').then((r) => r.data);

export const getProposalById = (id: string): Promise<Proposal> =>
  apiClient.get(`/Proposals/${id}`).then((r) => r.data);

export const updateProposalStatus = (id: string, status: ProposalStatus): Promise<void> =>
  apiClient.patch(`/Proposals/${id}/status`, status).then(() => undefined);

export const deleteProposal = (id: string): Promise<void> =>
  apiClient.delete(`/Proposals/${id}`).then(() => undefined);
