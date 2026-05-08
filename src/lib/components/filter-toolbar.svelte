<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { IconFilter, IconX, IconSearch } from '@tabler/icons-svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Field, FieldLabel } from '$lib/components/ui/field/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import { goto } from '$app/navigation';

	const tipeOptions = ['qurban', 'sedekah'];
	const jenisOptions = ['sapi', 'kambing'];

	type Pengawas = { id: number; username: string };
	type FilterValues = { search: string; tipe: string; jenisHewan: string; pengawasIds: string };

	let {
		pengawas = [],
		initialFilters = { search: '', tipe: '', jenisHewan: '', pengawasIds: '' },
		/** If provided, filters are applied client-side via this callback. Otherwise uses goto(). */
		onfilter,
	}: {
		pengawas?: Pengawas[];
		initialFilters?: FilterValues;
		onfilter?: (filters: FilterValues) => void;
	} = $props();

	let search = $state('');
	let filterTipe = $state('');
	let filterJenis = $state('');
	let filterPengawas = $state<string[]>([]);
	let filterOpen = $state(false);

	const normalizedInitial = $derived(initialFilters);
	$effect(() => {
		search = normalizedInitial.search;
		filterTipe = normalizedInitial.tipe;
		filterJenis = normalizedInitial.jenisHewan;
		filterPengawas = normalizedInitial.pengawasIds
			? normalizedInitial.pengawasIds.split(',')
			: [];
	});

	const hasActiveFilter = $derived(!!(filterTipe || filterJenis || filterPengawas.length));

	let searchTimeout: ReturnType<typeof setTimeout>;
	function handleSearch(e: Event) {
		search = (e.target as HTMLInputElement).value;
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => applyFilters(), 400);
	}

	function applyFilters() {
		const filters: FilterValues = {
			search,
			tipe: filterTipe,
			jenisHewan: filterJenis,
			pengawasIds: filterPengawas.join(','),
		};
		filterOpen = false;

		if (onfilter) {
			onfilter(filters);
		} else {
			const params = new URLSearchParams();
			if (filters.search) params.set('search', filters.search);
			if (filters.tipe) params.set('tipe', filters.tipe);
			if (filters.jenisHewan) params.set('jenis_hewan', filters.jenisHewan);
			if (filters.pengawasIds) params.set('pengawas_id', filters.pengawasIds);
			goto(`?${params.toString()}`, { keepFocus: true });
		}
	}

	function resetFilters() {
		filterTipe = '';
		filterJenis = '';
		filterPengawas = [];
		search = '';

		if (onfilter) {
			onfilter({ search: '', tipe: '', jenisHewan: '', pengawasIds: '' });
		} else {
			goto('?', { keepFocus: true });
		}
	}
</script>

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

				{#if pengawas.length > 0}
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
				{/if}

				<div class="flex justify-end gap-2">
					<Button variant="outline" onclick={resetFilters}>Reset</Button>
					<Button onclick={applyFilters}>Terapkan</Button>
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Root>

	{#if hasActiveFilter}
		<Button variant="ghost" size="icon" onclick={resetFilters}>
			<IconX class="h-4 w-4" />
		</Button>
	{/if}
</div>
