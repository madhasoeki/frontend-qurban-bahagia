<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import EmptyState from '$lib/components/empty-state.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { updateKantongDistribusi } from '$lib/api/distribusi';
	import { invalidateAll } from '$app/navigation';
	import type { DistribusiUser } from '$lib/types/distribusi';
	import { IconEdit, IconMinus, IconPlus, IconCubeSend, IconRefresh } from '@tabler/icons-svelte';

	let { data } = $props();

	let role = $derived(data.role);
	let myUserId = $derived(data.userId);
	let distribusiList = $derived(data.distribusi as DistribusiUser[]);

	// --- Admin State ---
	let dialogOpen = $state(false);
	let selectedUser = $state<DistribusiUser | null>(null);
	let inputPenambahan = $state<number | string>('');
	let actionLoading = $state(false);

	function openUpdateDialog(user: DistribusiUser) {
		selectedUser = user;
		inputPenambahan = '';
		dialogOpen = true;
	}

	async function handleAdminUpdate() {
		if (!selectedUser) return;
		const val = Number(inputPenambahan);
		if (isNaN(val)) return;

		actionLoading = true;
		try {
			await updateKantongDistribusi(selectedUser.userId, val);
			dialogOpen = false;
			await invalidateAll();
		} catch (e) {
			alert('Gagal update data distribusi');
		} finally {
			actionLoading = false;
		}
	}

	// --- Distribusi State ---
	let manualInput = $state<number | string>('');
	let manualDialogOpen = $state(false);
	let manualMode = $state<'kurangi' | 'tambah'>('tambah');

	$effect(() => {
		if (manualDialogOpen) manualInput = '';
	});

	async function handlePanitiaUpdate(val: number) {
		if (isNaN(val) || val === 0) return;
		actionLoading = true;
		try {
			await updateKantongDistribusi(myUserId, val);
			manualInput = '';
			await invalidateAll();
		} catch (e) {
			alert('Gagal update data distribusi');
		} finally {
			actionLoading = false;
		}
	}

	function submitManualDialog() {
		const val = Number(manualInput);
		if (isNaN(val) || val === 0) return;
		const signedVal = manualMode === 'kurangi' ? -Math.abs(val) : Math.abs(val);
		manualDialogOpen = false;
		handlePanitiaUpdate(signedVal);
	}
</script>

