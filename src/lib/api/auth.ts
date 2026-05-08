import { apiFetch } from './client';

function setTokenCookie(token: string) {
    const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `token=${encodeURIComponent(token)}; Path=/; SameSite=Lax${secure}`;
}

function setRoleCookie(role: string) {
    const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `role=${encodeURIComponent(role)}; Path=/; SameSite=Lax${secure}`;
}

function clearTokenCookie() {
    document.cookie = 'token=; Path=/; Max-Age=0; SameSite=Lax';
}

function clearRoleCookie() {
    document.cookie = 'role=; Path=/; Max-Age=0; SameSite=Lax';
}

export async function login(username: string, password: string) {
    const data = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });

    // Simpan token dan role dari response
    setTokenCookie(data.token);
    if (data.role) setRoleCookie(data.role);
    return data;
}

export function logout() {
    clearTokenCookie();
    clearRoleCookie();
}