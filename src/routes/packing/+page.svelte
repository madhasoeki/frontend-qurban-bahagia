<script lang="ts">
	import HewanList from '$lib/components/hewan-list.svelte';
	import FilterToolbar from '$lib/components/filter-toolbar.svelte';
	import ConfirmDialog from '$lib/components/confirm-dialog.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { IconPlayerPlay, IconPlayerStop, IconEdit } from '@tabler/icons-svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { updatePacking } from '$lib/api/progress';
	import { invalidateAll } from '$app/navigation';
	import { useHewanSSE } from '$lib/hooks/use-sse';
	import { formatDuration, getProcessStatus } from '$lib/utils/format';
	import { mapHewanData } from '$lib/utils/mapper';
	import type { ProgressHewan } from '$lib/types/hewan';
	import { untrack, onDestroy } from 'svelte';

	let { data } = $props();
	let hewanState = $state<ProgressHewan[] | null>(null);
	let currentHewan = $derived(hewanState ?? (data.hewan as ProgressHewan[]));
	let hewan = $derived<ProgressHewan[]>(currentHewan.filter((h) => h.waktuSelesaiJagal !== null));

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

	let actionLoading = $state<Record<number, boolean>>({});
	let actionError = $state<Record<number, string>>({});
	let dialogOpen = $state(false);
	let selectedHewanId = $state<number | null>(null);
	let inputKantong = $state<string | number>('');
	let confirmOpen = $state(false);
	let confirmAction = $state<() => void>(() => {});
	let confirmTitle = $state('');
	let confirmDesc = $state('');

	function requestAction(title: string, desc: string, action: () => void) {
		confirmTitle = title; confirmDesc = desc; confirmAction = action; confirmOpen = true;
	}

	function openDialog(item: ProgressHewan) {
		selectedHewanId = item.id!;
		inputKantong = item.kantongPacking ?? '';
		dialogOpen = true;
	}

	async function handleMulai(id: number) {
		actionLoading[id] = true; actionError[id] = '';
		try {
			await updatePacking(id, 'mulai');
			await invalidateAll();
		} catch (err) {
			actionError[id] = err instanceof Error ? err.message : 'Gagal mulai packing';
		} finally { actionLoading[id] = false; }
	}

	async function submitSelesai() {
		if (!selectedHewanId) return;
		const val = Number(inputKantong);
		if (isNaN(val) || val <= 0) {
			actionError[selectedHewanId] = 'Jumlah kantong harus lebih dari 0';
			return;
		}
		const idToUpdate = selectedHewanId;
		actionLoading[idToUpdate] = true; actionError[idToUpdate] = '';
		dialogOpen = false;
		try {
			await updatePacking(idToUpdate, 'selesai', val);
			await invalidateAll();
		} catch (err) {
			actionError[idToUpdate] = err instanceof Error ? err.message : 'Gagal simpan packing';
		} finally { actionLoading[idToUpdate] = false; }
	}
</script>

<FilterToolbar pengawas={data.pengawas} initialFilters={untrack(() => data.activeFilters)} />

<HewanList items={hewan} caption="Daftar Proses Packing" actionHeader="Status Packing" {catatanFooter} {extraHeader} {extraCell}>
	{#snippet cardAction(item)}
		<div class="flex w-full flex-col gap-2">
			<div class="flex justify-end w-full">{@render PackingAction(item)}</div>
			{#if actionError[item.id!]}<p class="text-xs text-red-500 text-end">{actionError[item.id!]}</p>{/if}
		</div>
	{/snippet}
	{#snippet tableAction(item)}
		<div class="flex flex-col items-center gap-1">
			{@render PackingAction(item)}
			{#if actionError[item.id!]}<p class="text-xs text-red-500">{actionError[item.id!]}</p>{/if}
		</div>
	{/snippet}
</HewanList>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Input Kantong Packing</Dialog.Title>
			<Dialog.Description>Masukkan jumlah kantong daging yang dihasilkan untuk hewan ini.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="kantong">Jumlah Kantong</Label>
				<Input id="kantong" type="number" min="1" bind:value={inputKantong} />
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Batal</Button>
			<Button onclick={submitSelesai}>Simpan</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

{#snippet PackingAction(item: ProgressHewan)}
	{@const status = getProcessStatus(item.waktuMulaiPacking, item.waktuSelesaiPacking)}
	{#if status === 'idle'}
		<Button size="sm" onclick={() => requestAction('Mulai Packing', `Yakin ingin memulai proses packing untuk hewan ${item.kodeHewan}?`, () => handleMulai(item.id!))} disabled={actionLoading[item.id!]}>
			<IconPlayerPlay class="h-4 w-4 mr-1" />{actionLoading[item.id!] ? 'Memulai...' : 'Mulai Packing'}
		</Button>
	{:else if status === 'running'}
		<div class="flex items-center gap-2">
			<Badge variant="secondary" class="tabular-nums font-mono text-sm">{formatDuration(item.waktuMulaiPacking!, null, now)}</Badge>
			<Button size="sm" variant="destructive" onclick={() => openDialog(item)} disabled={actionLoading[item.id!]}>
				<IconPlayerStop class="h-4 w-4 mr-1" />Selesai
			</Button>
		</div>
	{:else}
		<div class="flex flex-col md:items-center items-end gap-1">
			<Badge variant="outline" class="tabular-nums font-mono text-sm">{formatDuration(item.waktuMulaiPacking!, item.waktuSelesaiPacking!)}</Badge>
			<div class="flex items-center gap-1 text-xs font-medium mt-1">
				<span class="text-muted-foreground">Kantong:</span>
				<span class="font-bold">{item.kantongPacking}</span>
				<Button size="sm" variant="ghost" class="h-5 px-1 ml-1 text-[10px]" onclick={() => openDialog(item)} disabled={actionLoading[item.id!]}>
					<IconEdit class="h-3 w-3" />
				</Button>
			</div>
		</div>
	{/if}
{/snippet}

{#snippet catatanFooter(item: ProgressHewan)}
	<div class="flex gap-2"><span class="w-20 shrink-0 text-muted-foreground">Berat Daging</span><span>{item.beratDaging} kg</span></div>
	<div class="flex gap-2"><span class="w-20 shrink-0 text-muted-foreground">Berat Tulang</span><span>{item.beratTulang} kg</span></div>
{/snippet}

{#snippet extraHeader()}
	<Table.Head class="text-center">Berat (Kg)</Table.Head>
{/snippet}

{#snippet extraCell(item: ProgressHewan)}
	<Table.Cell class="align-top">
		<div class="flex flex-col text-xs text-muted-foreground whitespace-nowrap">
			<span>Daging: <span class="font-semibold text-foreground">{item.beratDaging}</span></span>
			<span>Tulang: <span class="font-semibold text-foreground">{item.beratTulang}</span></span>
		</div>
	</Table.Cell>
{/snippet}

<ConfirmDialog bind:open={confirmOpen} title={confirmTitle} description={confirmDesc} onconfirm={confirmAction} />
