// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}

		// Helper interface for the 'info' object within PageData
		interface SiteInfo {
			maintenance?: boolean;
			maintenance_starts?: string;
			maintenance_ends?: string;
			maintenance_message?: string;
			account?: Record<string, any>; // Example: from data.info?.account
			// [key: string]: any; // Temporarily removed for simplicity
		}

		interface PageData {
			info: SiteInfo; // The main 'info' object from the API
			events?: any[];  // From fallback data in +layout.js
			posts?: any[];   // From fallback data in +layout.js
		}

		// interface PageState {}
		// interface Platform {}
	}
}

export {}; // Ensures this is treated as a module
