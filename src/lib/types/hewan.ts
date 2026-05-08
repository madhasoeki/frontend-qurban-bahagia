export type BaseHewan = {
    id?: number;
    kodeHewan: string;
    tipe: 'qurban' | 'sedekah' | string;
    jenisHewan: 'sapi' | 'kambing' | string;
    namaSohibul: string[];
    pengawasId: number;
    pengawasNama?: string;
    catatan?: string;
};

export type ProgressHewan = BaseHewan & {
    waktuMulaiJagal?: string | null;
    waktuSelesaiJagal?: string | null;
    waktuMulaiKuliti?: string | null;
    waktuSelesaiKuliti?: string | null;
    waktuMulaiCacahDaging?: string | null;
    waktuSelesaiCacahDaging?: string | null;
    waktuMulaiCacahTulang?: string | null;
    waktuSelesaiCacahTulang?: string | null;
    waktuMulaiPacking?: string | null;
    waktuSelesaiPacking?: string | null;
    kantongPacking?: number | null;
    beratDaging?: number;
    beratTulang?: number;
    cekKepala?: boolean;
    cekKaki?: boolean;
    cekKulit?: boolean;
    cekEkor?: boolean;
    cekDistribusi?: boolean;
};
