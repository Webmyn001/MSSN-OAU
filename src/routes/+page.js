export const load = async ({ fetch }) => {
    const blogReq = await fetch("/api/v1/blog")
    const eventsReq = await fetch("/api/v1/events")

    const blogRes = await blogReq.json()
    const eventRes = await eventsReq.json()

        return {
            posts: (blogRes?.data?.posts ?? []).slice(0,3),
            events: eventRes.data.events.slice(0,2),
        }

}