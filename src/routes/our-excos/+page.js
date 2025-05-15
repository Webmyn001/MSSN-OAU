// JSDoc types you provided (keep them in this file or import them)
/**
 * Represents an individual executive member.
 * @typedef {object} ExecutiveMember
 * @property {string} id - The unique identifier for the member.
 * @property {string} name - The full name of the member.
 * @property {string} position - The position held by the member.
 * @property {string} photo - URL to the member's photo.
 * @property {string} phone - The member's phone number.
 * @property {string} email - The member's email address.
 */

/**
 * Represents a specific committee within an executive session.
 * @typedef {object} ExecutiveCommittee
 * @property {string} committee - The name of the committee.
 * @property {ExecutiveMember[]} members - An array of members belonging to this committee.
 */

/**
 * Represents the executive data for a single academic session.
 * @typedef {object} SessionData
 * @property {string} session - The academic session identifier.
 * @property {number} start_year - The starting year of the session.
 * @property {number} end_year - The ending year of the session.
 * @property {ExecutiveCommittee[]} executives - An array of executive committees for this session.
 */

/**
 * Represents the main data structure containing all executive sessions.
 * @typedef {object} ExcosData
 * @property {SessionData[]} sessions - An array of academic sessions, each containing executive information.
 */

/**
 * This is the structure expected within the `data` field of the API's response envelope.
 * @typedef {object} ExcosPayload
 * @property {ExcosData} excos - The main data object containing session-wise executive information.
 */

/**
 * Represents the overall envelope of the API response from /api/v1/excos.
 * @template T The type of the data payload.
 * @typedef {object} ApiEnvelope
 * @property {boolean} status - Indicates if the API call was successful on the server side.
 * @property {T} [data] - The data payload if status is true.
 * @property {string} [message] - An error message if status is false or if there's an issue.
 */


/**
 * Loads the executive data for the page.
 * @param {object} params
 * @param {typeof fetch} params.fetch - The fetch function provided by SvelteKit.
 * @returns {Promise<ExcosPayload | { error: string }>} The executive data or an error object.
 */
export const load = async ({ fetch }) => {
    try {
        const response = await fetch("/api/v1/excos");

        if (!response.ok) {
            // Handle HTTP errors (e.g., 404, 500 from the API endpoint itself)
            const errorText = await response.text(); // Try to get more error info
            console.error(`API request failed with status ${response.status}: ${errorText}`);
            // For SvelteKit, throwing an error here is usually handled by an error page.
            // If you want to return data for the page to display an error:
            return { 
                error: `Failed to load executive data. Status: ${response.status}. ${errorText || response.statusText}`.trim(),
                excos: { sessions: [] } // Provide a default empty structure
            };
            // Or, more typically in SvelteKit, throw to use the nearest +error.svelte:
            // import { error } from '@sveltejs/kit';
            // throw error(response.status, `Failed to load executive data: ${errorText || response.statusText}`);
        }

        /** @type {ApiEnvelope<ExcosPayload>} */
        const apiResult = await response.json();

        if (apiResult.status && apiResult.data && apiResult.data.excos) {
            // Successfully fetched and API reported success
            return apiResult.data; // This will be { excos: { sessions: [...] } }
        } else {
            // API reported failure (e.g., status: false) or data is malformed
            const message = apiResult.message || "Executive data not available or invalid.";
            console.error(`API returned unsuccessful status or invalid data: ${message}`);
            return { 
                error: message,
                excos: { sessions: [] } // Provide a default empty structure
            };
            // Or throw:
            // import { error } from '@sveltejs/kit';
            // throw error(500, `Failed to process executive data: ${message}`);
        }

    } catch (e) {
        // Handle network errors or other unexpected issues during fetch/JSON parsing
        console.error("Error in load function while fetching excos:", e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while fetching data.";
        return { 
            error: `Could not retrieve executive data: ${errorMessage}`,
            excos: { sessions: [] } // Provide a default empty structure
        };
        // Or throw:
        // import { error } from '@sveltejs/kit';
        // throw error(500, `Could not retrieve executive data: ${errorMessage}`);
    }
};