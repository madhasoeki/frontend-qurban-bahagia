<script lang="ts">
	import HewanList from '$lib/components/hewan-list.svelte';
	import FilterToolbar from '$lib/components/filter-toolbar.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { IconDeviceFloppy } from '@tabler/icons-svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import { saveTimbang } from '$lib/api/progress';
	import { invalidateAll } from '$app/navigation';
	import { useHewanSSE } from '$lib/hooks/use-sse';
	import { mapHewanData } from '$lib/utils/mapper';
	import type { ProgressHewan } from '$lib/types/hewan';
	import { untrack } from 'svelte';

	let { data } = $props();
	let hewanState = $state<ProgressHewan[] | null>(null);
	let currentHewan = $derived(hewanState ?? (data.hewan as ProgressHewan[]));
	let hewan = $derived<ProgressHewan[]>(currentHewan.filter((h) => h.waktuSelesaiJagal !== null));

	let inputValues = $state<Record<number, { daging: string | number; tulang: string | number }>>({});
	let isEditing = $state<Record<number, boolean>>({});

	$effect(() => {
		hewanState = data.hewan as ProgressHewan[];
		(data.hewan as ProgressHewan[]).forEach((h) => {
			if (!inputValues[h.id!]) {
				inputValues[h.id!] = { daging: h.beratDaging ?? 0, tulang: h.beratTulang ?? 0 };
			}
		});
	});

	useHewanSSE({
		onHewanUpdate: (raw) => {
			const updated = mapHewanData(raw);
			const exists = currentHewan.find((h) => h.id === updated.id);
			if (exists) {
				hewanState = currentHewan.map((h) => (h.id === updated.id ? updated : h));
			} else {
				hewanState = [...currentHewan, updated];
			}
			inputValues[updated.id!] = { daging: updated.beratDaging ?? 0, tulang: updated.beratTulang ?? 0 };
		},
	});

	let actionLoading = $state<Record<number, boolean>>({});
	let actionError = $state<Record<number, string>>({});

	async function handleTimbang(id: number) {
		actionLoading[id] = true; actionError[id] = '';
		try {
			const payload = {
				berat_daging: Number(String(inputValues[id].daging).replace(',', '.')),
				berat_tulang: Number(String(inputValues[id].tulang).replace(',', '.'))
			};
			await saveTimbang(id, payload);
			await invalidateAll();
			isEditing[id] = false;
		} catch (err) {
			actionError[id] = err instanceof Error ? err.message : 'Gagal simpan timbang';
		} finally { actionLoading[id] = false; }
	}
</script>

<FilterToolbar pengawas={data.pengawas} initialFilters={untrack(() => data.activeFilters)} />

<HewanList items={hewan} caption="Daftar Proses Timbang" actionHeader="Input Timbang" {catatanFooter} {extraHeader} {extraCell}>
	{#snippet cardAction(item)}
		<div class="flex w-full flex-col gap-2">
			<div class="flex justify-end w-full">{@render TimbangAction(item)}</div>
			{#if actionError[item.id!]}<p class="text-xs text-red-500 text-end">{actionError[item.id!]}</p>{/if}
		</div>
	{/snippet}
	{#snippet tableAction(item)}
		<div class="flex flex-col items-center gap-1">
			{@render TimbangAction(item)}
			{#if actionError[item.id!]}<p class="text-xs text-red-500">{actionError[item.id!]}</p>{/if}
		</div>
	{/snippet}
</HewanList>

{#snippet TimbangAction(item: ProgressHewan)}
	{#if !isEditing[item.id!]}
		<Button size="sm" variant="outline" onclick={() => isEditing[item.id!] = true}>Ubah Berat</Button>
	{:else}
		{#if inputValues[item.id!]}
			<div class="flex flex-col gap-2 items-end">
				<div class="flex items-end gap-2">
					<div class="flex flex-col gap-1 w-20 text-left">
						<label for="daging-{item.id}" class="text-[10px] text-muted-foreground font-semibold">Daging (Kg)</label>
						<Input id="daging-{item.id}" type="text" inputmode="decimal" bind:value={inputValues[item.id!].daging} class="h-8 text-xs" />
					</div>
					<div class="flex flex-col gap-1 w-20 text-left">
						<label for="tulang-{item.id}" class="text-[10px] text-muted-foreground font-semibold">Tulang (Kg)</label>
						<Input id="tulang-{item.id}" type="text" inputmode="decimal" bind:value={inputValues[item.id!].tulang} class="h-8 text-xs" />
					</div>
				</div>
				<div class="flex gap-2">
					<Button size="sm" variant="ghost" onclick={() => isEditing[item.id!] = false} disabled={actionLoading[item.id!]}>Batal</Button>
					<Button size="sm" onclick={() => handleTimbang(item.id!)} disabled={actionLoading[item.id!]}>
						{#if actionLoading[item.id!]}<Spinner class="h-4 w-4 md:mr-1" />{:else}<IconDeviceFloppy class="h-4 w-4 md:mr-1" />{/if}
						<span class="hidden md:inline">{actionLoading[item.id!] ? 'Menyimpan...' : 'Simpan'}</span>
					</Button>
				</div>
			</div>
		{/if}
	{/if}
{/snippet}

{#snippet catatanFooter(item: ProgressHewan)}
	<div class="flex gap-2"><span class="w-20 shrink-0 text-muted-foreground">Berat Daging</span><span>{item.beratDaging} kg</span></div>
	<div class="flex gap-2"><span class="w-20 shrink-0 text-muted-foreground">Berat Tulang</span><span>{item.beratTulang} kg</span></div>
{/snippet}

{#snippet extraHeader()}
	<Table.Head class="w-28 text-center">Berat (Kg)</Table.Head>
{/snippet}

{#snippet extraCell(item: ProgressHewan)}
	<Table.Cell class="align-top w-28">
		<div class="flex flex-col text-xs text-muted-foreground whitespace-nowrap">
			<span>Daging: <span class="font-semibold text-foreground">{item.beratDaging}</span></span>
			<span>Tulang: <span class="font-semibold text-foreground">{item.beratTulang}</span></span>
		</div>
	</Table.Cell>
{/snippet}
