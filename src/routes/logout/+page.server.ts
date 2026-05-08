import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
    cookies.set('token', '', {
        path: '/',
        maxAge: 0,
        sameSite: 'lax'
    });
    cookies.set('role', '', {
        path: '/',
        maxAge: 0,
        sameSite: 'lax'
    });

    throw redirect(302, '/login');
};
