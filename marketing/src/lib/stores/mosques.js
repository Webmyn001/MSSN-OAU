import { writable } from 'svelte/store';

/**
 * @typedef {Object} Mosque
 * @property {string} id - Unique identifier for the mosque
 * @property {string} label - Display name of the mosque
 * @property {string} url - URL associated with the mosque
 * @property {string[]} images - Array of image URLs for the mosque
 * @property {string} address - Physical address of the mosque
 * @property {string} [description] - Short description of the mosque
 */

// Create a writable store with initial mosque data
export const mosques = writable([
    {
        id: "awolowo_hall",
        label: "Awolowo Hall",
        url: "",
        images: [
            "https://images.unsplash.com/photo-1609657726788-44564a8f304a?w=600&auto=format&fit=crop&q=60&fm=webp&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1vc3F1ZSUyMG5pZ2VyaWF8ZW58MHx8MHx8fDA%3D", 
            "https://plus.unsplash.com/premium_photo-1678488478981-c8cf47f2c280?w=600&auto=format&fit=crop&q=60&fm=webp&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", 
            "https://images.unsplash.com/photo-1600383963284-91ef78fc9b6d?w=600&auto=format&fit=crop&q=60&fm=webp&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D",
            "https://images.unsplash.com/photo-1682995539989-1947b660b879?w=600&auto=format&fit=crop&q=60&fm=webp&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D"
        ],
        address: "Awolowo Hall of Residence, After Awo Cafe, OAU.",
        description: "One of the largest and most active Muslim prayer halls on campus, serving students in Awo Hall and surrounding areas. Known for its vibrant Jumu'ah congregation and nightly Taraweeh prayers during Ramadan."
    },
    {
        id: "fajuyi_hall",
        label: "Fajuyi Hall",
        url: "",
        images: [
            "https://images.unsplash.com/photo-1609657726788-44564a8f304a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1vc3F1ZSUyMG5pZ2VyaWF8ZW58MHx8MHx8fDA%3D"
        ],
        address: "Fajuyi Hall of Residence, OAU.",
        description: "A centrally located prayer hall within Fajuyi Hall of Residence, convenient for students in the southern part of campus. Offers all five daily prayers with congregation."
    },
    {
        id: "etf_hall",
        label: "ETF Hall",
        url: "",
        images: [
            "https://images.unsplash.com/photo-1600383963284-91ef78fc9b6d?w=600&auto=format&fit=crop&q=60&fm=webp&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D"
        ],
        address: "ETF Hall, OAU.",
        description: "A convenient prayer space located within the ETF Hall of Residence, serving Muslim students in the eastern corridor of campus."
    },
    {
        id: "pg_hall",
        label: "PG Hall",
        url: "",
        images: [
            "https://images.unsplash.com/photo-1682995539989-1947b660b879?w=600&auto=format&fit=crop&q=60&fm=webp&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D"
        ],
        address: "PG Hall, OAU.",
        description: "A prayer hall primarily serving postgraduate Muslim students, located within the Postgraduate Hall of Residence."
    },
    {
        id: "geology_grounds",
        label: "Geology Grounds",
        url: "",
        images: [
            "https://images.unsplash.com/photo-1678481816413-00aabc64678d?w=600&auto=format&fit=crop&q=60&fm=webp&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D"
        ],
        address: "Faculty of Geology, OAU.",
        description: "A prayer space within the Faculty of Geology building, serving Muslim students and staff in the science corridor during academic hours."
    },
    {
        id: "computer_grounds",
        label: "Computer Grounds",
        url: "",
        images: [
            "https://images.unsplash.com/photo-1600383962708-4f28dcbce116?w=600&auto=format&fit=crop&q=60&fm=webp&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D"
        ],
        address: "Computer Science Department, OAU.",
        description: "A prayer room within the Department of Computer Science, convenient for students and staff in the Faculty of Technology."
    },
    {
        id: "spider_grounds",
        label: "Spider Grounds",
        url: "",
        images: [
            "https://images.unsplash.com/photo-1682995759960-531a5ba3a944?w=600&auto=format&fit=crop&q=60&fm=webp&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D"
        ],
        address: "Spider Building, OAU.",
        description: "A centrally located prayer space near the Spider Building, popular among students from various faculties for its accessibility."
    },
    {
        id: "chem_eng_grounds",
        label: "Chem. Eng Grounds",
        url: "",
        images: [
            "https://images.unsplash.com/photo-1678488478981-c8cf47f2c280?w=600&auto=format&fit=crop&q=60&fm=webp&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D"
        ],
        address: "Chemical Engineering Department, OAU.",
        description: "A prayer hall within the Chemical Engineering Department, serving Muslim students and staff in the engineering faculty."
    },
    {
        id: "central_mosque",
        label: "Central Mosque",
        url: "",
        images: [
            "https://images.unsplash.com/photo-1682995759960-531a5ba3a944?w=600&auto=format&fit=crop&q=60&fm=webp&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D"
        ],
        address: "Central Mosque, OAU.",
        description: "The Central Mosque of Unity — the main and largest mosque on campus. It serves as the spiritual heart of the Muslim community at OAU, hosting Friday sermons, Eid prayers, and major Islamic events."
    }
]);

/**
 * Helper function to get a mosque by ID
 * @param {string} id - The ID of the mosque to find
 * @returns {Object|undefined} The found mosque object or undefined if not found
 */
export function getMosqueById(id) {
    let result;
    mosques.subscribe(list => {
        result = list.find(mosque => mosque.id === id);
    })();
    return result;
}
