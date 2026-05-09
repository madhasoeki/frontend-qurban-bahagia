<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import EmptyState from '$lib/components/empty-state.svelte';
	import { IconDots, IconPlus, IconFilter, IconSearch } from '@tabler/icons-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte.js';
	import { createUser, deleteUser, updateUser } from '$lib/api/users';
	import UserForm from './user-form.svelte';
	import type { User } from './user-columns';
	import { invalidateAll } from '$app/navigation';
	import { roleOptions } from './user-columns';
	import * as Select from '$lib/components/ui/select/index.js';

	const isMobile = new IsMobile();
	const triggerClass = `${buttonVariants({ variant: 'default' })} ml-2`;

	let { data } = $props();
	let allUsers = $derived<User[]>(data.users);

	// Filter state
	let search = $state('');
	let filterRole = $state('');

	// Filtered result
	let users = $derived(
		allUsers.filter((user) => {
			const matchSearch = user.username.toLowerCase().includes(search.toLowerCase()) || 
								user.namaLengkap.toLowerCase().includes(search.toLowerCase());
			const matchRole = filterRole ? user.role.toLowerCase() === filterRole.toLowerCase() : true;
			return matchSearch && matchRole;
		})
	);

	// --- state modal ---
	let addOpen = $state(false);
	let addError = $state('');
	let addLoading = $state(false);

	let editOpen = $state(false);
	let editTarget = $state<User | null>(null);
	let editError = $state('');
	let editLoading = $state(false);

	let deleteOpen = $state(false);
	let deleteTarget = $state<User | null>(null);
	let deleteError = $state('');
	let deleteLoading = $state(false);

	// --- helpers ---
	async function reloadUsers() {
		await invalidateAll(); // trigger ulang load() dari server
	}

	async function handleAdd(data: { namaLengkap: string; username: string; password: string; role: string }) {
		if (!data.namaLengkap || !data.username || !data.password || !data.role) {
			addError = 'Semua field wajib diisi.';
			return;
		}
		addLoading = true;
		addError = '';
		try {
			await createUser({
				nama_lengkap: data.namaLengkap,
				username: data.username,
				password: data.password,
				role: data.role
			});
			addOpen = false;
			await reloadUsers();
		} catch (err) {
			addError = err instanceof Error ? err.message : 'Gagal menambah user';
		} finally {
			addLoading = false;
		}
	}

	async function handleEdit(data: { namaLengkap: string; username: string; password: string; role: string }) {
		if (!editTarget?.id) return;
		if (!data.namaLengkap || !data.username || !data.role) {
			editError = 'Semua field wajib diisi.';
			return;
		}
		editLoading = true;
		editError = '';
		try {
			await updateUser(editTarget.id, {
				nama_lengkap: data.namaLengkap,
				username: data.username,
				password: data.password,
				role: data.role
			});
			editOpen = false;
			editTarget = null;
			await reloadUsers();
		} catch (err) {
			editError = err instanceof Error ? err.message : 'Gagal mengubah user';
		} finally {
			editLoading = false;
		}
	}

	async function handleDelete() {
		if (!deleteTarget?.id) return;
		deleteLoading = true;
		deleteError = '';
		try {
			await deleteUser(deleteTarget.id);
			deleteOpen = false;
			deleteTarget = null;
			await reloadUsers();
		} catch (err) {
			deleteError = err instanceof Error ? err.message : 'Gagal menghapus user';
		} finally {
			deleteLoading = false;
		}
	}
</script>

