import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

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

const publicPaths = new Set(['/login', '/dashboard', '/logout', '/']);

const roleAccess: Record<Role, string[]> = {
	admin: ['*'],
	koordinator_pengawas: [
		'/dashboard',
		'/jagal',
		'/kulit',
		'/cacah-daging',
		'/cacah-tulang',
		'/timbang',
		'/status',
		'/logout',
	],
	pengawas: [
		'/dashboard',
		'/jagal',
		'/kulit',
		'/cacah-daging',
		'/cacah-tulang',
		'/timbang',
		'/status',
		'/logout',
	],
	jagal: ['/dashboard', '/jagal', '/logout'],
	kulit: ['/dashboard', '/kulit', '/logout'],
	cacah_daging: ['/dashboard', '/cacah-daging', '/logout'],
	cacah_tulang: ['/dashboard', '/cacah-tulang', '/logout'],
	packing: ['/dashboard', '/packing', '/logout'],
	distribusi: ['/dashboard', '/distribusi', '/logout'],
};

const knownRoles = new Set(Object.keys(roleAccess));

function decodeJwtPayload(token: string): any | undefined {
	const cleaned = token.replace(/^"|"$/g, '');
	const base64Url = cleaned.split('.')[1];
	if (!base64Url) return undefined;
	const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64.padEnd(base64.length + (4 - (base64.length % 4 || 4)), '=');
	const jsonPayload = Buffer.from(padded, 'base64').toString('utf8');
	return JSON.parse(jsonPayload);
}

function parseJwtRole(token: string | undefined): Role | undefined {
	if (!token) return undefined;
	try {
		const decodedToken = decodeURIComponent(token);
		const decoded = decodeJwtPayload(decodedToken);
		const rawRole = decoded?.role ?? decoded?.Role ?? decoded?.data?.role;
		const normalized = String(rawRole ?? '').trim().toLowerCase();
		return knownRoles.has(normalized) ? (normalized as Role) : undefined;
	} catch {
		return undefined;
	}
}

function normalizeRole(role: string | undefined): Role | undefined {
	if (!role) return undefined;
	const normalized = role.trim().toLowerCase();
	return knownRoles.has(normalized) ? (normalized as Role) : undefined;
}

function isPathAllowed(pathname: string, allowed: string[]) {
	if (allowed.includes('*')) return true;
	return allowed.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const pathname = url.pathname;
	const token = cookies.get('token');
	const role = normalizeRole(cookies.get('role')) ?? parseJwtRole(token);

	if (!token) {
		if (!publicPaths.has(pathname)) {
			throw redirect(302, '/login');
		}
		return { isLoggedIn: false, role: undefined };
	}

	if (pathname === '/logout') {
		return { isLoggedIn: false, role };
	}

	if (!role) {
		throw redirect(302, '/login');
	}

	if (pathname !== '/login') {
		const allowed = roleAccess[role];
		if (!isPathAllowed(pathname, allowed)) {
			throw redirect(302, '/dashboard');
		}
	}

	return {
		isLoggedIn: true,
		role,
	};
};
