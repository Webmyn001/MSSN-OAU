import {json} from "@sveltejs/kit";
import {redis} from "$lib/utils/redis.server.js";
import {programmes} from "$lib/data/programmes";

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
        
        // Use local data instead of fetching from Pantry
        const data = {programmes};
        
        // Cache the data
        const ttl = 300; // 5 minutes
        setHeaders({
            "cache-control": `max-age=${ttl}`,
        });
        await redis.set("programmes", JSON.stringify(data), "EX", ttl);
        
        return json({
            status: true,
            data: {
                programmes: data.programmes
            }
        })
    } catch (e) {
        console.error("Error in programmes API endpoint:", e);
        // * Return empty array instead of error when API fails
        return json({
            status: true,
            data: {
                programmes: []
            }
        }, { status: 200 })
    }
}