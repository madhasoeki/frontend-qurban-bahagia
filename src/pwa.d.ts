declare module 'virtual:pwa-info' {
	import type { PwaInfo } from 'vite-plugin-pwa/info';
	const pwaInfo: PwaInfo;
	export { pwaInfo };
}

declare module 'virtual:pwa-register' {
	import type { RegisterSWOptions } from 'vite-plugin-pwa/types';
	export type { RegisterSWOptions };
	export function registerSW(
		options?: RegisterSWOptions
	): (reloadPage?: boolean) => Promise<void>;
}
