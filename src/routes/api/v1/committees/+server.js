import {json} from "@sveltejs/kit";
import {getPantry} from "$lib/utils/pantry.server.js";
import {redis} from "$lib/utils/redis.server.js";

/**
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const GET = async ({ setHeaders }) => {
    try {
        const cached = await redis.get("committees")
        if (cached) {
            return json({
                status: true,
                data: {
                    committees: JSON.parse(cached).committees
                }
            })
        }
        
        const req = await getPantry("committees")
        if (req && req.committees) {
            const ttl = await redis.ttl("committees")
            setHeaders({
                "cache-control": `max-age=${ttl}`,
            });
            redis.set("committees", JSON.stringify(req), "EX", 300)
        }
        return json({
            status: true,
            data: {
                committees: req.committees
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