export const load = async ({ fetch }) => {
    const req = await fetch("/api/v1/excos")

    if (req.ok) {
        /**
         * @type {{ status: boolean, data: { sessions: ExcoSession[] } }}
         */
        const res = await req.json()
        if (res && res.data.sessions) {
            return res.data
        }
    }
}