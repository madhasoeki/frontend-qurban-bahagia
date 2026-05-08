import { apiFetch } from './client';

type HewanPayload = {
    kodeHewan: string;
    tipe: string;
    jenisHewan: string;
    namaSohibul: string[];
    pengawasId: number;
    catatan?: string;
};

type HewanParams = {
    search?: string;
    tipe?: string;
    jenis_hewan?: string;
    pengawas_id?: string;
    catatan?: string;// bisa multiple, misal "2,3"
};

function toSnakeCase(data: HewanPayload) {
    return {
        kode_hewan: data.kodeHewan,
        tipe: data.tipe,
        jenis_hewan: data.jenisHewan,
        nama_sohibul: [...data.namaSohibul],
        pengawas_id: data.pengawasId,
        catatan: data.catatan,
    };
}

export const getHewan = (params?: HewanParams) => {
    const query = params ? '?' + new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString() : '';
    return apiFetch(`/hewan${query}`);
};
export const createHewan = (data: HewanPayload) => apiFetch('/hewan', { method: 'POST', body: JSON.stringify(toSnakeCase(data)) });
export const updateHewan = (id: number, data: HewanPayload) => apiFetch(`/hewan/${id}`, { method: 'PUT', body: JSON.stringify(toSnakeCase(data)) });
export const deleteHewan = (id: number) => apiFetch(`/hewan/${id}`, { method: 'DELETE' });