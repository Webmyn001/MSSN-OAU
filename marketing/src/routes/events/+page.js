// * Use mocked data directly (no server-side fetching)
import { mockEvents } from "$lib/mocks/data.js";

export const load = async () => {
    return mockEvents;
}