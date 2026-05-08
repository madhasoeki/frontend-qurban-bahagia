import { apiFetch } from './client';

export const updateKantongDistribusi = (userId: number, penambahan: number) =>
    apiFetch(`/distribusi/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ penambahan }),
    });
