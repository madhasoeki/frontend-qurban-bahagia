<script lang="ts">
	import HewanList from '$lib/components/hewan-list.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { IconDots, IconPlus, IconFilter, IconX, IconSearch } from '@tabler/icons-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Field, FieldLabel } from '$lib/components/ui/field/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import { createHewan, deleteHewan, updateHewan } from '$lib/api/hewans';
	import { invalidateAll, goto } from '$app/navigation';
	import HewanForm from './hewan-form.svelte';
	import { tipeOptions, jenisOptions, type Hewan, type Pengawas } from './hewan-columns';
	import { untrack } from 'svelte';

	const triggerClass = `${buttonVariants({ variant: 'default' })}`;

	let { data } = $props();
	let hewan = $derived<Hewan[]>(data.hewan);
	let pengawas = $derived<Pengawas[]>(data.pengawas);

	// --- filter state (initial values from URL params) ---
	const initFilters = untrack(() => data.activeFilters);
	let search = $state(initFilters.search);
	let filterTipe = $state(initFilters.tipe);
	let filterJenis = $state(initFilters.jenisHewan);
	let filterPengawas = $state<string[]>(
		initFilters.pengawasIds ? initFilters.pengawasIds.split(',') : []
	);
	let filterOpen = $state(false);

	const hasActiveFilter = $derived(!!(filterTipe || filterJenis || filterPengawas.length));

	let searchTimeout: ReturnType<typeof setTimeout>;
	function handleSearch(e: Event) {
		search = (e.target as HTMLInputElement).value;
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => applyFilters(), 400);
	}

	function applyFilters() {
		const params = new URLSearchParams();
		if (search) params.set('search', search);
		if (filterTipe) params.set('tipe', filterTipe);
		if (filterJenis) params.set('jenis_hewan', filterJenis);
		if (filterPengawas.length) params.set('pengawas_id', filterPengawas.join(','));
		filterOpen = false;
		goto(`?${params.toString()}`, { keepFocus: true });
	}

	function resetFilters() {
		filterTipe = '';
		filterJenis = '';
		filterPengawas = [];
		search = '';
		goto('?', { keepFocus: true });
	}

	// --- modal state ---
	let addOpen = $state(false);
	let addError = $state('');
	let addLoading = $state(false);

	let editOpen = $state(false);
	let editTarget = $state<Hewan | null>(null);
	let editError = $state('');
	let editLoading = $state(false);

	let deleteOpen = $state(false);
	let deleteTarget = $state<Hewan | null>(null);
	let deleteError = $state('');
	let deleteLoading = $state(false);

	async function handleAdd(formData: Omit<Hewan, 'id' | 'pengawasNama'>) {
		if (!formData.kodeHewan || !formData.tipe || !formData.jenisHewan || !formData.pengawasId) {
			addError = 'Semua field wajib diisi.';
			return;
		}
		addLoading = true;
		addError = '';
		try {
			await createHewan(formData);
			addOpen = false;
			await invalidateAll();
		} catch (err) {
			addError = err instanceof Error ? err.message : 'Gagal menambah hewan';
		} finally {
			addLoading = false;
		}
	}

	async function handleEdit(formData: Omit<Hewan, 'id' | 'pengawasNama'>) {
		if (!editTarget?.id) return;
		editLoading = true;
		editError = '';
		try {
			await updateHewan(editTarget.id, formData);
			editOpen = false;
			editTarget = null;
			await invalidateAll();
		} catch (err) {
			editError = err instanceof Error ? err.message : 'Gagal mengubah hewan';
		} finally {
			editLoading = false;
		}
	}

	async function handleDelete() {
		if (!deleteTarget?.id) return;
		deleteLoading = true;
		deleteError = '';
		try {
			await deleteHewan(deleteTarget.id);
			deleteOpen = false;
			deleteTarget = null;
			await invalidateAll();
		} catch (err) {
			deleteError = err instanceof Error ? err.message : 'Gagal menghapus hewan';
		} finally {
			deleteLoading = false;
		}
	}
</script>

