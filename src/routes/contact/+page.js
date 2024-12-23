export const load = async ({ fetch }) => {
    const req = await fetch("/api/v1/info")

    if (req.ok) {
        /**
         * @type {{ status: boolean, data: { sessions: Session[] } }}
         */
        const res = await req.json()
        if (res && res.data.sessions) {
            return res.data
        }
    }
}