import { apiClient } from './client';
import type { Rfp, RfpStatus } from '../types';

export const listRfps = (): Promise<Rfp[]> => apiClient.get('/Rfps').then((r) => r.data);

export const getRfpById = (id: string): Promise<Rfp> => apiClient.get(`/Rfps/${id}`).then((r) => r.data);

export interface CreateRfpPayload {
  title: string;
  shortDescription: string;
  organisationId: string;
  longDescription: string;
  tags?: string;
}

export const createRfp = (payload: CreateRfpPayload): Promise<string> =>
  apiClient.post('/Rfps', payload).then((r) => r.data);

export interface UpdateRfpPayload {
  title: string;
  shortDescription: string;
  longDescription: string;
  tags?: string;
}

export const updateRfp = (id: string, payload: UpdateRfpPayload): Promise<void> =>
  apiClient.put(`/Rfps/${id}`, payload).then(() => undefined);

export const updateRfpStatus = (id: string, newStatus: RfpStatus): Promise<void> =>
  apiClient.patch(`/Rfps/${id}/status`, { newStatus }).then(() => undefined);

export const deleteRfp = (id: string): Promise<void> =>
  apiClient.delete(`/Rfps/${id}`).then(() => undefined);
