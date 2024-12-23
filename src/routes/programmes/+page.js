export const load = async ({ fetch }) => {
    const req = await fetch("/api/v1/programmes")

    if (req.ok) {
        /**
         * @type {{ status: boolean, data: { programmes: Programme[] } }}
         */
        const res = await req.json()
        if (res && res.data.programmes) {
            return res.data
        }
    }
}