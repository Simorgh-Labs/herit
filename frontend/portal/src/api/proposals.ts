import { apiClient } from './client';
import type { Proposal, CreateProposalRequest, UpdateProposalRequest, ProposalStatus, ProposalVisibility } from '../types';

export const listProposals = (): Promise<Proposal[]> =>
  apiClient.get('/Proposals').then((r) => r.data);

export const getProposalById = (id: string): Promise<Proposal> =>
  apiClient.get(`/Proposals/${id}`).then((r) => r.data);

export const createProposal = (data: CreateProposalRequest): Promise<string> =>
  apiClient.post('/Proposals', data).then((r) => r.data);

export const updateProposal = (id: string, data: UpdateProposalRequest): Promise<void> =>
  apiClient.put(`/Proposals/${id}`, data).then((r) => r.data);

export const deleteProposal = (id: string): Promise<void> =>
  apiClient.delete(`/Proposals/${id}`).then((r) => r.data);

export const updateProposalStatus = (id: string, status: ProposalStatus): Promise<void> =>
  apiClient.patch(`/Proposals/${id}/status`, status).then((r) => r.data);

export const setProposalVisibility = (id: string, visibility: ProposalVisibility): Promise<void> =>
  apiClient.patch(`/Proposals/${id}/visibility`, visibility).then((r) => r.data);
