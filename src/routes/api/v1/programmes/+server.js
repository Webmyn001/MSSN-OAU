import {json} from "@sveltejs/kit";
import {getPantry} from "$lib/utils/pantry.server.js";
import {redis} from "$lib/utils/redis.server.js";

/**
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const GET = async ({ setHeaders }) => {
    try {
        const cached = await redis.get("programmes")
        if (cached) {
            
            return json({
                status: true,
                data: {
                    programmes: JSON.parse(cached).programmes
                }
            })
        }
        
        const req = await getPantry("programmes")
        if (req && req.programmes) {
            const ttl = await redis.ttl("programmes")
            setHeaders({
                "cache-control": `max-age=${ttl}`,
            });
            redis.set("programmes", JSON.stringify(req), "EX", 300)
        }
        return json({
            status: true,
            data: {
                programmes: req.programmes
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