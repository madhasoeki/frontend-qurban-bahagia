// +page.server.ts
import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$env/static/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
    const token = cookies.get('token');

    if (!token) {
        redirect(302, '/login');
    }

    const response = await fetch(`${PUBLIC_API_URL}/users`, {
        headers: {
            Authorization: `Bearer ${decodeURIComponent(token)}`
        }
    });

    if (!response.ok) {
        redirect(302, '/login');
    }

    const json = await response.json();
    const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];

    return {
        users: list.map((item: { id?: number; ID?: number; nama_lengkap?: string; NamaLengkap?: string; username?: string; Username?: string; role?: string; Role?: string }) => ({
            id: item.id ?? item.ID,
            namaLengkap: item.nama_lengkap ?? item.NamaLengkap ?? '',
            username: item.username ?? item.Username ?? '',
            role: item.role ?? item.Role ?? ''
        }))
    };
};