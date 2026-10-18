export interface SiteFaq {
	question: string;
	answer: string;
}

export interface SiteAccount {
	number: string;
	bank: string;
	name: string;
}

export interface SiteInfo {
	maintenance: boolean;
	maintenance_ends: string | null;
	faqs: SiteFaq[];
	map_link: string;
	address: string;
	email: string;
	account: SiteAccount;
	prayer_times: Record<string, any> | null;
	hijriDate?: string;
	shortHijriDate?: string;
	prayerTimesUpdatedAt?: string;
}

export const exampleInfo: SiteInfo = {
	maintenance: false,
	maintenance_ends: null,
	faqs: [
		{
			question: "What is MSSN OAU, and what does it stand for?",
			answer: "<strong class='text-primary-800'>MSSN OAU</strong> stands for the <strong  class='text-primary-800'>Muslim Students’ Society of Nigeria, Ọbáfẹ́mi Awólọ́wọ̀ University Branch</strong>. It is a student-run Islamic organization aimed at fostering spiritual growth, academic excellence, and community service among Muslim students on campus.",
		},
	],
	map_link: "https://maps.app.goo.gl/r4T4g5NCUW36dGeZ7",
	address: "MSSN OAU Secretariat, Inside Fájúyì Hall",
	email: "info@mssnoau.org",
	account: {
		number: "0217023039",
		bank: "GTBank",
		name: "Muslim Students’ Society Of Nigeria, OAU",
	},
	prayer_times: null,
};
