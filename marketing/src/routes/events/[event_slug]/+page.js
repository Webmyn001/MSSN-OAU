// * Use mocked data directly (no server-side fetching)
import { mockEvents } from "$lib/mocks/data.js";
import slugify from "$lib/utils/slugify.js";

export async function load({ params }) {
    // * Find event by matching slug
    const event = mockEvents.events.find(e => {
        const eventSlug = slugify(e.title);
        return eventSlug === params.event_slug;
    });

    if (event) {
        return {
            event: {
                ...event,
                slug: slugify(event.title)
            },
            status: 200
        };
    }

    return {
        status: 404,
        error: new Error("Event not found")
    };
} 