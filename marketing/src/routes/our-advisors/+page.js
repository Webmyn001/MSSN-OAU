// * Use mocked data directly (no server-side fetching)
import { mockAdvisors } from "$lib/mocks/data.js";

/**
 * Loads the advisor data for the page.
 * @returns {Promise<{ sessions: import('../api/v1/advisors/+server').AdvisorSessionData[] }>}
 * The advisor data with sessions array.
 */
export const load = async () => {
    return {
        sessions: mockAdvisors.advisors.sessions
    };
};