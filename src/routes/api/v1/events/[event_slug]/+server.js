import { json } from "@sveltejs/kit";
import { getPantry } from "$lib/utils/pantry.server.js";
import { redis } from "$lib/utils/redis.server.js";

// Helper function to generate a slug from a title
/**
 * @param {string} title
 * @returns {string}
 */
function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
        .replace(/(^-|-$)+/g, ''); // Remove leading/trailing hyphens
}

/**
 * @typedef {Object} Event
 * @property {string} title - The title of the event.
 * @property {string} slug - The unique slug for the event.
 * @property {any} [image]
 * @property {string} [summary]
 * @property {boolean} [paid]
 * @property {string} [price]
 * @property {string} date
 * @property {string} [venue]
 * @property {string} [url]
 * @property {string} [host]
 * @property {string} [contact]
 * @property {string} [category]
 * @property {string[]} [tags]
 * @property {number} [capacity]
 * @property {string} [registration_deadline]
 * @property {string} [additional_details]
 */

/**
 * @typedef {Object} PantryEventsData
 * @property {Event[]} events
 */

/**
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const GET = async ({ params }) => {
    const { event_slug } = params;

    try {
        const cacheKey = "events"; // Cache all events
        /** @type {PantryEventsData | undefined} */
        let allEventsData;

        const cached = await redis.get(cacheKey);
        if (cached) {
            allEventsData = JSON.parse(cached);
        } else {
            /** @type {PantryEventsData | undefined} */
            const pantryData = /** @type {PantryEventsData | undefined} */ (await getPantry("events"));
            if (pantryData && pantryData.events) {
                allEventsData = pantryData;
                redis.set(cacheKey, JSON.stringify(allEventsData), "EX", 300); // Cache for 5 minutes
            } else {
                return json({
                    status: false,
                    message: "No events found in pantry."
                }, {
                    status: 404,
                });
            }
        }

        if (!allEventsData || !allEventsData.events) {
             return json({
                status: false,
                message: "Events data is not in the expected format."
            }, {
                status: 500,
            });
        }

        const event = allEventsData.events.find(
            /** @param {Event} e */
            e => e.slug === event_slug
        );

        if (event) {
            return json({
                status: true,
                data: {
                    event: event
                }
            });
        } else {
            return json({
                status: false,
                message: "Event not found."
            }, {
                status: 404,
            });
        }
    } catch (e) {
        console.error("Error fetching event:", e);
        const message = e instanceof Error ? e.message : "Something went wrong fetching the event.";
        return json({
            status: false,
            message: message
        }, {
            status: 500,
        });
    }
}; 