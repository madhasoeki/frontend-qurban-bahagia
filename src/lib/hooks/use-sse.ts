/**
 * Composable hook for Server-Sent Events (SSE) connection.
 * Must be called during component initialization.
 */
import { onMount, onDestroy } from 'svelte';
import { PUBLIC_API_URL } from '$env/static/public';

export function useHewanSSE(opts: {
    /** Called when an UPDATE_HEWAN event is received. Raw data from backend. */
    onHewanUpdate: (rawData: any) => void;
    /** Called when an UPDATE_DASHBOARD event is received. Optional. */
    onDashboardUpdate?: (data: any) => void;
}) {
    let eventSource: EventSource;

    onMount(() => {
        eventSource = new EventSource(`${PUBLIC_API_URL}/stream`);
        eventSource.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data);
                if (parsed.action === 'UPDATE_HEWAN') {
                    opts.onHewanUpdate(parsed.data);
                } else if (parsed.action === 'UPDATE_DASHBOARD' && opts.onDashboardUpdate) {
                    opts.onDashboardUpdate(parsed.data);
                }
            } catch (e) {
                console.error('Gagal parsing data SSE', e);
            }
        };
    });

    onDestroy(() => {
        eventSource?.close();
    });
}
