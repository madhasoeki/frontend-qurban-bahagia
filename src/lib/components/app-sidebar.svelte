<script lang="ts">
	import { page } from '$app/stores';
	import { getMenuItemsForRole } from '$lib/config/menu';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/context.svelte.js';

	const sidebar = useSidebar();
	const menuItems = $derived(getMenuItemsForRole($page.data.role));
</script>

<Sidebar.Root>
	<Sidebar.Header>
		<div class="flex items-center gap-2 px-2 py-1">
			<img src="/logo.png" alt="Qurban Bahagia" class="h-8 w-8 object-contain" />
			<span class="font-semibold">Qurban Bahagia</span>
		</div>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each menuItems as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={$page.url.pathname === item.url || $page.url.pathname.startsWith(`${item.url}/`)}>
								{#snippet child({ props })}
									<a href={item.url} {...props} onclick={() => sidebar.setOpenMobile(false)}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer>
		<div class="flex items-center gap-2 px-2 py-1">
			<span class="text-sm text-muted-foreground">© 2026 Qurban Bahagia</span>
		</div>
	</Sidebar.Footer>
</Sidebar.Root>