<!-- Toolbar -->
<div class="mb-4 flex items-center gap-2">
	<!-- Search: lebih lebar di desktop -->
	<div class="relative flex-1">
		<IconSearch class="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
		<Input placeholder="Search users..." bind:value={search} class="pl-8" />
	</div>

	<!-- Filter role pakai popover dengan icon -->
	<Select.Root type="single" bind:value={filterRole}>
		<Select.Trigger class="w-auto gap-1">
			<IconFilter class="h-4 w-4" />
			<span class="hidden sm:inline">{filterRole || 'Semua Role'}</span>
		</Select.Trigger>
		<Select.Content>
			<Select.Item value="">Semua Role</Select.Item>
			{#each roleOptions as option}
				<Select.Item value={option}>{option}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>

	<!-- Tombol tambah: icon only di mobile, teks di desktop -->
	<div>
		{#if isMobile.current}
			<Drawer.Root bind:open={addOpen}>
				<Drawer.Trigger class={buttonVariants({ variant: 'default', size: 'icon' })}>
					<IconPlus class="h-4 w-4" />
				</Drawer.Trigger>
				<Drawer.Content class="p-4">
					<Drawer.Header><Drawer.Title>Tambah User</Drawer.Title></Drawer.Header>
					<UserForm
						loading={addLoading}
						error={addError}
						onsubmit={handleAdd}
						oncancel={() => (addOpen = false)}
					/>
				</Drawer.Content>
			</Drawer.Root>
		{:else}
			<Dialog.Root bind:open={addOpen}>
				<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>
					<IconPlus /> Tambah User
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Tambah User</Dialog.Title>
						<Dialog.Description>Isi data user baru.</Dialog.Description>
					</Dialog.Header>
					<UserForm
						loading={addLoading}
						error={addError}
						onsubmit={handleAdd}
						oncancel={() => (addOpen = false)}
					/>
				</Dialog.Content>
			</Dialog.Root>
		{/if}
	</div>
</div>

<!-- Edit Modal -->
{#if isMobile.current}
	<Drawer.Root bind:open={editOpen}>
		<Drawer.Content class="p-4">
			<Drawer.Header><Drawer.Title>Edit User</Drawer.Title></Drawer.Header>
			<UserForm
				user={editTarget ?? undefined}
				loading={editLoading}
				error={editError}
				onsubmit={handleEdit}
				oncancel={() => (editOpen = false)}
			/>
		</Drawer.Content>
	</Drawer.Root>
{:else}
	<Dialog.Root bind:open={editOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Edit User</Dialog.Title>
				<Dialog.Description>Perbarui data user.</Dialog.Description>
			</Dialog.Header>
			<UserForm
				user={editTarget ?? undefined}
				loading={editLoading}
				error={editError}
				onsubmit={handleEdit}
				oncancel={() => (editOpen = false)}
			/>
		</Dialog.Content>
	</Dialog.Root>
{/if}

<!-- Tabel -->
{#if users.length === 0}
	<EmptyState title="Data masih kosong" description="Belum ada data user yang bisa ditampilkan saat ini." />
{:else}
<Table.Root>
	<Table.Caption>Daftar User Qurban Bahagia App</Table.Caption>
	<Table.Header>
		<Table.Row>
			<Table.Head>Nama Lengkap</Table.Head>
			<Table.Head>Username</Table.Head>
			<Table.Head>Role</Table.Head>
			<Table.Head class="text-end">Action</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each users as user (user.id ?? user.username)}
			<Table.Row>
				<Table.Cell class="font-medium">{user.namaLengkap}</Table.Cell>
				<Table.Cell class="text-muted-foreground">@{user.username}</Table.Cell>
				<Table.Cell class="capitalize">{user.role.replace('_', ' ')}</Table.Cell>
				<Table.Cell class="text-end">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Button variant="outline" size="sm"><IconDots stroke={2} /></Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<DropdownMenu.Item
								onclick={() => {
									editTarget = user;
									editOpen = true;
								}}>Edit</DropdownMenu.Item
							>
							<DropdownMenu.Item
								onclick={() => {
									deleteTarget = user;
									deleteOpen = true;
								}}>Delete</DropdownMenu.Item
							>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
{/if}

<!-- Delete Confirm -->
<AlertDialog.Root bind:open={deleteOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Hapus User</AlertDialog.Title>
			<AlertDialog.Description>
				Apakah kamu yakin ingin menghapus user <strong>{deleteTarget?.namaLengkap}</strong>?
			</AlertDialog.Description>
		</AlertDialog.Header>
		{#if deleteError}
			<p class="text-sm text-red-500">{deleteError}</p>
		{/if}
		<AlertDialog.Footer>
			<AlertDialog.Cancel disabled={deleteLoading}>Batal</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={handleDelete}
				disabled={deleteLoading}
				class={buttonVariants({ variant: 'destructive' })}
			>
				{#if deleteLoading}<Spinner class="mr-2" />{/if}
				{deleteLoading ? 'Menghapus...' : 'Hapus'}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
