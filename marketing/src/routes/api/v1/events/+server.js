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

        const req = await getPantry("events")
        if (req && req.events) {
            let ttl = 60;
            try { ttl = await redis.ttl("events") } catch { }
            setHeaders({
                "cache-control": `max-age=${ttl}`,
            });
            try { await redis.set("events", JSON.stringify(req), "EX", 300) } catch { }
        }
        return json({
            status: true,
            data: {
                events: (req && req.events) ? req.events : exampleEvents.events
            }
        })
    } catch (e) {
        return json({
            status: true,
            data: { events: exampleEvents.events }
        }, { status: 200 })
    }
}