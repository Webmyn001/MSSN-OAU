import { json } from "@sveltejs/kit";
import { mockInfo } from "$lib/mocks/data.js";

/**
 * * Returns mocked site info (client-side data, no external APIs)
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const GET = async ({ setHeaders }) => {
	setHeaders({
		"cache-control": "public, max-age=3600",
	});

	return json({
		status: true,
		data: {
			info: mockInfo
		}
	});
}