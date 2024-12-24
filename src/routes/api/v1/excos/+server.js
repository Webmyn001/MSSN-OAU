import {json} from "@sveltejs/kit";
import {getPantry} from "$lib/utils/pantry.server.js";
import {redis} from "$lib/utils/redis.server.js";

/**
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const GET = async ({ setHeaders }) => {
    try {
        const cached = await redis.get("excos")
        if (cached) {
            console.log("hit")
            return json({
                status: true,
                data: {
                    sessions: JSON.parse(cached).sessions
                }
            })
        }
        console.log("miss")
        const req = await getPantry("excos")
        if (req && req.sessions) {
            const ttl = await redis.ttl("excos")
            setHeaders({
                "cache-control": `max-age=${ttl}`,
            });
            redis.set("excos", JSON.stringify(req), "EX", 300)
        }
        return json({
            status: true,
            data: {
                sessions: req.sessions
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