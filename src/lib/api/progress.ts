import { apiFetch } from './client';

export const updateProgress = (id: number, pos: string, status: 'mulai' | 'selesai') =>
    apiFetch(`/hewan/${id}/progress/${pos}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });

export const saveTimbang = (id: number, payload: { berat_daging: number; berat_tulang: number }) =>
    apiFetch(`/hewan/${id}/timbang`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });

export const updatePacking = (id: number, status: 'mulai' | 'selesai', total_kantong?: number) =>
    apiFetch(`/hewan/${id}/packing`, {
        method: 'PATCH',
        body: JSON.stringify({ status, total_kantong }),
    });

export const updateKelengkapan = (id: number, payload: Partial<Record<'cek_kepala' | 'cek_kaki' | 'cek_kulit' | 'cek_ekor' | 'cek_distribusi', boolean>>) =>
    apiFetch(`/hewan/${id}/kelengkapan`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
