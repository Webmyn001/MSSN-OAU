// * Use mocked data directly (no server-side fetching)
import { mockCommittees } from "$lib/mocks/data.js";

export const load = async () => {
    return mockCommittees;
} 