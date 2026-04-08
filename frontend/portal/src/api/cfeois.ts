import { apiClient } from './client';
import type { Cfeoi, PublishCfeoiRequest, CfeoiStatus } from '../types';

export const listCfeois = (params?: { status?: CfeoiStatus; proposalId?: string }): Promise<Cfeoi[]> =>
  apiClient.get('/Cfeoi', { params }).then((r) => r.data);

export const getCfeoiById = (id: string): Promise<Cfeoi> =>
  apiClient.get(`/Cfeoi/${id}`).then((r) => r.data);

export const publishCfeoi = (data: PublishCfeoiRequest): Promise<string> =>
  apiClient.post('/Cfeoi', data).then((r) => r.data);

export const updateCfeoi = (id: string, data: PublishCfeoiRequest): Promise<void> =>
  apiClient.put(`/Cfeoi/${id}`, data).then((r) => r.data);

export const updateCfeoiStatus = (id: string, status: CfeoiStatus): Promise<void> =>
  apiClient.patch(`/Cfeoi/${id}/status`, { status }).then((r) => r.data);
