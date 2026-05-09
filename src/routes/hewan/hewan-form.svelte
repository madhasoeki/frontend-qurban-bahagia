<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Field, FieldGroup, FieldLabel } from '$lib/components/ui/field/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { IconPlus, IconTrash } from '@tabler/icons-svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import {
		tipeOptions,
		jenisOptions,
		maxSohibul,
		type Hewan,
		type Pengawas
	} from './hewan-columns';

	type Props = {
		hewan?: Hewan;
		pengawas: Pengawas[];
		loading?: boolean;
		error?: string;
		onsubmit: (data: Omit<Hewan, 'id' | 'pengawasNama'>) => void;
		oncancel: () => void;
	};

	let { hewan, pengawas, loading = false, error = '', onsubmit, oncancel }: Props = $props();

	let kodeHewan = $state('');
	let tipe = $state<'qurban' | 'sedekah'>('qurban');
	let jenisHewan = $state<'sapi' | 'kambing'>('sapi');
	let namaSohibul = $state<string[]>(['']);
	let pengawasId = $state<string>('0');
	let catatan = $state('');

	$effect(() => {
		kodeHewan = hewan?.kodeHewan ?? '';
		tipe = hewan?.tipe ?? 'qurban';
		jenisHewan = hewan?.jenisHewan ?? 'sapi';
		namaSohibul = hewan?.namaSohibul?.length ? [...hewan.namaSohibul] : [''];
		pengawasId = String(hewan?.pengawasId ?? 0);
		catatan = hewan?.catatan ?? '';
	});

	// Kalau jenis berubah ke kambing, potong nama jadi 1
	$effect(() => {
		if (jenisHewan === 'kambing' && namaSohibul.length > 1) {
			namaSohibul = [namaSohibul[0]];
		}
	});

	const max = $derived(maxSohibul(jenisHewan));
	const canAddSohibul = $derived(namaSohibul.length < max);

	function addSohibul() {
		if (canAddSohibul) namaSohibul = [...namaSohibul, ''];
	}

	function removeSohibul(index: number) {
		namaSohibul = namaSohibul.filter((_, i) => i !== index);
	}

	function updateSohibul(index: number, value: string) {
		namaSohibul = namaSohibul.map((n, i) => (i === index ? value : n));
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		onsubmit({
			kodeHewan,
			tipe,
			jenisHewan,
			namaSohibul: [...namaSohibul],
			pengawasId: Number(pengawasId),
			catatan
		});
	}
</script>

<form onsubmit={handleSubmit}>
	<ScrollArea class="max-h-[60vh] md:max-h-none">
		<div class="grid gap-4 md:grid-cols-[1fr,1fr] md:gap-6 p-1">
			<!-- Kolom Kiri: Data Wajib -->
			<FieldGroup>
				<Field>
					<FieldLabel>Kode Hewan</FieldLabel>
					<Input type="text" bind:value={kodeHewan} placeholder="SAPI-001" required />
				</Field>

				<div class="grid grid-cols-2 gap-2">
					<Field>
						<FieldLabel>Tipe</FieldLabel>
						<Select.Root type="single" bind:value={tipe}>
							<Select.Trigger class="w-full justify-between">
								<span data-slot="select-value">{tipe || 'Pilih tipe'}</span>
							</Select.Trigger>
							<Select.Content>
								{#each tipeOptions as option}
									<Select.Item value={option}>{option}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</Field>

					<Field>
						<FieldLabel>Jenis Hewan</FieldLabel>
						<Select.Root type="single" bind:value={jenisHewan}>
							<Select.Trigger class="w-full justify-between">
								<span data-slot="select-value">{jenisHewan || 'Pilih jenis'}</span>
							</Select.Trigger>
							<Select.Content>
								{#each jenisOptions as option}
									<Select.Item value={option}>{option}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</Field>
				</div>

				<Field>
					<FieldLabel>Pengawas</FieldLabel>
					<Select.Root type="single" bind:value={pengawasId}>
						<Select.Trigger class="w-full justify-between">
							<span data-slot="select-value">
								{pengawas.find((p) => p.id === Number(pengawasId))?.username || 'Pilih pengawas'}
							</span>
						</Select.Trigger>
						<Select.Content>
							{#each pengawas as p}
								<Select.Item value={String(p.id)}>{p.username}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</Field>

				<Field>
					<FieldLabel>
						Nama Sohibul
						<span class="ml-1 text-xs text-muted-foreground">({namaSohibul.length}/{max})</span>
					</FieldLabel>
					<div class="grid gap-2">
						{#each namaSohibul as nama, i}
							<div class="flex gap-2">
								<Input
									type="text"
									value={nama}
									oninput={(e) => updateSohibul(i, (e.target as HTMLInputElement).value)}
									placeholder="Nama sohibul {i + 1}"
									required
								/>
								{#if namaSohibul.length > 1}
									<Button type="button" variant="outline" size="sm" onclick={() => removeSohibul(i)}>
										<IconTrash class="h-4 w-4" />
									</Button>
								{/if}
							</div>
						{/each}

						{#if canAddSohibul}
							<Button type="button" variant="outline" onclick={addSohibul}>
								<IconPlus class="mr-1 h-4 w-4" /> Tambah Nama
							</Button>
						{/if}
					</div>
				</Field>
			</FieldGroup>

			<!-- Kolom Kanan: Catatan -->
			<FieldGroup>
				<Field class="md:h-full md:flex md:flex-col">
					<FieldLabel>Catatan</FieldLabel>
					<Textarea
						class="flex min-h-[80px] md:flex-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="Catatan tambahan (opsional)"
						bind:value={catatan}
					></Textarea>
				</Field>
			</FieldGroup>
		</div>
	</ScrollArea>

	{#if error}
		<p class="text-sm text-red-500 mt-4">{error}</p>
	{/if}

	<div class="flex justify-end gap-2 mt-4">
		<Button type="button" variant="outline" onclick={oncancel} disabled={loading}>Batal</Button>
		<Button type="submit" disabled={loading}>
			{#if loading}<Spinner class="mr-2" />{/if}
			{loading ? 'Menyimpan...' : 'Simpan'}
		</Button>
	</div>
</form>
