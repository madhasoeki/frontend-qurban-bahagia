<script lang="ts">
	import HewanList from '$lib/components/hewan-list.svelte';
	import FilterToolbar from '$lib/components/filter-toolbar.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { IconChecklist, IconCheck } from '@tabler/icons-svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { updateKelengkapan } from '$lib/api/progress';
	import { invalidateAll } from '$app/navigation';
	import { useHewanSSE } from '$lib/hooks/use-sse';
	import { formatDuration } from '$lib/utils/format';
	import { mapHewanData } from '$lib/utils/mapper';
	import type { ProgressHewan } from '$lib/types/hewan';
	import { untrack, onDestroy } from 'svelte';

	let { data } = $props();
	let hewanState = $state<ProgressHewan[] | null>(null);
	let currentHewan = $derived(hewanState ?? (data.hewan as ProgressHewan[]));

	$effect(() => { hewanState = data.hewan as ProgressHewan[]; });

	useHewanSSE({
		onHewanUpdate: (raw) => {
			const updated = mapHewanData(raw);
			const exists = currentHewan.find((h) => h.id === updated.id);
			if (exists) {
				hewanState = currentHewan.map((h) => (h.id === updated.id ? updated : h));
			} else {
				hewanState = [...currentHewan, updated];
			}
		},
	});

	let now = $state(Date.now());
	const timerInterval = setInterval(() => { now = Date.now(); }, 1000);
	onDestroy(() => clearInterval(timerInterval));

	function getStatusLabel(start: string | null | undefined, end: string | null | undefined) {
		if (!start) return { label: 'Belum Mulai', variant: 'outline' as const };
		if (!end) return { label: formatDuration(start, null, now), variant: 'secondary' as const };
		return { label: 'Selesai', variant: 'default' as const };
	}

	// --- dialog kelengkapan state ---
	let dialogOpen = $state(false);
	let selectedHewan = $state<ProgressHewan | null>(null);

	function openKelengkapanDialog(item: ProgressHewan) {
		selectedHewan = item;
		dialogOpen = true;
	}

	async function toggleKelengkapan(field: 'cek_kepala' | 'cek_kaki' | 'cek_kulit' | 'cek_ekor' | 'cek_distribusi', value: boolean) {
		if (!selectedHewan) return;
		try {
			await updateKelengkapan(selectedHewan.id!, { [field]: value });
			await invalidateAll();
		} catch (err) {
			console.error('Gagal update kelengkapan', err);
			alert('Gagal update kelengkapan');
		}
	}
</script>

<FilterToolbar pengawas={data.pengawas} initialFilters={untrack(() => data.activeFilters)} />

<HewanList
	items={currentHewan}
	caption="Status Seluruh Proses"
	actionHeader="Aksi"
	{catatanFooter}
	{extraHeader}
	{extraCell}
