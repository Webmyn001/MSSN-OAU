import { json } from "@sveltejs/kit";
import { mockProgrammes } from "$lib/mocks/data.js";

/**
 * * Returns mocked programmes (client-side data, no external APIs)
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const GET = async ({ setHeaders }) => {
	setHeaders({
		"cache-control": "public, max-age=3600",
	});

	return json({
		status: true,
		data: {
			programmes: mockProgrammes.programmes
		}
	});
}