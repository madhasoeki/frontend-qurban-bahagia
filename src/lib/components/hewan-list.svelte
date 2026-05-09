<script lang="ts" generics="T extends BaseHewan">
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import EmptyState from '$lib/components/empty-state.svelte';
	import type { BaseHewan } from '$lib/types/hewan';
	import type { Snippet } from 'svelte';

	let {
		items,
		caption = 'Daftar Hewan',
		actionHeader = 'Aksi',
		cardAction,
		tableAction,
		catatanFooter,
		extraHeader,
		extraCell,
	}: {
		items: T[];
		caption?: string;
		actionHeader?: string;
		cardAction?: Snippet<[T]>;
		tableAction?: Snippet<[T]>;
		catatanFooter?: Snippet<[T]>;
		extraHeader?: Snippet;
		extraCell?: Snippet<[T]>;
	} = $props();
</script>

{#if items.length === 0}
	<EmptyState title="Data masih kosong" description="Belum ada data hewan yang bisa ditampilkan saat ini." />
{:else}
<!-- Mobile: Card List -->
<div class="grid gap-3 md:hidden">
	{#each items as item (item.id)}
		<Card.Root size="sm">
			<Card.Header>
				<Card.Title>{item.kodeHewan}</Card.Title>
				<Card.Description>
					<span class="capitalize">{item.tipe}</span> &middot;
					<span class="capitalize">{item.jenisHewan}</span>
				</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-1 text-sm">
				<div class="flex gap-2">
					<span class="w-20 shrink-0 text-muted-foreground">Sohibul</span>
					<div class="flex flex-col gap-0.5">
						{#each item.namaSohibul as nama}
							<span>{nama}</span>
						{/each}
					</div>
				</div>
				<div class="flex gap-2">
					<span class="w-20 shrink-0 text-muted-foreground">Pengawas</span>
					<span>{item.pengawasNama}</span>
				</div>
				{#if item.catatan}
					<div class="flex gap-2">
						<span class="w-20 shrink-0 text-muted-foreground">Catatan</span>
						<span>{item.catatan}</span>
					</div>
				{/if}
				{#if catatanFooter}
					{@render catatanFooter(item)}
				{/if}
			</Card.Content>
			{#if cardAction}
				<Card.Footer>
					{@render cardAction(item)}
				</Card.Footer>
			{/if}
		</Card.Root>
	{/each}
</div>

<!-- Desktop: Table -->
<div class="hidden md:block">
	<Table.Root>
		<Table.Caption>{caption}</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head>Kode</Table.Head>
				<Table.Head>Tipe</Table.Head>
				<Table.Head>Jenis</Table.Head>
				<Table.Head>Sohibul</Table.Head>
				<Table.Head>Pengawas</Table.Head>
				<Table.Head>Catatan</Table.Head>
				{#if extraHeader}
					{@render extraHeader()}
				{/if}
				{#if tableAction}
					<Table.Head class="text-center">{actionHeader}</Table.Head>
				{/if}
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each items as item (item.id)}
				<Table.Row>
					<Table.Cell class="font-medium">{item.kodeHewan}</Table.Cell>
					<Table.Cell class="capitalize">{item.tipe}</Table.Cell>
					<Table.Cell class="capitalize">{item.jenisHewan}</Table.Cell>
					<Table.Cell>
						<div class="flex flex-col gap-0.5">
							{#each item.namaSohibul as nama}
								<span class="text-sm">{nama}</span>
							{/each}
						</div>
					</Table.Cell>
					<Table.Cell>{item.pengawasNama}</Table.Cell>
					<Table.Cell class="text-sm text-muted-foreground">{item.catatan || '-'}</Table.Cell>
					{#if extraCell}
						{@render extraCell(item)}
					{/if}
					{#if tableAction}
						<Table.Cell class="text-center">
							{@render tableAction(item)}
						</Table.Cell>
					{/if}
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
{/if}
