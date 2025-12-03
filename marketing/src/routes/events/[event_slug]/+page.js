export async function load({ params, fetch }) {
    try {
        const response = await fetch(`/api/v1/events/${params.event_slug}`);
        if (!response.ok) {
            const errorData = await response.json();
            return {
                status: response.status,
                error: new Error(errorData.message || `Failed to fetch event: ${response.statusText}`)
            };
        }

        const result = await response.json();

        if (result.status && result.data && result.data.event) {
            return {
                event: result.data.event,
                status: 200 // Explicitly set status for success
            };
        } else {
            return {
                status: result.status === false ? 404 : 500, // If API says not found, use 404
                error: new Error(result.message || "Event data not found or in unexpected format.")
            };
        }
    } catch (e) {
        console.error("Load function error:", e);
        const message = e instanceof Error ? e.message : "An unexpected error occurred while fetching the event.";
        return {
            status: 500,
            error: new Error(message)
        };
    }
} 