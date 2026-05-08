<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
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

	function submitManual() {
		const val = Number(manualInput);
		if (!isNaN(val) && val !== 0) {
			handlePanitiaUpdate(val);
		}
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
						<Table.Cell colspan={4} class="text-center py-8 text-muted-foreground">
							Belum ada data distribusi
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
		<div class="fixed bottom-8 left-0 right-0 px-4 flex justify-center z-50">
			<ButtonGroup.Root class="w-full max-w-sm h-16 shadow-2xl rounded-full overflow-hidden bg-background border">
				<Button 
					variant="ghost" 
					class="h-full w-[25%] text-2xl hover:bg-destructive/10 hover:text-destructive rounded-none"
					onclick={() => handlePanitiaUpdate(-1)}
					disabled={actionLoading}
				>
					<IconMinus class="h-8 w-8" />
				</Button>
				
				<div class="h-full w-[50%] relative flex">
					<Input 
						type="number" 
						class="h-full w-full text-center text-2xl font-bold rounded-none border-y-0 border-x focus-visible:ring-0 focus-visible:ring-offset-0 px-2" 
						placeholder="Manual" 
						bind:value={manualInput}
						onkeydown={(e) => e.key === 'Enter' && submitManual()}
						disabled={actionLoading}
					/>
					<!-- Manual Submit Button (shows when typing) -->
					{#if String(manualInput).length > 0}
						<Button 
							size="icon" 
							variant="default"
							class="absolute right-1.5 top-1.5 bottom-1.5 w-10 h-auto rounded-full shadow-md animate-in fade-in zoom-in"
							onclick={submitManual}
						>
							<IconRefresh class="h-5 w-5" />
						</Button>
					{/if}
				</div>

				<Button 
					variant="default" 
					class="h-full w-[25%] text-2xl rounded-none"
					onclick={() => handlePanitiaUpdate(1)}
					disabled={actionLoading}
				>
					<IconPlus class="h-8 w-8" />
				</Button>
			</ButtonGroup.Root>
		</div>
	</div>
{/if}
