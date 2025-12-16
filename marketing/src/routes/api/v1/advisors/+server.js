import { json } from "@sveltejs/kit";
import { mockAdvisors } from "$lib/mocks/data.js";

/**
 * * Returns mocked advisors (client-side data, no external APIs)
 * @type {import('./$types').RequestHandler}
 */
export const GET = async ({ setHeaders }) => {
	setHeaders({
		"cache-control": "public, max-age=3600",
	});

	return json({
		status: true,
		data: { sessions: mockAdvisors.advisors.sessions }
	});
};

/**
 * @typedef {object} AdvisorSocials
 * @property {string} [whatsapp] - WhatsApp number (e.g., "2348031234567").
 * @property {string} [linkedin] - LinkedIn profile URL.
 */

/**
 * @typedef {object} Advisor
 * @property {string} id - Unique identifier for the advisor (e.g., "amina-bello-2425").
 * @property {string} name - Full name of the advisor.
 * @property {string} title - Title (e.g., "Dr.", "Prof.").
 * @property {string} position - Position held (e.g., "Chief Adviser").
 * @property {string} department - Academic department.
 * @property {string} phone - Phone number.
 * @property {string} email - Email address.
 * @property {string} photo - URL to the advisor's photo.
 * @property {string} summary - A brief summary or bio of the advisor.
 * @property {AdvisorSocials} socials - Social media links.
 */

/**
 * @typedef {object} AdvisorSessionData
 * @property {string} id - Unique identifier for the session (e.g., "2024-2025").
 * @property {string} label - Display label for the session (e.g., "2024/2025").
 * @property {number} start_year - Starting year of the session.
 * @property {number} end_year - Ending year of the session.
 * @property {Advisor[]} advisors - An array of advisors for this session.
 */

/**
 * Represents the structure of the "advisors" data as stored in the pantry
 * and returned by getPantry("advisors").
 * @typedef {object} PantryAdvisorsResponse
 * @property {{ sessions: AdvisorSessionData[] }} advisors - The main advisors data object.
 */

// ---- Types for the API Endpoint and Load Function ----

/**
 * This is the structure of the `data` field in the API response for advisors.
 * It directly contains the sessions array.
 * @typedef {object} AdvisorsPayload
 * @property {AdvisorSessionData[]} sessions - An array of advisor sessions.
 */

/**
 * Represents the overall envelope of the API response from /api/v1/advisors.
 * @template T The type of the data payload.
 * @typedef {object} ApiEnvelope
 * @property {boolean} status - Indicates if the API call was successful on the server side.
 * @property {T} [data] - The data payload if status is true.
 * @property {string} [message] - An error message if status is false or if there's an issue.
 */