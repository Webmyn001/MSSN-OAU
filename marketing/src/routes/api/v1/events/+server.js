import { json } from "@sveltejs/kit";
import { getPantry } from "$lib/utils/pantry.server.js";
import { redis } from "$lib/utils/redis.server.js";
import { exampleEvents } from "$lib/examples/events.js";

/**
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const GET = async ({ setHeaders }) => {
    try {
        let cached = null;
        try { cached = await redis.get("events"); } catch { }
        if (cached) {

            return json({
                status: true,
                data: {
                    events: JSON.parse(cached).events
                }
            })
        }

        // * Try to fetch from Pantry, but don't fail if it's unavailable
        let req = null;
        try {
            req = await getPantry("events");
        } catch (error) {
            console.error("Error fetching events from Pantry:", error);
        }

        if (req && req.events) {
            let ttl = 60;
            try { ttl = await redis.ttl("events") } catch { }
            setHeaders({
                "cache-control": `max-age=${ttl}`,
            });
            try { await redis.set("events", JSON.stringify(req), "EX", 300) } catch { }
        }
        
        // * Return empty array instead of example data when API fails
        return json({
            status: true,
            data: {
                events: (req && req.events) ? req.events : []
            }
        })
    } catch (e) {
        console.error("Error in events API endpoint:", e);
        // * Return empty array instead of example data when all APIs fail
        return json({
            status: true,
            data: { events: [] }
        }, { status: 200 })
    }
}