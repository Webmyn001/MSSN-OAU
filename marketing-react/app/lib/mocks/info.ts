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
	phone?: string;
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
			answer: "<strong class='text-primary-800'>MSSN OAU</strong> stands for the <strong  class='text-primary-800'>Muslim Students' Society of Nigeria, Ọbáfẹ́mi Awólọ́wọ̀ University Branch</strong>. It is a student-run Islamic organization aimed at fostering spiritual growth, academic excellence, and community service among Muslim students on campus.",
		},
		{
			question: "Who can join MSSN OAU?",
			answer: "<strong  class='text-primary-800'>MSSN OAU</strong> is open to all Muslim students at <strong  class='text-primary-800'>Ọbáfẹ́mi Awólọ́wọ̀ University, Ilé-Ifẹ̀</strong>.",
		},
		{
			question: "Where is the MSSN Secretariat located on campus?",
			answer: "The <strong  class='text-primary-800'>MSSN OAU Secretariat</strong> is located inside <a href='https://maps.app.goo.gl/r4T4g5NCUW36dGeZ7' class='text-primary-800'>Fájúyì Hall, Ọbáfẹ́mi Awólọ́wọ̀ University, Ilé-Ifẹ̀</a>.",
		},
		{
			question: "How can I register for MSSN OAU events?",
			answer: "You can register for <strong  class='text-primary-800'>MSSNOAU</strong> events through our <a  class='text-primary-800 underline hover:text-primary-700' href='/events'>events section</a> or by visiting the Secretariat inside <strong  class='text-primary-800'>Fájúyì Hall</strong>. Event registration details will be announced through our communication channels and on the website.",
		},
		{
			question: "Can I make donations to MSSN OAU? How?",
			answer: "Yes, donations to <strong  class='text-primary-800'>MSSN OAU</strong> are welcome! You can make donations directly at the Secretariat or through our official bank account, which can be found <a  class='text-primary-800 underline hover:text-primary-700' href='/#donate'>here</a>.",
		},
		{
			question: "How do I pay my annual dues?",
			answer: "Annual dues can be paid at the <strong  class='text-primary-800'>Secretariat</strong> or via our <a  class='text-primary-800 underline hover:text-primary-700' href='/annual-dues'>online payment platform</a>.",
		},
		{
			question: "How are the funds utilized by MSSN OAU?",
			answer: "Funds are used to support <strong  class='text-primary-800'>MSSN OAU</strong> activities, including organizing events, maintaining the Secretariat, providing resources for members, and running community service projects.",
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
