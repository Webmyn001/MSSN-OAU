export const load = async ({ fetch }) => {
    const postsReq = await fetch("/api/v1/events")

    if (postsReq.ok) {
        /**
         * @type {PostRes[]}
         */
        const res = await postsReq.json()
        if (res && res.data.events) {
            return res.data
        }
    }
}