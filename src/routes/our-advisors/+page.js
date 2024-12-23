export const load = async ({ fetch }) => {
    const req = await fetch("/api/v1/advisors")

    if (req.ok) {
        /**
         * @type {{ status: boolean, data: { sessions: AdvisorSession[] } }}
         */
        const res = await req.json()
        if (res && res.data.sessions) {
            return res.data
        }
    }
}