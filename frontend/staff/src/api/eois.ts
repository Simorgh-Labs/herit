import { apiClient } from './client';
import type { Eoi, EoiStatus } from '../types';

export const listEoisByCfeoi = (cfeoiId: string): Promise<Eoi[]> =>
  apiClient.get('/Eoi', { params: { cfeoiId } }).then((r) => r.data);

export const updateEoiStatus = (id: string, status: EoiStatus): Promise<void> =>
  apiClient.patch(`/Eoi/${id}/status`, { newStatus: status }).then(() => undefined);

export const deleteEoi = (id: string): Promise<void> =>
  apiClient.delete(`/Eoi/${id}`).then(() => undefined);
