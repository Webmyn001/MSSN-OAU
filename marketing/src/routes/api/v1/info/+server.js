import { json } from "@sveltejs/kit";
import { getPantry } from "$lib/utils/pantry.server.js";
import { redis } from "$lib/utils/redis.server.js";
import { exampleInfo } from "$lib/examples/info.js";

/**
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const GET = async ({ setHeaders }) => {
    try {
        let cached = null;
        try { cached = await redis.get("info"); } catch { }
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
            let ttl = 60;
            try { ttl = await redis.ttl("info") } catch { }
            setHeaders({
                "cache-control": `max-age=${ttl}`,
            });
            try { await redis.set("info", JSON.stringify(req), "EX", 300) } catch { }
        }
        return json({
            status: true,
            data: {
                info: req ?? exampleInfo
            }
        })
    } catch (e) {
        return json({
            status: true,
            data: { info: exampleInfo }
        }, { status: 200 })
    }
}