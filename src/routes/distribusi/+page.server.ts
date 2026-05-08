import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$env/static/public';
import type { PageServerLoad } from './$types';

function parseJwtNode(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

export const load: PageServerLoad = async ({ fetch, cookies }) => {
    const token = cookies.get('token');
    if (!token) redirect(302, '/login');

    const decoded = parseJwtNode(token);
    if (!decoded) redirect(302, '/login');

    const role = decoded.role;
    const userId = decoded.user_id;
    
    const headers = { Authorization: `Bearer ${decodeURIComponent(token)}` };

    let distribusiData = [];

    if (role === 'admin') {
        const response = await fetch(`${PUBLIC_API_URL}/distribusi`, { headers });
        if (response.ok) {
            const json = await response.json();
            distribusiData = Array.isArray(json?.data) ? json.data : [];
        }
    } else if (role === 'distribusi') {
        const response = await fetch(`${PUBLIC_API_URL}/distribusi/${userId}`, { headers });
        if (response.ok) {
            const json = await response.json();
            distribusiData = json.data ? [json.data] : [];
        }
    } else {
        redirect(302, '/dashboard');
    }

    return {
        role,
        userId,
        distribusi: distribusiData.map((item: any) => {
            const user = item.user ?? item.User;
            return {
                id: item.id ?? item.ID ?? 0,
                userId: Number(item.user_id ?? item.UserID ?? item.UserId ?? 0),
                jumlahKantong: item.jumlah_kantong ?? item.JumlahKantong ?? 0,
                user: user ? {
                    id: user.id ?? user.ID ?? 0,
                    username: user.username ?? user.Username ?? '',
                    namaLengkap: user.nama_lengkap ?? user.NamaLengkap ?? user.username ?? user.Username ?? '',
                    role: user.role ?? user.Role ?? ''
                } : undefined
            };
        })
    };
};
