<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Field, FieldGroup, FieldLabel } from '$lib/components/ui/field/index.js';
	import { roleOptions, type User } from './user-columns';

	type Props = {
		user?: User;
		loading?: boolean;
		error?: string;
		onsubmit: (data: { namaLengkap: string; username: string; password: string; role: string }) => void;
		oncancel: () => void;
	};

	let { user, loading = false, error = '', onsubmit, oncancel }: Props = $props();

	let namaLengkap = $state('');
	let username = $state('');
	let password = $state('');
	let role = $state('');

	$effect(() => {
		namaLengkap = user?.namaLengkap ?? '';
		username = user?.username ?? '';
		role = user?.role ?? '';
	});

	function handleSubmit(e: Event) {
		e.preventDefault();
		onsubmit({
			namaLengkap: namaLengkap.trim(),
			username: username.trim().toLowerCase(),
			password,
			role: role.trim().toLowerCase()
		});
	}
</script>

<form class="grid gap-4" onsubmit={handleSubmit}>
	<FieldGroup>
		<Field>
			<FieldLabel>Nama Lengkap</FieldLabel>
			<Input type="text" bind:value={namaLengkap} required />
		</Field>
		<Field>
			<FieldLabel>Username</FieldLabel>
			<Input type="text" bind:value={username} required />
		</Field>
		<Field>
			<FieldLabel>Password</FieldLabel>
			<Input type="password" autocomplete="new-password" bind:value={password} />
		</Field>
		<Field>
			<FieldLabel>Role</FieldLabel>
			<Select.Root type="single" bind:value={role}>
				<Select.Trigger class="w-full justify-between">
					<span data-slot="select-value">{role || 'Pilih role'}</span>
				</Select.Trigger>
				<Select.Content>
					{#each roleOptions as option}
						<Select.Item value={option}>{option}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</Field>

		{#if error}
			<p class="text-sm text-red-500">{error}</p>
		{/if}

		<div class="flex justify-end gap-2">
			<Button type="button" variant="outline" onclick={oncancel} disabled={loading}>Batal</Button>
			<Button type="submit" disabled={loading}>
				{loading ? 'Menyimpan...' : 'Simpan'}
			</Button>
		</div>
	</FieldGroup>
</form>
