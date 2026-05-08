import {
    IconLayoutDashboard,
    IconUsersGroup,
    IconUser,
    IconSlice,
    IconLayersSelectedBottom,
    IconMeat,
    IconBone,
    IconPackage,
    IconScale,
    IconCubeSend,
    IconLogout,
    IconChecklist
} from '@tabler/icons-svelte';
import type { ComponentType } from 'svelte';

export type MenuItem = {
    title: string;
    url: string;
    icon: ComponentType;
};

export const menuItems: MenuItem[] = [
    { title: 'Dashboard', url: '/dashboard', icon: IconLayoutDashboard },
    { title: 'Users', url: '/users', icon: IconUsersGroup },
    { title: 'Sohibul', url: '/hewan', icon: IconUser },
    { title: 'Jagal', url: '/jagal', icon: IconSlice },
    { title: 'Kulit', url: '/kulit', icon: IconLayersSelectedBottom },
    { title: 'Cacah Daging', url: '/cacah-daging', icon: IconMeat },
    { title: 'Cacah Tulang', url: '/cacah-tulang', icon: IconBone },
    { title: 'Timbang', url: '/timbang', icon: IconScale },
    { title: 'Packing', url: '/packing', icon: IconPackage },
    { title: 'Status & Kelengkapan', url: '/status', icon: IconChecklist },
    { title: 'Distribusi', url: '/distribusi', icon: IconCubeSend },
    { title: 'Logout', url: '/logout', icon: IconLogout },
];

const menuByRole: Record<string, string[]> = {
    admin: menuItems.map((item) => item.url),
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

export function getMenuItemsForRole(role?: string): MenuItem[] {
    if (!role) return menuItems;
    const allowed = new Set(menuByRole[role] ?? []);
    return menuItems.filter((item) => allowed.has(item.url));
}