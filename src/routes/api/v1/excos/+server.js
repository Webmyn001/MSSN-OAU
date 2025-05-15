import { json } from "@sveltejs/kit";
import { getPantry } from "$lib/utils/pantry.server.js"; // Assuming this path is correct
import { redis } from "$lib/utils/redis.server.js";   // Assuming this path is correct

/**
 * Represents the data structure for executive sessions as stored and returned.
 * @typedef {object} ExcosData
 * @property {Array<{
 *   session: string,
 *   start_year: number,
 *   end_year: number,
 *   executives: Array<{
 *     committee: string,
 *     members: Array<{
 *       id: string,
 *       name: string,
 *       position: string,
 *       photo: string,
 *       phone: string,
 *       email: string
 *     }>
 *   }>
 * }>} sessions - An array of academic sessions.
 */

/**
 * Represents the overall API response structure from the pantry or for the API.
 * @typedef {object} PantryExcosResponse
 * @property {ExcosData} excos - The main data object containing session-wise executive information.
 */


/**
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const GET = async ({ setHeaders }) => {
    const cacheKey = "excos";
    const cacheTTL = 300; // Time-to-live for cache in seconds (5 minutes)

    try {
        const cachedData = await redis.get(cacheKey);

        if (cachedData) {
            console.log("Serving excos from cache");
            /** @type {PantryExcosResponse} */
            const parsedCache = JSON.parse(cachedData);
            setHeaders({
                "cache-control": `public, max-age=${await redis.ttl(cacheKey) || cacheTTL}`, // Use remaining TTL or fallback
                "X-Cache": "HIT"
            });
            return json({
                status: true,
                data: parsedCache // Return the full structure from cache
            });
        }

        console.log("Fetching excos from pantry");
        /** @type {PantryExcosResponse | null} */
        const pantryResponse = await getPantry("excos");

        if (pantryResponse && pantryResponse.excos && Array.isArray(pantryResponse.excos.sessions)) {
            await redis.set(cacheKey, JSON.stringify(pantryResponse), "EX", cacheTTL);
            
            setHeaders({
                "cache-control": `public, max-age=${cacheTTL}`,
                "X-Cache": "MISS"
            });

            return json({
                status: true,
                data: pantryResponse // Return the full structure from pantry
            });
        } else {
            // Handle cases where pantry might return null, undefined, or unexpected structure
            console.error("Pantry returned invalid or empty data for excos:", pantryResponse);
            return json({
                status: false,
                message: "Failed to retrieve valid executive data from the source."
            }, { 
                status: 502 // Bad Gateway, as our upstream service (Pantry) failed
            });
        }

    } catch (e) {
        console.error("Error in /excos API endpoint:", e);
        const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
        return json({
            status: false,
            message: errorMessage
        }, {
            status: 500 // Internal Server Error
        });
    }
};