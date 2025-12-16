// src/routes/api/v1/advisors/+server.js
import { json } from "@sveltejs/kit";
import { getPantry } from "$lib/utils/pantry.server.js"; // Adjust path if needed
import { redis } from "$lib/utils/redis.server.js";   // Adjust path if needed

const CACHE_KEY = "mssn_advisors_data";
const CACHE_TTL_SECONDS = 300; // 5 minutes

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ setHeaders }) => {
    try {
        const cachedData = await redis.get(CACHE_KEY);
        if (cachedData) {
            console.log("Serving advisors from cache");
            /** @type {PantryAdvisorsResponse} */ // Assuming types are in $lib/types.js
            const parsedCache = JSON.parse(cachedData);
            
            setHeaders({
                "cache-control": `public, max-age=${await redis.ttl(CACHE_KEY) || CACHE_TTL_SECONDS}`,
                "X-Cache": "HIT"
            });
            // The API should return the { sessions: [...] } part directly under `data`
            return json({
                status: true,
                data: { sessions: parsedCache.advisors.sessions }
            });
        }

        console.log("Fetching advisors from pantry");
        /** @type {PantryAdvisorsResponse | null} */
        const pantryResponse = await getPantry("advisors");

        if (pantryResponse && pantryResponse.advisors && Array.isArray(pantryResponse.advisors.sessions)) {
            await redis.set(CACHE_KEY, JSON.stringify(pantryResponse), "EX", CACHE_TTL_SECONDS);
            
            setHeaders({
                "cache-control": `public, max-age=${CACHE_TTL_SECONDS}`,
                "X-Cache": "MISS"
            });

            return json({
                status: true,
                data: { sessions: pantryResponse.advisors.sessions } // Return the sessions array directly
            });
        } else {
            // * Return empty array instead of error when API fails
            console.error("Pantry returned invalid or empty data for advisors:", pantryResponse);
            return json({
                status: true,
                data: { sessions: [] }
            }, { 
                status: 200
            });
        }

    } catch (e) {
        console.error("Error in /api/v1/advisors endpoint:", e);
        // * Return empty array instead of error when all APIs fail
        return json({
            status: true,
            data: { sessions: [] }
        }, {
            status: 200
        });
    }
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