import { db } from '../lib/db';
import { events } from './schema';
import { eq } from 'drizzle-orm';

const sampleEvents = [
	{
		title: "Open Day Cleaning",
		description: "Join MSSNOAU for an open day cleaning exercise at the OAU Central Mosque.",
		startDate: new Date("2026-01-25T05:30:00Z"),
		endDate: new Date("2026-01-25T09:30:00Z"),
		venue: "OAU Central Mosque",
		imageUrl: "/images/events/open-day-cleaning-2026-01-25.jpg",
		ticketPrice: "0",
		isPublic: true
	},
	{
		title: "Sisters' Circle — Home Made Soap Making",
		description: "Topic: Home made soap making — a step-by-step guide. Lecturer: Sister Aderibigbe Hikmah. Invited guest: Mrs H.O Owolarafe. Time: Immediately after Jumu’at (In shaa Allah).",
		startDate: new Date("2026-01-23T13:00:00Z"),
		endDate: new Date("2026-01-23T15:00:00Z"),
		venue: "OAU Central Mosque",
		imageUrl: "/images/events/sisters-circle-soapmaking-2026-01-23.jpg",
		ticketPrice: "0",
		isPublic: true
	},
	{
		title: "Muslimah Summit 4.0 — Line Up Activities",
		description: "Theme: The Constellation Within. A 3-day programme featuring medical outreach, training sessions, career development, relationship talk, Qur'an competition, dinner night, and skill acquisition.",
		startDate: new Date("2026-01-16T08:00:00Z"),
		endDate: new Date("2026-01-18T18:00:00Z"),
		venue: "OAU Central Mosque of Unity",
		imageUrl: "/images/events/muslimah-summit-4-line-up-2026-01-16.jpg",
		ticketPrice: "7000",
		isPublic: true
	},
	{
		title: "Daarul-Hikmah Madrasah Continues",
		description: "The madrasah is free for every interested individual. Seasoned tutors are available to teach each subject, and a certificate is awarded at the end of the program. Schedule: Wednesday to Friday, from Maghrib till Isha (8:30pm) every week.",
		startDate: new Date("2026-01-28T17:00:00Z"),
		endDate: new Date("2026-01-28T20:30:00Z"),
		venue: "Awo Mosque",
		imageUrl: "/images/events/daarul-hikmah-madrasah.jpg",
		ticketPrice: "0",
		isPublic: true
	},
	{
		title: "Muslim Tech Summit 2.0 — Ticket Sales (The Muslim Edge)",
		description: "Ticket sales for The Muslim Edge (MTS Muslim Tech Summit 2.0). Early bird ₦2,500, late payment ₦3,000.",
		startDate: new Date("2026-02-08T08:00:00Z"),
		endDate: new Date("2026-02-08T17:00:00Z"),
		venue: "Obafemi Awolowo University (OAU)",
		imageUrl: "/images/events/muslim-tech-summit-ticket-sales-2026-02-08.jpg",
		ticketPrice: "2500",
		isPublic: true
	}
];

async function seed() {
	console.log('Seeding events into DB...');
	for (const evt of sampleEvents) {
		const existing = await db.select().from(events).where(eq(events.title, evt.title));
		if (existing.length === 0) {
			await db.insert(events).values(evt);
			console.log(`Inserted event: ${evt.title}`);
		} else {
			console.log(`Event already exists: ${evt.title}`);
		}
	}
	console.log('Done seeding events.');
	process.exit(0);
}

seed().catch(err => {
	console.error('Error seeding events:', err);
	process.exit(1);
});
