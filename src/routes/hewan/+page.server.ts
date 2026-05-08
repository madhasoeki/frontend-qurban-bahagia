import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$env/static/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, cookies, url }) => {
    const token = cookies.get('token');
    if (!token) redirect(302, '/login');

    const headers = { Authorization: `Bearer ${decodeURIComponent(token)}` };

    // Ambil filter dari URL
    const search = url.searchParams.get('search') ?? '';
    const tipe = url.searchParams.get('tipe') ?? '';
    const jenisHewan = url.searchParams.get('jenis_hewan') ?? '';
    const pengawasIds = url.searchParams.get('pengawas_id') ?? '';

    // Build query string untuk API
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (tipe) params.set('tipe', tipe);
    if (jenisHewan) params.set('jenis_hewan', jenisHewan);
    if (pengawasIds) params.set('pengawas_id', pengawasIds);
    const query = params.size ? '?' + params.toString() : '';

    const [hewanRes, pengawasRes] = await Promise.all([
        fetch(`${PUBLIC_API_URL}/hewan${query}`, { headers }),
        fetch(`${PUBLIC_API_URL}/users?role=pengawas`, { headers }),
    ]);

    if (!hewanRes.ok || !pengawasRes.ok) redirect(302, '/login');

    const hewanJson = await hewanRes.json();
    const pengawasJson = await pengawasRes.json();

    const hewanList = Array.isArray(hewanJson?.data) ? hewanJson.data : [];
    const pengawasList = Array.isArray(pengawasJson?.data) ? pengawasJson.data : Array.isArray(pengawasJson) ? pengawasJson : [];

    return {
        hewan: hewanList.map((item: any) => {
            const pengawas = item.pengawas ?? item.Pengawas ?? {};
            const namaSohibulRaw = item.nama_sohibul ?? item.NamaSohibul;
            const namaSohibul = Array.isArray(namaSohibulRaw) ? namaSohibulRaw : [];

            return {
                id: item.id ?? item.ID,
                kodeHewan: item.kode_hewan ?? item.KodeHewan ?? '',
                tipe: item.tipe ?? item.Tipe ?? '',
                jenisHewan: item.jenis_hewan ?? item.JenisHewan ?? '',
                namaSohibul,
                pengawasId: item.pengawas_id ?? item.PengawasID ?? 0,
                pengawasNama:
                    pengawas.nama_lengkap ??
                    pengawas.NamaLengkap ??
                    pengawas.username ??
                    pengawas.Username ??
                    '',
                catatan: item.catatan ?? item.Catatan ?? '',
            };
        }),
        pengawas: pengawasList.map((item: any) => ({
            id: item.id ?? item.ID ?? 0,
            username:
                item.nama_lengkap ??
                item.NamaLengkap ??
                item.username ??
                item.Username ??
                '',
        })),
        // Kembalikan filter aktif supaya UI bisa sinkron
        activeFilters: { search, tipe, jenisHewan, pengawasIds }
    };
};