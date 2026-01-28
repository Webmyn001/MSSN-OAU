// * Event data for the marketing site (static source of truth).
// * Each record corresponds to one flyer/design.

/**
 * @typedef {Object} EventSource
 * @property {'flyer' | 'pdf'} type
 * @property {string} path - Workspace-relative path for traceability (not necessarily publicly served).
 */

/**
 * @typedef {Object} Event
 * @property {string} id
 * @property {string} title
 * @property {string} summary
 * @property {string} date - ISO date string
 * @property {string} venue
 * @property {boolean} paid
 * @property {string} [price]
 * @property {string} [image] - Public path under marketing/static
 * @property {string} [url] - Registration or external details URL
 * @property {string} [slug]
 * @property {string} [host]
 * @property {string} [contact]
 * @property {string} [category]
 * @property {string[]} [tags]
 * @property {string} [registration_deadline]
 * @property {string} [additional_details]
 * @property {EventSource[]} [sources]
 */

/**
 * * Static events list (one record per flyer)
 * @type {Event[]}
 */
export const events = [
    {
        id: "open-day-cleaning-2026-01-25",
        title: "Open Day Cleaning",
        slug: "open-day-cleaning-2026-01-25",
        summary: "Join MSSNOAU for an open day cleaning exercise at the OAU Central Mosque.",
        date: "2026-01-25T05:30:00Z",
        venue: "OAU Central Mosque",
        paid: false,
        image: "/images/events/open-day-cleaning-2026-01-25.jpg",
        host: "MSSNOAU",
        contact: "MSSNOAU: +2349039052468",
        category: "Community Service",
        tags: ["mosque", "cleaning", "volunteering"],
        sources: [
            { type: "flyer", path: "marketing/docs/WhatsApp Image 2026-01-28 at 2.38.31 AM.jpeg" }
        ]
    },
    {
        id: "sisters-circle-soapmaking-2026-01-23",
        title: "Sisters' Circle — Home Made Soap Making",
        slug: "sisters-circle-soapmaking-2026-01-23",
        summary: "Topic: Home made soap making — a step-by-step guide. Lecturer: Sister Aderibigbe Hikmah. Invited guest: Mrs H.O Owolarafe.",
        date: "2026-01-23T13:00:00Z",
        venue: "OAU Central Mosque",
        paid: false,
        image: "/images/events/sisters-circle-soapmaking-2026-01-23.jpg",
        host: "MSSNOAU Sisters' Circle",
        contact: "Ameerah: +2349026043219 • Naibatul Ameerah: +2347046014209 • P.R.O (Sisters' Circle): +2347089066787",
        category: "Sisters",
        tags: ["sisters-circle", "skills", "soap making"],
        additional_details: "Time: Immediately after Jumu’at (In shaa Allah).",
        sources: [
            { type: "flyer", path: "marketing/docs/WhatsApp Image 2026-01-28 at 2.39.16 AM.jpeg" }
        ]
    },
    {
        id: "muslimah-summit-4-line-up-2026-01-16",
        title: "Muslimah Summit 4.0 — Line Up Activities",
        slug: "muslimah-summit-4-line-up-2026-01-16",
        summary: "Theme: The Constellation Within. A 3-day programme featuring medical outreach, training sessions, career development, relationship talk, Qur'an competition, dinner night, and skill acquisition.",
        date: "2026-01-16T00:00:00Z",
        venue: "OAU Central Mosque of Unity",
        paid: true,
        price: "₦7,000 (group discounts available)",
        image: "/images/events/muslimah-summit-4-line-up-2026-01-16.jpg",
        host: "MSSNOAU Muslimah Summit",
        url: "https://forms.gle/PVqMQcJc6scDFGUy6",
        category: "Conference",
        tags: ["muslimah-summit", "medical outreach", "career", "skills", "quran"],
        additional_details: [
            "Dates: Friday 16th – Sunday 18th, January 2026.",
            "Reg fee: ₦7,000 • Group of 3: ₦19,950 • Group of 5: ₦32,200.",
            "For sponsorship & enquiries: Chairperson (MSU 4.0): +2348109592556 • Ameerah: +2349026043219."
        ].join("\n"),
        sources: [
            { type: "flyer", path: "marketing/docs/WhatsApp Image 2026-01-28 at 2.39.55 AM.jpeg" }
        ]
    },
    {
        id: "muslimah-summit-4-highlights-2026-01-16",
        title: "Muslimah Summit 4.0 — Event Highlights",
        slug: "muslimah-summit-4-highlights-2026-01-16",
        summary: "Theme: The Constellation Within. Event highlights include Qur’an competition, career talk, vocational skills, tafsir session, dinner night, practical session on ghusl, lessons from the 10 great women in Islam, and medical check-up.",
        date: "2026-01-16T00:00:00Z",
        venue: "OAU Central Mosque of Unity",
        paid: true,
        price: "₦7,000 (group discounts available)",
        image: "/images/events/muslimah-summit-4-highlights-2026-01-16.jpg",
        host: "MSSNOAU Muslimah Summit",
        url: "https://forms.gle/PVqMQcJc6scDFGUy6",
        category: "Conference",
        tags: ["muslimah-summit", "career talk", "vocational skills", "tafsir", "ghusl"],
        additional_details: "For sponsorship & enquiries: Chairperson: +2348109592556 • Ameerah: +2349026043219 • Secretary: +2347050721681",
        sources: [
            { type: "flyer", path: "marketing/docs/WhatsApp Image 2026-01-28 at 2.42.40 AM.jpeg" }
        ]
    },
    {
        id: "daarul-hikmah-madrasah",
        title: "Daarul-Hikmah Madrasah Continues",
        slug: "daarul-hikmah-madrasah",
        summary: "The madrasah is free for every interested individual. Seasoned tutors are available to teach each subject, and a certificate is awarded at the end of the program.",
        date: "2026-01-28T17:00:00Z",
        venue: "Awo Mosque",
        paid: false,
        image: "/images/events/daarul-hikmah-madrasah.jpg",
        host: "MSSNOAU Islamic Affairs",
        contact: "Madrasah Coordinator: +2348141960215 • Ameer (MSSNOAU): +2349039052468 • Naibul-Ameer (Islamic Affairs): +2349164028709",
        category: "Education",
        tags: ["madrasah", "islamic studies"],
        additional_details: "Schedule: Wednesday to Friday, from Maghrib till Isha (8:30pm) every week.",
        sources: [
            { type: "flyer", path: "marketing/docs/WhatsApp Image 2026-01-28 at 2.40.55 AM.jpeg" }
        ]
    },
    {
        id: "a-night-with-alumni-2025-11-18",
        title: "A Night with Alumni",
        slug: "a-night-with-alumni-2025-11-18",
        summary: "How involvement in MSSN activities impacted their careers. Featuring Idris Ayodeji Bello, Tunde Azeez, Muhammed Elegbede, and Taofik Abdulkareem.",
        date: "2025-11-18T17:00:00Z",
        venue: "Awo Hall Masjid",
        paid: false,
        image: "/images/events/a-night-with-alumni-2025-11-18.jpg",
        host: "MSSNOAU",
        contact: "MSSNOAU: +2349039052468",
        category: "Alumni",
        tags: ["alumni", "career", "mentorship"],
        additional_details: "Time: After Maghrib.",
        sources: [
            { type: "flyer", path: "marketing/docs/WhatsApp Image 2026-01-28 at 2.41.49 AM.jpeg" }
        ]
    },
    {
        id: "fatemsa-1st-general-meeting-2026-01-09",
        title: "FATEMSA OAU — 1st General Meeting",
        slug: "fatemsa-1st-general-meeting-2026-01-09",
        summary: "General discussion, updates on FATEMSA projects, open forum for suggestions and feedback, and academic/spiritual development plans.",
        date: "2026-01-09T13:00:00Z",
        venue: "OAU Central Mosque of Unity Hall (Small Mosque)",
        paid: false,
        image: "/images/events/fatemsa-1st-general-meeting-2026-01-09.jpg",
        host: "FATEMSA OAU",
        contact: "Adesoji Ridwanullah (Coordinator): +2349039193613 • Ajadi Lateefah (Sisters' Coordinator): +2347062724918 • Olanrewaju Abdulhameed (P.R.O): +2349036111833",
        category: "Meeting",
        tags: ["fatemsa", "general meeting"],
        additional_details: "Time: Immediately after Jumu’ah.",
        sources: [
            { type: "flyer", path: "marketing/docs/WhatsApp Image 2026-01-28 at 2.43.43 AM.jpeg" }
        ]
    },
    {
        id: "muslim-tech-summit-ticket-sales-2026-02-08",
        title: "Muslim Tech Summit 2.0 — Ticket Sales (The Muslim Edge)",
        slug: "muslim-tech-summit-ticket-sales-2026-02-08",
        summary: "Ticket sales for The Muslim Edge (MTS Muslim Tech Summit 2.0). Early bird ₦2,500, late payment ₦3,000.",
        date: "2026-02-08T08:00:00Z",
        venue: "Obafemi Awolowo University (OAU)",
        paid: true,
        price: "₦2,500 early bird • ₦3,000 late payment",
        image: "/images/events/muslim-tech-summit-ticket-sales-2026-02-08.jpg",
        host: "FATEMSA OAU / Muslim Tech Summit",
        url: "https://www.muslimtechsummit.org",
        category: "Tech",
        tags: ["muslim tech summit", "ticket sales", "tech"],
        contact: "Taslim Owolarafe (Chairman): +2347015871354 • Adesoji Ridwanullah (Coordinator): +2349039193613",
        sources: [
            { type: "flyer", path: "marketing/docs/WhatsApp Image 2026-01-28 at 2.44.38 AM.jpeg" }
        ]
    }
];

