<script lang="ts">
	import './layout.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { pwaInfo } from 'virtual:pwa-info';
	import { getMenuItemsForRole } from '$lib/config/menu';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { IconLogout } from '@tabler/icons-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { logout } from '$lib/api/auth';
	import { goto } from '$app/navigation';

	let { children } = $props();

	const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

	onMount(async () => {
		if (pwaInfo) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({
				immediate: true,
				onRegistered(r: ServiceWorkerRegistration | undefined) {
					console.log(`SW Registered: ${r}`);
				},
				onRegisterError(error: Error) {
					console.log('SW registration error', error);
				}
			});
		}
	});

	const menuItems = $derived(getMenuItemsForRole($page.data.role));
	const currentPage = $derived(
		menuItems.find((item) => item.url === $page.url.pathname)?.title ?? 'Halaman'
	);

	function handleLogout() {
		logout();
		goto('/login');
	}

	const showShell = $derived($page.data.isLoggedIn && $page.url.pathname !== '/logout');
	const needsDashboardPadding = $derived(
		!$page.data.isLoggedIn && $page.url.pathname === '/dashboard'
	);
</script>

<svelte:head>{@html webManifestLink}</svelte:head>
{#if showShell}
	<Sidebar.Provider>
		<AppSidebar />
		<Sidebar.Inset>
			<header class="fixed top-0 z-50 flex h-13 w-full shrink-0 items-center gap-2 border-b bg-background px-4">
				<Sidebar.Trigger class="-ms-1" />
				<Separator orientation="vertical" class="me-2 h-4" />
				<Breadcrumb.Root>
					<Breadcrumb.List>
						<Breadcrumb.Item class="hidden md:block">
							<Breadcrumb.Link href="/dashboard">Qurban Bahagia</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator class="hidden md:block" />
						<Breadcrumb.Item>
							<Breadcrumb.Page>{currentPage}</Breadcrumb.Page>
						</Breadcrumb.Item>
					</Breadcrumb.List>
				</Breadcrumb.Root>

				<!-- Logout button, hanya muncul di mobile -->
				<div class="ml-auto md:hidden">
					<Button variant="ghost" size="sm" onclick={handleLogout}>
						<IconLogout class="h-4 w-4" />
					</Button>
				</div>
			</header>
			<main class="p-4 pt-16">
				{@render children?.()}
			</main>
		</Sidebar.Inset>
	</Sidebar.Provider>
{:else}
	{#if needsDashboardPadding}
		<main class="p-4 md:p-10">
			{@render children?.()}
		</main>
	{:else}
		{@render children?.()}
	{/if}
{/if}
