export const load = async ({ fetch }) => {
    const committeesReq = await fetch("/api/v1/committees")

    if (committeesReq.ok) {
        const res = await committeesReq.json()
        if (res && res.data.committees) {
            return res.data
        }
    }
    
    // Return an empty array as fallback if API fails
    return { committees: [] }
} 