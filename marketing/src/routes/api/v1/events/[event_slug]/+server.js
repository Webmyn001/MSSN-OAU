import { json } from "@sveltejs/kit";
import { mockEvents } from "$lib/mocks/data.js";
import slugify from "$lib/utils/slugify.js";

/**
 * * Returns mocked event by slug (client-side data, no external APIs)
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const GET = async ({ params }) => {
    const { event_slug } = params;

    // * Find event by matching slug
    const event = mockEvents.events.find(e => {
        const eventSlug = slugify(e.title);
        return eventSlug === event_slug;
    });

    if (event) {
        return json({
            status: true,
            data: {
                event: {
                    ...event,
                    slug: slugify(event.title)
                }
            }
        });
    }

    // * Return 404 if event not found
    return json({
        status: false,
        error: "Event not found",
        message: `No event found with slug: ${event_slug}`
    }, {
        status: 404
    });
}; 