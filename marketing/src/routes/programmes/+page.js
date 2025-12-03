export const load = async ({ fetch }) => {
    try {
        const req = await fetch("/api/v1/programmes")
        
        console.log('API response status:', req.status);
        
        if (req.ok) {
            /**
             * @type {{ status: boolean, data: { programmes: Programme[] } }}
             */
            const res = await req.json()
            console.log('API response:', res);
            
            if (res && res.data && res.data.programmes) {
                console.log('Programmes found:', res.data.programmes.length);
                return res.data
            } else {
                console.error('Invalid API response structure:', res);
                // Return fallback data structure
                return { programmes: [] }
            }
        } else {
            console.error('API request failed with status:', req.status);
            // Return fallback data structure
            return { programmes: [] }
        }
    } catch (error) {
        console.error('Error fetching programmes:', error);
        // Return fallback data structure
        return { programmes: [] }
    }
}