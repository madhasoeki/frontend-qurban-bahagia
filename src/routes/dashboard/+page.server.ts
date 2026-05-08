import { PUBLIC_API_URL } from '$env/static/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let summaryData: any = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hewanData: any[] = [];

    try {
        // 1. Fetch Summary
        const resSummary = await fetch(`${PUBLIC_API_URL}/dashboard/summary`);
        if (resSummary.ok) {
            const result = await resSummary.json();
            summaryData = result.data || {};
        } else {
            console.error('Gagal mengambil summary dashboard:', resSummary.status);
        }

        // 2. Fetch Hewan
        const resHewan = await fetch(`${PUBLIC_API_URL}/dashboard/hewan`);
        if (resHewan.ok) {
            const result = await resHewan.json();
            hewanData = result.data || [];
        } else {
            console.error('Gagal mengambil data hewan dashboard:', resHewan.status);
        }
    } catch (error) {
        console.error('Gagal melakukan fetch ke backend:', error);
    }

    return {
        initialScorecard: summaryData,
        initialTable: hewanData
    };
};
