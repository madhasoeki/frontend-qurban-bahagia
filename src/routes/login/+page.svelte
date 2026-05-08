<script lang="ts">
	import LoginForm from '$lib/components/login-form.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
	<div class="flex w-full max-w-sm flex-col gap-6">
		<a href="/" class="flex items-center gap-2 self-center font-medium">
			<img src="/full-logo.png" alt="Qurban Bahagia" class="h-20 object-contain" />
		</a>
		<LoginForm />
		<Button href="/dashboard" variant="outline" class="w-full">Buka Dashboard</Button>
	</div>
</div>
