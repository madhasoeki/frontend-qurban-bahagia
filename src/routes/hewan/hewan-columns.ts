export type Hewan = {
    id?: number;
    kodeHewan: string;
    tipe: 'qurban' | 'sedekah';
    jenisHewan: 'sapi' | 'kambing';
    namaSohibul: string[];
    pengawasId: number;
    pengawasNama?: string;
    catatan?: string;
};

export type Pengawas = {
    id: number;
    username: string;
};

export const tipeOptions = ['qurban', 'sedekah'];
export const jenisOptions = ['sapi', 'kambing'];

export function maxSohibul(jenisHewan: string): number {
    return jenisHewan === 'sapi' ? 7 : 1;
}