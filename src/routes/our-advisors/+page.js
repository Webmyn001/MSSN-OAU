/**
 * Loads the advisor data for the page.
 * @param {object} params
 * @param {typeof fetch} params.fetch - The fetch function provided by SvelteKit.
 * @returns {Promise<import('../api/v1/advisors/+server').AdvisorsPayload | { error: string, sessions: import('../api/v1/advisors/+server').AdvisorSessionData[] }>}
 * The advisor data or an error object with a default empty sessions structure.
 */
export const load = async ({ fetch }) => {
    try {
        const response = await fetch("/api/v1/advisors");

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API request for advisors failed with status ${response.status}: ${errorText}`);
            return { 
                error: `Failed to load advisor data. Status: ${response.status}. ${errorText || response.statusText}`.trim(),
                sessions: [] // Provide default empty structure
            };
        }

        /** @type {import('../api/v1/advisors/+server').AdvisorsPayload} */
        const apiResult = await response.json();

        if (apiResult.status && apiResult.data && Array.isArray(apiResult.data.sessions)) {
            // Successfully fetched and API reported success
            return apiResult.data; // This will be { sessions: [...] }
        } else {
            const message = apiResult.message || "Advisor data not available or invalid.";
            console.error(`API for advisors returned unsuccessful status or invalid data: ${message}`);
            return { 
                error: message,
                sessions: [] // Provide default empty structure
            };
        }

    } catch (e) {
        console.error("Error in load function while fetching advisors:", e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while fetching data.";
        return { 
            error: `Could not retrieve advisor data: ${errorMessage}`,
            sessions: [] // Provide default empty structure
        };
    }
};