import type { ProgressHewan } from '$lib/types/hewan';

function pick<T>(obj: any, ...keys: string[]): T | undefined {
    if (!obj) return undefined;
    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return obj[key] as T;
        }
    }
    return undefined;
}

export function mapHewanData(item: any): ProgressHewan {
    const pengawas = pick<any>(item, 'pengawas', 'Pengawas') ?? {};
    const namaSohibulRaw = pick<string[] | null>(item, 'nama_sohibul', 'NamaSohibul');
    const namaSohibul = Array.isArray(namaSohibulRaw) ? namaSohibulRaw : [];

    return {
        id: pick<number>(item, 'id', 'ID'),
        kodeHewan: pick<string>(item, 'kode_hewan', 'KodeHewan') ?? '',
        tipe: pick<string>(item, 'tipe', 'Tipe') ?? '',
        jenisHewan: pick<string>(item, 'jenis_hewan', 'JenisHewan') ?? '',
        namaSohibul,
        pengawasId: pick<number>(item, 'pengawas_id', 'PengawasID') ?? 0,
        pengawasNama:
            pick<string>(pengawas, 'nama_lengkap', 'NamaLengkap') ??
            pick<string>(pengawas, 'username', 'Username') ??
            '',
        catatan: pick<string>(item, 'catatan', 'Catatan') ?? '',
        waktuMulaiJagal: pick<string | null>(item, 'waktu_mulai_jagal', 'WaktuMulaiJagal') ?? null,
        waktuSelesaiJagal: pick<string | null>(item, 'waktu_selesai_jagal', 'WaktuSelesaiJagal') ?? null,
        waktuMulaiKuliti: pick<string | null>(item, 'waktu_mulai_kuliti', 'WaktuMulaiKuliti') ?? null,
        waktuSelesaiKuliti: pick<string | null>(item, 'waktu_selesai_kuliti', 'WaktuSelesaiKuliti') ?? null,
        waktuMulaiCacahDaging: pick<string | null>(item, 'waktu_mulai_cacah_daging', 'WaktuMulaiCacahDaging') ?? null,
        waktuSelesaiCacahDaging: pick<string | null>(item, 'waktu_selesai_cacah_daging', 'WaktuSelesaiCacahDaging') ?? null,
        waktuMulaiCacahTulang: pick<string | null>(item, 'waktu_mulai_cacah_tulang', 'WaktuMulaiCacahTulang') ?? null,
        waktuSelesaiCacahTulang: pick<string | null>(item, 'waktu_selesai_cacah_tulang', 'WaktuSelesaiCacahTulang') ?? null,
        waktuMulaiPacking: pick<string | null>(item, 'waktu_mulai_packing', 'WaktuMulaiPacking') ?? null,
        waktuSelesaiPacking: pick<string | null>(item, 'waktu_selesai_packing', 'WaktuSelesaiPacking') ?? null,
        kantongPacking: pick<number | null>(item, 'kantong_packing', 'KantongPacking') ?? null,
        beratDaging: pick<number>(item, 'berat_daging', 'BeratDaging') ?? 0,
        beratTulang: pick<number>(item, 'berat_tulang', 'BeratTulang') ?? 0,
        cekKepala: pick<boolean>(item, 'cek_kepala', 'CekKepala') ?? false,
        cekKaki: pick<boolean>(item, 'cek_kaki', 'CekKaki') ?? false,
        cekKulit: pick<boolean>(item, 'cek_kulit', 'CekKulit') ?? false,
        cekEkor: pick<boolean>(item, 'cek_ekor', 'CekEkor') ?? false,
        cekDistribusi: pick<boolean>(item, 'cek_distribusi', 'CekDistribusi') ?? false,
    };
}
