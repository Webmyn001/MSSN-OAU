export const load = async ({ fetch }) => {
    const req = await fetch("/api/v1/info")

    if (req.ok) {
        /**
         * @type {PostRes[]}
         */
        const res = await req.json()
        if (res && res.data.info) {
            return res.data
        }
    }
}