import { loadHewanPage } from '$lib/server/load-hewan';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => loadHewanPage(event);