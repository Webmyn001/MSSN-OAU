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

        // * Try to fetch from Pantry, but don't fail if it's unavailable
        let req = null;
        try {
            req = await getPantry("info");
        } catch (error) {
            console.error("Error fetching info from Pantry:", error);
        }

        if (req) {
            let ttl = 60;
            try { ttl = await redis.ttl("info") } catch { }
            setHeaders({
                "cache-control": `max-age=${ttl}`,
            });
            try { await redis.set("info", JSON.stringify(req), "EX", 300) } catch { }
        }
        
        // * Return empty object instead of example data when API fails
        return json({
            status: true,
            data: {
                info: req ?? {}
            }
        })
    } catch (e) {
        console.error("Error in info API endpoint:", e);
        // * Return empty object instead of example data when all APIs fail
        return json({
            status: true,
            data: { info: {} }
        }, { status: 200 })
    }
}