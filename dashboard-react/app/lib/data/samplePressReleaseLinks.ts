export interface PressReleaseLink {
	id: string;
	title: string;
	url: string;
	image?: string;
	description: string;
	date: string;
}

export interface PressReleaseLinkData {
	links: PressReleaseLink[];
}

export const samplePressReleaseLinkData: PressReleaseLinkData = {
	links: [
		{
			id: 'prl-1',
			title: 'Ramadan Lecture 2025: A Night of Spiritual Revival',
			url: 'https://annuurpress.org.ng/ramadan-lecture-2025',
			image: '/images/madrasah.webp',
			description: 'Read the full report of our 2025 Ramadan Lecture Series featuring renowned Islamic scholars and over 500 attendees.',
			date: '2025-04-10'
		},
		{
			id: 'prl-2',
			title: 'Free Tutorial Programme kicks off for new session',
			url: 'https://annuurpress.org.ng/tutorial-programme-2025',
			image: '/images/chalkboard.webp',
			description: 'The Academic Committee launches free tutorial sessions for all Muslim students across faculties.',
			date: '2025-07-15'
		},
		{
			id: 'prl-3',
			title: 'MSSN OAU Career Workshop Empowers Final Year Students',
			url: 'https://annuurpress.org.ng/career-workshop-2025',
			image: '/images/bg-4.webp',
			description: 'A one-day career guidance workshop helped final year Muslim students prepare for life after university.',
			date: '2025-02-28'
		}
	]
};
