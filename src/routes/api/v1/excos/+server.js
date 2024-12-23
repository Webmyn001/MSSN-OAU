import {json} from "@sveltejs/kit";
import {getPantry} from "$lib/utils/pantry.server.js";

/**
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const GET = async () => {
    try {
        const req = await getPantry("excos")
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