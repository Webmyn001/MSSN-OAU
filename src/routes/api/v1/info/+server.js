import {json} from "@sveltejs/kit";
import {getPantry} from "$lib/utils/pantry.server.js";
import {redis} from "$lib/utils/redis.server.js";

/**
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const GET = async ({ setHeaders }) => {
    try {
        const cached = await redis.get("info")
        if (cached) {
            
            return json({
                status: true,
                data: {
                    info: JSON.parse(cached)
                }
            })
        }
        
        const req = await getPantry("info")
        if (req) {
            const ttl = await redis.ttl("info")
            setHeaders({
                "cache-control": `max-age=${ttl}`,
            });
            redis.set("info", JSON.stringify(req), "EX", 300)
        }
        return json({
            status: true,
            data: {
                info: req
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