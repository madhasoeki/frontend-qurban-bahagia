<script lang="ts">
	import { page } from '$app/stores';
	import EmptyState from '$lib/components/empty-state.svelte';
	import { IconAlertTriangle, IconLock, IconError404 } from '@tabler/icons-svelte';

	const statusCode = $derived($page.status);
	const message = $derived($page.error?.message ?? 'Terjadi kesalahan');

	const config = $derived.by(() => {
		switch (statusCode) {
			case 403:
				return {
					icon: IconLock,
					title: 'Akses Ditolak',
					description: 'Kamu tidak memiliki izin untuk mengakses halaman ini.',
				};
			case 404:
				return {
					icon: IconError404,
					title: 'Halaman Tidak Ditemukan',
					description: 'Halaman yang kamu cari tidak ada atau sudah dipindahkan.',
				};
			default:
				return {
					icon: IconAlertTriangle,
					title: `Error ${statusCode}`,
					description: message,
				};
		}
	});
</script>

<svelte:head>
	<title>{config.title} | Qurban Bahagia</title>
</svelte:head>

<div class="flex min-h-[60vh] items-center justify-center p-4">
	<EmptyState
		icon={config.icon}
		title={config.title}
		description={config.description}
		actionLabel="Kembali ke Dashboard"
		actionHref="/dashboard"
	/>
</div>
