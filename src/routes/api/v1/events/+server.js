import {json} from "@sveltejs/kit";
import {getPantry} from "$lib/utils/pantry.server.js";
import {redis} from "$lib/utils/redis.server.js";

/**
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const GET = async ({ setHeaders }) => {
    try {
        const cached = await redis.get("events")
        if (cached) {
            console.log("hit")
            return json({
                status: true,
                data: {
                    events: JSON.parse(cached).events
                }
            })
        }
        console.log("miss")
        const req = await getPantry("events")
        if (req && req.events) {
            const ttl = await redis.ttl("events")
            setHeaders({
                "cache-control": `max-age=${ttl}`,
            });
            redis.set("events", JSON.stringify(req), "EX", 300)
        }
        return json({
            status: true,
            data: {
                events: req.events
            }
        })
    } catch (e) {
        return json({
            status: false,
            message: e?.message ?? "Something went wrong"
        }, {
            statusCode: 500,
        })
    }
}