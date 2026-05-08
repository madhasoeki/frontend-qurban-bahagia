import { PUBLIC_API_URL } from '$env/static/public';
const BASE_URL = PUBLIC_API_URL;

function getCookie(name: string) {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
    const token = getCookie('token');

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? errData.message ?? 'Request gagal');
    }

    return res.json();
}