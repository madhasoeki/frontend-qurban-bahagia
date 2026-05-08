<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { FieldGroup, Field, FieldLabel } from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { IconEye, IconEyeOff } from '@tabler/icons-svelte';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import { login } from '$lib/api/auth';
	import { goto, invalidateAll } from '$app/navigation';

	let { class: className, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
	const id = $props.id();

	let username = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	let showPassword = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			await login(username, password);
			await invalidateAll();
			goto('/dashboard'); // redirect ke dashboard setelah login
		} catch (err) {
			error = err instanceof Error ? err.message : 'Login gagal';
		} finally {
			loading = false;
		}
	}
</script>

<div class={cn('flex flex-col gap-6', className)} {...restProps}>
	<Card.Root>
		<Card.Header class="text-center">
			<Card.Title class="text-xl">Silahkan Login</Card.Title>
			<Card.Description>Login dengan akun yang sudah disediakan admin</Card.Description>
		</Card.Header>
		<Card.Content>
			<form onsubmit={handleSubmit}>
				<FieldGroup>
					<Field>
						<FieldLabel for="username-{id}">Username</FieldLabel>
						<Input
							id="username-{id}"
							type="text"
							placeholder="Username"
							required
							bind:value={username}
						/>
					</Field>
					<Field>
						<FieldLabel for="password-{id}">Password</FieldLabel>
						<InputGroup.Root>
							<InputGroup.Input
								id="password-{id}"
								type={showPassword ? 'text' : 'password'}
								placeholder="Password"
								required
								bind:value={password}
							/>
							<InputGroup.Button
								variant="ghost"
								size="icon-sm"
								type="button"
								onclick={() => (showPassword = !showPassword)}
								aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
								aria-pressed={showPassword}
							>
								{#if showPassword}
									<IconEyeOff class="h-4 w-4" />
								{:else}
									<IconEye class="h-4 w-4" />
								{/if}
							</InputGroup.Button>
						</InputGroup.Root>
					</Field>

					{#if error}
						<p class="text-sm text-red-500">{error}</p>
					{/if}

					<Field>
						<Button type="submit" disabled={loading}>
							{loading ? 'Loading...' : 'Login'}
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</Card.Content>
	</Card.Root>
</div>
