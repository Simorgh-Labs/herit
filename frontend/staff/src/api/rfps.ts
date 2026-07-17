import { apiClient } from './client';
import type { Rfp } from '../types';

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
