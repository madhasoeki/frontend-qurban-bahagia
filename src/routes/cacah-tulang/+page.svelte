<script lang="ts">
	import HewanList from '$lib/components/hewan-list.svelte';
	import FilterToolbar from '$lib/components/filter-toolbar.svelte';
	import ConfirmDialog from '$lib/components/confirm-dialog.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { IconPlayerPlay, IconPlayerStop } from '@tabler/icons-svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { updateProgress } from '$lib/api/progress';
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
	let confirmOpen = $state(false);
	let confirmAction = $state<() => void>(() => {});
	let confirmTitle = $state('');
	let confirmDesc = $state('');

	function requestAction(title: string, desc: string, action: () => void) {
		confirmTitle = title; confirmDesc = desc; confirmAction = action; confirmOpen = true;
	}

	async function handleCacahTulang(id: number, status: 'mulai' | 'selesai') {
		actionLoading[id] = true; actionError[id] = '';
		try {
			await updateProgress(id, 'cacah_tulang', status);
			await invalidateAll();
		} catch (err) {
			actionError[id] = err instanceof Error ? err.message : 'Gagal update progress';
		} finally { actionLoading[id] = false; }
	}
</script>

<FilterToolbar pengawas={data.pengawas} initialFilters={untrack(() => data.activeFilters)} />

<HewanList items={hewan} caption="Daftar Proses Cacah Tulang" actionHeader="Status Cacah Tulang">
	{#snippet cardAction(item)}
		{@const status = getProcessStatus(item.waktuMulaiCacahTulang, item.waktuSelesaiCacahTulang)}
		<div class="flex w-full flex-col gap-2">
			<div class="flex justify-end w-full">{@render Action(item, status)}</div>
			{#if actionError[item.id!]}<p class="text-xs text-red-500 text-end">{actionError[item.id!]}</p>{/if}
		</div>
	{/snippet}
	{#snippet tableAction(item)}
		{@const status = getProcessStatus(item.waktuMulaiCacahTulang, item.waktuSelesaiCacahTulang)}
		<div class="flex flex-col items-center gap-1">
			{@render Action(item, status)}
			{#if actionError[item.id!]}<p class="text-xs text-red-500">{actionError[item.id!]}</p>{/if}
		</div>
	{/snippet}
</HewanList>

{#snippet Action(item: ProgressHewan, status: 'idle' | 'running' | 'done')}
	{#if status === 'idle'}
		<Button size="sm" onclick={() => requestAction('Mulai Cacah Tulang', `Yakin ingin memulai proses cacah tulang untuk hewan ${item.kodeHewan}?`, () => handleCacahTulang(item.id!, 'mulai'))} disabled={actionLoading[item.id!]}>
			<IconPlayerPlay class="h-4 w-4 mr-1" />{actionLoading[item.id!] ? 'Memulai...' : 'Mulai Cacah Tulang'}
		</Button>
	{:else if status === 'running'}
		<div class="flex items-center gap-2">
			<Badge variant="secondary" class="tabular-nums font-mono text-sm">{formatDuration(item.waktuMulaiCacahTulang!, null, now)}</Badge>
			<Button size="sm" variant="destructive" onclick={() => requestAction('Selesai Cacah Tulang', `Yakin ingin menyelesaikan proses cacah tulang untuk hewan ${item.kodeHewan}?`, () => handleCacahTulang(item.id!, 'selesai'))} disabled={actionLoading[item.id!]}>
				<IconPlayerStop class="h-4 w-4 mr-1" />{actionLoading[item.id!] ? 'Menyimpan...' : 'Selesai'}
			</Button>
		</div>
	{:else}
		<Badge variant="outline" class="tabular-nums font-mono text-sm">{formatDuration(item.waktuMulaiCacahTulang!, item.waktuSelesaiCacahTulang!)}</Badge>
	{/if}
{/snippet}

<ConfirmDialog bind:open={confirmOpen} title={confirmTitle} description={confirmDesc} onconfirm={confirmAction} />