{#if role === 'admin'}
	<div class="mb-6">
		<h1 class="text-2xl font-bold tracking-tight">Rekap Distribusi</h1>
		<p class="text-muted-foreground">Pantau jumlah kantong daging yang didistribusikan oleh panitia.</p>
	</div>

	<div class="rounded-md border bg-card overflow-hidden">
		<Table.Root>
			<Table.Header>
				<Table.Row class="bg-muted/50">
					<Table.Head>Nama Panitia</Table.Head>
					<Table.Head>Username</Table.Head>
					<Table.Head class="text-right">Jumlah Kantong</Table.Head>
					<Table.Head class="text-center w-[100px]">Aksi</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each distribusiList as item}
					<Table.Row>
						<Table.Cell class="font-medium">{item.user?.namaLengkap}</Table.Cell>
						<Table.Cell class="text-muted-foreground">@{item.user?.username}</Table.Cell>
						<Table.Cell class="text-right text-lg font-bold">{item.jumlahKantong}</Table.Cell>
						<Table.Cell class="text-center">
							<Button size="icon" variant="ghost" onclick={() => openUpdateDialog(item)}>
								<IconEdit class="h-4 w-4" />
							</Button>
						</Table.Cell>
					</Table.Row>
				{/each}
				{#if distribusiList.length === 0}
					<Table.Row>
						<Table.Cell colspan={4} class="p-0">
							<EmptyState title="Data masih kosong" description="Belum ada data distribusi yang bisa ditampilkan saat ini." />
						</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<Dialog.Root bind:open={dialogOpen}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Update Kantong Distribusi</Dialog.Title>
				<Dialog.Description>
					Masukkan nilai penambahan kantong untuk panitia <span class="font-bold text-foreground">{selectedUser?.user?.namaLengkap}</span>.
					Gunakan angka negatif (contoh: -5) jika ingin mengurangi jumlah kantong.
				</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<Label for="penambahan">Penambahan / Pengurangan</Label>
					<Input id="penambahan" type="number" bind:value={inputPenambahan} placeholder="Contoh: 10 atau -5" />
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => dialogOpen = false}>Batal</Button>
				<Button onclick={handleAdminUpdate} disabled={actionLoading}>
					{#if actionLoading}<Spinner class="mr-2" />{/if}
					{actionLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

{:else if role === 'distribusi'}
	{@const myData = distribusiList[0]}
	<div class="flex flex-col items-center justify-center min-h-[70vh] gap-8 p-4 relative pb-32">
		<!-- Main Card -->
		<Card.Root class="w-full max-w-sm text-center border-2 border-primary/20 shadow-xl relative overflow-hidden transition-all hover:border-primary/40">
			<!-- Decorative Background -->
			<div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
			<div class="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
			
			<Card.Header class="relative pb-2 z-10">
				<div class="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner">
					<IconCubeSend class="h-8 w-8 text-primary" />
				</div>
				<Card.Title class="text-2xl font-bold tracking-tight">Kantong Terdistribusi</Card.Title>
				<Card.Description class="text-base">Total daging yang telah Anda bagikan sejauh ini</Card.Description>
			</Card.Header>
			<Card.Content class="relative pt-6 pb-12 z-10">
				<div class="text-[6rem] font-black tracking-tighter text-primary leading-none drop-shadow-sm">
					{myData?.jumlahKantong ?? 0}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Floating Action Group -->
		<div class="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4">
			<div class="flex h-16 w-full max-w-sm items-center overflow-hidden rounded-full border bg-background shadow-2xl">
				<!-- Minus -->
				<Button
					variant="ghost"
					class="h-full flex-1 rounded-none hover:bg-destructive/10 hover:text-destructive"
					onclick={() => handlePanitiaUpdate(-1)}
					disabled={actionLoading}
				>
					{#if actionLoading}<Spinner class="h-6 w-6" />{:else}<IconMinus class="h-6 w-6" />{/if}
				</Button>

				<Separator orientation="vertical" class="h-8 shrink-0" />

				<div class="flex-1 h-full">
					<Dialog.Root bind:open={manualDialogOpen}>
						<Dialog.Trigger
							disabled={actionLoading}
							class="h-full w-full flex items-center justify-center gap-2 text-sm font-semibold hover:bg-muted transition-colors"
						>
							Manual
						</Dialog.Trigger>
						<Dialog.Content class="sm:max-w-[420px]">
						<Dialog.Header>
							<Dialog.Title>Input Manual</Dialog.Title>
							<Dialog.Description>
								Pilih mode lalu isi jumlah kantong yang akan diubah.
							</Dialog.Description>
						</Dialog.Header>
						<Tabs.Root bind:value={manualMode} class="mt-2">
							<Tabs.List class="grid w-full grid-cols-2">
								<Tabs.Trigger value="kurangi">Kurangi</Tabs.Trigger>
								<Tabs.Trigger value="tambah">Tambahkan</Tabs.Trigger>
							</Tabs.List>
							<Tabs.Content value="kurangi" class="pt-4">
								<div class="grid gap-2">
									<Label for="manual-kurangi">Jumlah</Label>
									<Input
										id="manual-kurangi"
										type="number"
										min="1"
										placeholder="Masukkan jumlah yang dikurangi"
										bind:value={manualInput}
										onkeydown={(e) => e.key === 'Enter' && submitManualDialog()}
										disabled={actionLoading}
									/>
								</div>
							</Tabs.Content>
							<Tabs.Content value="tambah" class="pt-4">
								<div class="grid gap-2">
									<Label for="manual-tambah">Jumlah</Label>
									<Input
										id="manual-tambah"
										type="number"
										min="1"
										placeholder="Masukkan jumlah yang ditambahkan"
										bind:value={manualInput}
										onkeydown={(e) => e.key === 'Enter' && submitManualDialog()}
										disabled={actionLoading}
									/>
								</div>
							</Tabs.Content>
						</Tabs.Root>
						<Dialog.Footer>
							<Button
								variant="outline"
								onclick={() => (manualDialogOpen = false)}
								disabled={actionLoading}
							>
								Batal
							</Button>
							<Button onclick={submitManualDialog} disabled={actionLoading}>
								{#if actionLoading}<Spinner class="mr-2" />{/if}
								{actionLoading ? 'Menyimpan...' : 'Simpan'}
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
					</Dialog.Root>
				</div>

				<Separator orientation="vertical" class="h-8 shrink-0" />

				<!-- Plus -->
				<Button
					variant="default"
					class="h-full flex-1 rounded-none"
					onclick={() => handlePanitiaUpdate(1)}
					disabled={actionLoading}
				>
					{#if actionLoading}<Spinner class="h-6 w-6" />{:else}<IconPlus class="h-6 w-6" />{/if}
				</Button>
			</div>
		</div>
	</div>
{/if}
