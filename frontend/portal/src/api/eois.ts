import { apiClient } from './client';
import type { Eoi, SubmitEoiRequest, EoiStatus, EoiVisibility } from '../types';

export const listEoisByCfeoi = (cfeoiId: string): Promise<Eoi[]> =>
  apiClient.get('/Eoi', { params: { cfeoiId } }).then((r) => r.data);

export const listMyEois = (): Promise<Eoi[]> =>
  apiClient.get('/Eoi/my').then((r) => r.data);

export const getEoiById = (id: string): Promise<Eoi> =>
  apiClient.get(`/Eoi/${id}`).then((r) => r.data);

export const submitEoi = (data: SubmitEoiRequest): Promise<string> =>
  apiClient.post('/Eoi', data).then((r) => r.data);

export const deleteEoi = (id: string): Promise<void> =>
  apiClient.delete(`/Eoi/${id}`).then((r) => r.data);

export const withdrawEoi = (id: string): Promise<void> =>
  apiClient.patch(`/Eoi/${id}/withdraw`).then((r) => r.data);

export const updateEoiStatus = (id: string, status: EoiStatus): Promise<void> =>
  apiClient.patch(`/Eoi/${id}/status`, { status }).then((r) => r.data);

export const setEoiVisibility = (id: string, visibility: EoiVisibility): Promise<void> =>
  apiClient.patch(`/Eoi/${id}/visibility`, visibility).then((r) => r.data);
