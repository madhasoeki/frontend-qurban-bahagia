<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { IconInbox } from '@tabler/icons-svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		icon?: any;
		title?: string;
		description?: string;
		actionLabel?: string;
		actionHref?: string;
		onaction?: () => void;
		children?: Snippet;
		class?: string;
	};

	let {
		icon: Icon = IconInbox,
		title = 'Data masih kosong',
		description = 'Belum ada data yang bisa ditampilkan saat ini.',
		actionLabel,
		actionHref,
		onaction,
		children,
		class: className,
	}: Props = $props();
</script>

<Empty.Root class={className}>
	<Empty.Header>
		<Empty.Media variant="icon">
			<Icon />
		</Empty.Media>
		<Empty.Title>{title}</Empty.Title>
		<Empty.Description>{description}</Empty.Description>
	</Empty.Header>
	{#if children}
		<Empty.Content>
			{@render children()}
		</Empty.Content>
	{:else if actionLabel}
		<Empty.Content>
			{#if actionHref}
				<Button href={actionHref} variant="outline" size="sm">{actionLabel}</Button>
			{:else if onaction}
				<Button variant="outline" size="sm" onclick={onaction}>{actionLabel}</Button>
			{/if}
		</Empty.Content>
	{/if}
</Empty.Root>
