import { apiFetch } from './client';

export const getUsers = (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/users${query}`);
};
export const createUser = (data: unknown) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = (id: number, data: unknown) => apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUser = (id: number) => apiFetch(`/users/${id}`, { method: 'DELETE' });