<!-- Toolbar -->
<div class="mb-4 flex items-center gap-2">
	<div class="relative flex-1">
		<IconSearch class="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
		<Input
			placeholder="Cari kode atau nama sohibul..."
			value={search}
			oninput={handleSearch}
			class="pl-8"
		/>
	</div>

	<!-- Filter Dialog -->
	<Dialog.Root bind:open={filterOpen}>
		<Dialog.Trigger class={buttonVariants({ variant: hasActiveFilter ? 'default' : 'outline' })}>
			<IconFilter class="h-4 w-4 sm:mr-1" />
			<span class="hidden sm:inline">
				Filter{#if hasActiveFilter}<span class="ml-1 rounded-full bg-white/20 px-1.5 text-xs"
						>aktif</span
					>{/if}
			</span>
		</Dialog.Trigger>
		<Dialog.Content class="max-w-sm">
			<Dialog.Header>
				<Dialog.Title>Filter Hewan</Dialog.Title>
			</Dialog.Header>
			{@render FilterForm()}
		</Dialog.Content>
	</Dialog.Root>

	{#if hasActiveFilter}
		<Button variant="ghost" size="icon" onclick={resetFilters}>
			<IconX class="h-4 w-4" />
		</Button>
	{/if}

	<!-- Tambah Dialog -->
	<div>
		<Dialog.Root bind:open={addOpen}>
			<Dialog.Trigger class={triggerClass}>
				<IconPlus class="h-4 w-4 sm:mr-1" />
				<span class="hidden sm:inline">Tambah Hewan</span>
			</Dialog.Trigger>
			<Dialog.Content class="max-w-3xl">
				<Dialog.Header>
					<Dialog.Title>Tambah Hewan</Dialog.Title>
					<Dialog.Description>Isi data hewan qurban baru.</Dialog.Description>
				</Dialog.Header>
				<HewanForm
					{pengawas}
					loading={addLoading}
					error={addError}
					onsubmit={handleAdd}
					oncancel={() => (addOpen = false)}
				/>
			</Dialog.Content>
		</Dialog.Root>
	</div>
</div>

<HewanList
	items={hewan}
	caption="Daftar Hewan Qurban Bahagia"
	actionHeader="Action"
>
	{#snippet cardAction(item)}
		<div class="flex justify-end w-full">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="outline" size="sm"><IconDots stroke={2} /></Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Item
						onclick={() => {
							editTarget = item;
							editOpen = true;
						}}>Edit</DropdownMenu.Item
					>
					<DropdownMenu.Item
						onclick={() => {
							deleteTarget = item;
							deleteOpen = true;
						}}>Delete</DropdownMenu.Item
					>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	{/snippet}

	{#snippet tableAction(item)}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<Button variant="outline" size="sm"><IconDots stroke={2} /></Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Item
					onclick={() => {
						editTarget = item;
						editOpen = true;
					}}>Edit</DropdownMenu.Item
				>
				<DropdownMenu.Item
					onclick={() => {
						deleteTarget = item;
						deleteOpen = true;
					}}>Delete</DropdownMenu.Item
				>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{/snippet}
</HewanList>

<!-- Edit Dialog -->
<Dialog.Root bind:open={editOpen}>
	<Dialog.Content class="max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>Edit Hewan</Dialog.Title>
			<Dialog.Description>Perbarui data hewan.</Dialog.Description>
		</Dialog.Header>
		{#key editTarget?.id}
			<HewanForm
				hewan={editTarget ?? undefined}
				{pengawas}
				loading={editLoading}
				error={editError}
				onsubmit={handleEdit}
				oncancel={() => (editOpen = false)}
			/>
		{/key}
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Confirm -->
<AlertDialog.Root bind:open={deleteOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Hapus Hewan</AlertDialog.Title>
			<AlertDialog.Description>
				Apakah kamu yakin ingin menghapus hewan <strong>{deleteTarget?.kodeHewan}</strong>?
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

{#snippet FilterForm()}
	<div class="grid gap-4 py-2">
		<Field>
			<FieldLabel>Tipe</FieldLabel>
			<Select.Root type="single" bind:value={filterTipe}>
				<Select.Trigger class="w-full justify-between">
					<span data-slot="select-value">{filterTipe || 'Semua Tipe'}</span>
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="">Semua Tipe</Select.Item>
					{#each tipeOptions as option}
						<Select.Item value={option} class="capitalize">{option}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</Field>

		<Field>
			<FieldLabel>Jenis Hewan</FieldLabel>
			<Select.Root type="single" bind:value={filterJenis}>
				<Select.Trigger class="w-full justify-between">
					<span data-slot="select-value">{filterJenis || 'Semua Jenis'}</span>
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="">Semua Jenis</Select.Item>
					{#each jenisOptions as option}
						<Select.Item value={option} class="capitalize">{option}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</Field>

		<Field>
			<FieldLabel>Pengawas</FieldLabel>
			<Select.Root type="multiple" bind:value={filterPengawas}>
				<Select.Trigger class="w-full justify-between">
					<span data-slot="select-value">
						{filterPengawas.length
							? pengawas
									.filter((p) => filterPengawas.includes(String(p.id)))
									.map((p) => p.username)
									.join(', ')
							: 'Semua Pengawas'}
					</span>
				</Select.Trigger>
				<Select.Content>
					{#each pengawas as p}
						<Select.Item value={String(p.id)}>{p.username}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</Field>

		<div class="flex justify-end gap-2">
			<Button variant="outline" onclick={resetFilters}>Reset</Button>
			<Button onclick={applyFilters}>Terapkan</Button>
		</div>
	</div>
{/snippet}