>
	{#snippet cardAction(item)}
		<div class="flex justify-end w-full">
			<Button size="sm" variant="outline" onclick={() => openKelengkapanDialog(item)}>
				<IconChecklist class="mr-1 h-4 w-4" /> Update Kelengkapan
			</Button>
		</div>
	{/snippet}

	{#snippet tableAction(item)}
		<div class="flex justify-center">
			<Button size="sm" variant="outline" onclick={() => openKelengkapanDialog(item)}>
				<IconChecklist class="mr-1 h-4 w-4" /> Update
			</Button>
		</div>
	{/snippet}
</HewanList>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Kelengkapan: {selectedHewan?.kodeHewan}</Dialog.Title>
			<Dialog.Description>
				Centang bagian hewan yang telah lengkap/diserahkan. Data akan tersimpan secara otomatis saat dicentang.
			</Dialog.Description>
		</Dialog.Header>
		{#if selectedHewan}
			<div class="grid gap-4 py-4">
				{#each [
					{ id: 'cek_kepala', label: 'Kepala', checked: selectedHewan.cekKepala },
					{ id: 'cek_kaki', label: 'Kaki', checked: selectedHewan.cekKaki },
					{ id: 'cek_kulit', label: 'Kulit', checked: selectedHewan.cekKulit },
					{ id: 'cek_ekor', label: 'Ekor', checked: selectedHewan.cekEkor },
					{ id: 'cek_distribusi', label: 'Siap Distribusi', checked: selectedHewan.cekDistribusi },
				] as field}
					<div class="flex items-center space-x-2">
						<Checkbox
							id={field.id}
							checked={field.checked}
							onCheckedChange={(v) => toggleKelengkapan(field.id as any, !!v)}
						/>
						<label
							for={field.id}
							class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							{field.label}
						</label>
					</div>
				{/each}
			</div>
		{/if}
		<Dialog.Footer>
			<Button onclick={() => (dialogOpen = false)}>Tutup</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

{#snippet StatusBadges(item: ProgressHewan)}
	{@const jagal = getStatusLabel(item.waktuMulaiJagal, item.waktuSelesaiJagal)}
	{@const kulit = getStatusLabel(item.waktuMulaiKuliti, item.waktuSelesaiKuliti)}
	{@const cacahDaging = getStatusLabel(item.waktuMulaiCacahDaging, item.waktuSelesaiCacahDaging)}
	{@const cacahTulang = getStatusLabel(item.waktuMulaiCacahTulang, item.waktuSelesaiCacahTulang)}
	{@const packing = getStatusLabel(item.waktuMulaiPacking, item.waktuSelesaiPacking)}

	<div class="flex flex-col gap-1 text-xs min-w-[120px]">
		{#each [
			{ label: 'Jagal:', data: jagal },
			{ label: 'Kulit:', data: kulit },
			{ label: 'Daging:', data: cacahDaging },
			{ label: 'Tulang:', data: cacahTulang },
			{ label: 'Packing:', data: packing },
		] as row}
			<div class="flex items-center justify-between gap-2">
				<span class="text-muted-foreground w-16">{row.label}</span>
				<Badge variant={row.data.variant} class="tabular-nums font-mono text-[10px] h-5 px-1.5">{row.data.label}</Badge>
			</div>
		{/each}
	</div>
{/snippet}

{#snippet HasilPreview(item: ProgressHewan)}
	<div class="flex flex-col gap-1 text-xs whitespace-nowrap min-w-[120px]">
		<div class="flex items-center justify-between gap-2"><span class="text-muted-foreground w-16">Daging:</span><span class="font-mono font-semibold">{item.beratDaging ?? 0} Kg</span></div>
		<div class="flex items-center justify-between gap-2"><span class="text-muted-foreground w-16">Tulang:</span><span class="font-mono font-semibold">{item.beratTulang ?? 0} Kg</span></div>
		<div class="flex items-center justify-between gap-2"><span class="text-muted-foreground w-16">Kantong:</span><span class="font-mono font-semibold">{item.kantongPacking ?? 0}</span></div>
	</div>
{/snippet}

{#snippet KelengkapanPreview(item: ProgressHewan)}
	<div class="flex flex-col gap-1 text-xs font-medium min-w-[120px]">
		{#each [
			{ checked: item.cekKepala, label: 'Kepala' },
			{ checked: item.cekKaki, label: 'Kaki' },
			{ checked: item.cekKulit, label: 'Kulit' },
			{ checked: item.cekEkor, label: 'Ekor' },
			{ checked: item.cekDistribusi, label: 'Distribusi' },
		] as field}
			<div class="flex items-center gap-1 {field.checked ? 'text-primary' : 'text-muted-foreground'}">
				{#if field.checked}<IconCheck class="h-3 w-3" />{:else}<span class="w-3 inline-block"></span>{/if}
				<span>{field.label}</span>
			</div>
		{/each}
	</div>
{/snippet}

{#snippet extraHeader()}
	<Table.Head class="text-center">Status</Table.Head>
	<Table.Head class="text-center">Hasil</Table.Head>
	<Table.Head class="text-center">Kelengkapan</Table.Head>
{/snippet}

{#snippet extraCell(item: ProgressHewan)}
	<Table.Cell class="align-top">{@render StatusBadges(item)}</Table.Cell>
	<Table.Cell class="align-top">{@render HasilPreview(item)}</Table.Cell>
	<Table.Cell class="align-top">{@render KelengkapanPreview(item)}</Table.Cell>
{/snippet}

{#snippet catatanFooter(item: ProgressHewan)}
	<div class="flex flex-col gap-2 w-full pt-2 border-t mt-1">
		<div class="text-xs font-semibold text-muted-foreground mb-1">STATUS POS</div>
		{@render StatusBadges(item)}
		<div class="text-xs font-semibold text-muted-foreground mt-2 mb-1">HASIL TIMBANG & PACKING</div>
		{@render HasilPreview(item)}
		<div class="text-xs font-semibold text-muted-foreground mt-2 mb-1">KELENGKAPAN</div>
		{@render KelengkapanPreview(item)}
	</div>
{/snippet}
