import {json} from "@sveltejs/kit";
import {getPantry} from "$lib/utils/pantry.server.js";

/**
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const GET = async () => {
    try {
        const req = await getPantry("programmes")
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