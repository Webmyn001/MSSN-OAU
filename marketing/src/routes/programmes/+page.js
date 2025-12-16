// * Use mocked data directly (no server-side fetching)
import { mockProgrammes } from "$lib/mocks/data.js";

export const load = async () => {
	return mockProgrammes;
}