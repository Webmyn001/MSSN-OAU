import { json } from '@sveltejs/kit';

const baseManifest = {
    name: "MSSN OAU",
    short_name: "MSSN OAU",
    start_url: "/",
    display: "standalone",
    background_color: "#003a1c", // Using the darkest green from your provided color palette for background
    theme_color: "#00f473", // Using the green shade for the theme color
    description: "OAU Great Ife's Muslim Community.",
    orientation: "portrait",
    id: "mssnoau",
    icons: [
        {
            "src": "android-chrome-192x192.png",
            "type": "image/png",
            "sizes": "192x192"
        },
        {
            "src": "android-chrome-512x512.png",
            "type": "image/png",
            "sizes": "512x512"
        }
    ],
    categories: ["community", "religion", "student", "events"],
};

const shortcuts = [
    {
        name: "Home",
        short_name: "Home",
        url: "https://mssnoau.org",
        description: "View Homepage",
        icons: [{ src: "/images/shortcuts/home.png", type: "image/png", purpose: "any", sizes: "192x192" }]
    },
    {
        name: "Events",
        short_name: "Events",
        url: "https://mssnoau.org/events",
        description: "View upcoming events",
        icons: [{ src: "/images/shortcuts/calendar.png", type: "image/png", purpose: "any", sizes: "192x192" }]
    },
    {
        name: "Account",
        short_name: "Join Us",
        url: "https://mssnoau.org/account",
        description: "Become a member of MSSN OAU",
        icons: [{ src: "/images/shortcuts/account.png", type: "image/png", purpose: "any", sizes: "192x192" }]
    },
    {
        name: "Dashboard",
        short_name: "Dashboard",
        url: "https://dashboard.mssnoau.org/",
        description: "Acces your Dashboard",
        icons: [{ src: "/images/shortcuts/business.png", type: "image/png", purpose: "any", sizes: "192x192" }]
    },
    {
        name: "Donate",
        short_name: "Support",
        url: "https://mssnoau.org#donate",
        description: "Support our cause",
        icons: [{ src: "/images/shortcuts/donate.png", type: "image/png", purpose: "any", sizes: "192x192" }]
    }
];

export async function GET() {
    const manifest = {
        ...baseManifest,
        shortcuts
    };

    return json(manifest, {
        headers: {
            'Content-Type': 'application/manifest+json'
        }
    });
}
