/**
 * Shared formatting utilities used across all operational pages.
 */

/**
 * Calculates and formats the duration between two ISO timestamps.
 * If `endIso` is null, uses `now` as the end time (live timer).
 */
export function formatDuration(
    startIso: string,
    endIso: string | null | undefined,
    now: number = Date.now()
): string {
    const start = new Date(startIso).getTime();
    const end = endIso ? new Date(endIso).getTime() : now;
    const diff = Math.max(0, end - start);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Formats an ISO timestamp to HH:MM:SS local time.
 */
export function formatWaktu(waktuIso: string | null | undefined): string {
    if (!waktuIso || waktuIso === '-') return '-';
    const date = new Date(waktuIso);
    return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
}

/**
 * Determines process status from start/end timestamps.
 */
export function getProcessStatus(
    start: string | null | undefined,
    end: string | null | undefined
): 'idle' | 'running' | 'done' {
    if (!start) return 'idle';
    if (!end) return 'running';
    return 'done';
}
