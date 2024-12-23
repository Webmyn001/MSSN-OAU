import {json} from "@sveltejs/kit";

/**
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const GET = async () => {
    try {
        return json({
            status: true,
            message: "alive and kicking 💪"
        })
    } catch (e) {
        return json({
            status: false,
            message: e?.message ?? "Something went wrong. Call the devs! Or maybe just send snacks. 🍕"
        }, {
            statusCode: 500,
        })
    }
}