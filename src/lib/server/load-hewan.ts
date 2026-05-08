/**
 * Shared server-side loader for all operational pages.
 * Handles auth, filter parsing, API calls, and data mapping.
 */
import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$env/static/public';
import type { ProgressHewan } from '$lib/types/hewan';
import { mapHewanData } from '$lib/utils/mapper';

export type FilterParams = {
    search: string;
    tipe: string;
    jenisHewan: string;
    pengawasIds: string;
};

export type Pengawas = {
    id: number;
    username: string;
};

type Role =
    | 'admin'
    | 'koordinator_pengawas'
    | 'pengawas'
    | 'jagal'
    | 'kulit'
    | 'cacah_daging'
    | 'cacah_tulang'
    | 'packing'
    | 'distribusi';

const knownRoles = new Set<Role>([
    'admin',
    'koordinator_pengawas',
    'pengawas',
    'jagal',
    'kulit',
    'cacah_daging',
    'cacah_tulang',
    'packing',
    'distribusi',
]);

function decodeJwtPayload(token: string): any | undefined {
    const cleaned = token.replace(/^"|"$/g, '');
    const base64Url = cleaned.split('.')[1];
    if (!base64Url) return undefined;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4 || 4)), '=');
    const jsonPayload = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
}

function normalizeRole(role: string | undefined): Role | undefined {
    if (!role) return undefined;
    const normalized = role.trim().toLowerCase();
    return knownRoles.has(normalized as Role) ? (normalized as Role) : undefined;
}

function parseJwtRole(token: string | undefined): Role | undefined {
    if (!token) return undefined;
    try {
        const decodedToken = decodeURIComponent(token);
        const decoded = decodeJwtPayload(decodedToken);
        const rawRole = decoded?.role ?? decoded?.Role ?? decoded?.data?.role;
        return normalizeRole(String(rawRole ?? ''));
    } catch {
        return undefined;
    }
}

export async function loadHewanPage(opts: {
    fetch: typeof fetch;
    cookies: { get: (name: string) => string | undefined };
    url: URL;
}): Promise<{
    hewan: ProgressHewan[];
    pengawas: Pengawas[];
    activeFilters: FilterParams;
}> {
    const token = opts.cookies.get('token');
    if (!token) redirect(302, '/login');

    const role = normalizeRole(opts.cookies.get('role')) ?? parseJwtRole(token);

    const headers = { Authorization: `Bearer ${decodeURIComponent(token)}` };

    // Ambil filter dari URL
    const search = opts.url.searchParams.get('search') ?? '';
    const tipe = opts.url.searchParams.get('tipe') ?? '';
    const jenisHewan = opts.url.searchParams.get('jenis_hewan') ?? '';
    const pengawasIds = opts.url.searchParams.get('pengawas_id') ?? '';

    // Build query string untuk API
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (tipe) params.set('tipe', tipe);
    if (jenisHewan) params.set('jenis_hewan', jenisHewan);
    if (pengawasIds) params.set('pengawas_id', pengawasIds);
    const query = params.size ? '?' + params.toString() : '';

    const hewanRes = await opts.fetch(`${PUBLIC_API_URL}/hewan${query}`, { headers });
    if (!hewanRes.ok) redirect(302, '/login');

    let pengawasJson: any = { data: [] };
    if (role === 'admin') {
        const pengawasRes = await opts.fetch(`${PUBLIC_API_URL}/users?role=pengawas`, { headers });
        if (pengawasRes.ok) {
            pengawasJson = await pengawasRes.json();
        }
    }

    const hewanJson = await hewanRes.json();

    const hewanList = Array.isArray(hewanJson?.data) ? hewanJson.data : [];
    const pengawasList = Array.isArray(pengawasJson?.data)
        ? pengawasJson.data
        : Array.isArray(pengawasJson)
            ? pengawasJson
            : [];

    return {
        hewan: hewanList.map(mapHewanData),
        pengawas: pengawasList.map((item: any) => ({
            id: item.id ?? item.ID ?? 0,
            username:
                item.nama_lengkap ??
                item.NamaLengkap ??
                item.username ??
                item.Username ??
                '',
        })),
        activeFilters: { search, tipe, jenisHewan, pengawasIds },
    };
}
