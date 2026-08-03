/** @typedef {{ id: string; title: string; summary: string; content: string; image?: string; date: string; author?: string; category?: string }} PressRelease */
/** @typedef {{ releases: PressRelease[] }} PressReleaseData */

/** @type {PressReleaseData} */
export const samplePressReleaseData = {
	releases: [
		{
			id: 'pr-1',
			title: 'MSSN OAU Launches Free Tutorial Programme for 2025/2026 Session',
			summary: 'The Academic Committee announces the commencement of free tutorial sessions for all Muslim students ahead of the new academic session.',
			content: '<p>The Muslim Students\' Society of Nigeria (MSSN), Obafemi Awolowo University branch, is pleased to announce the launch of its free tutorial programme for the 2025/2026 academic session.</p><p>This initiative, organized by the Academic Committee, aims to support Muslim students in achieving academic excellence through peer-to-peer learning and mentorship.</p><p>Tutorials will cover courses across various faculties, with experienced senior students serving as tutors. Sessions will hold weekly at designated venues on campus.</p>',
			image: '/images/chalkboard.webp',
			date: '2025-07-15',
			author: 'Academic Committee',
			category: 'Programme'
		},
		{
			id: 'pr-2',
			title: 'MSSN OAU Ramadan Lecture Series Records Massive Turnout',
			summary: 'The annual Ramadan lecture series attracted over 500 Muslim students and staff, featuring renowned Islamic scholars.',
			content: '<p>The 2025 Ramadan Lecture Series organized by MSSN OAU recorded an impressive turnout of over 500 participants, including students, staff, and members of the Ile-Ife Muslim community.</p><p>The series, which held throughout the month of Ramadan, featured distinguished Islamic scholars who delivered lectures on various aspects of Islamic faith and practice.</p><p>MSSN OAU expresses gratitude to all sponsors, volunteers, and participants who made the event a success.</p>',
			image: '/images/madrasah.webp',
			date: '2025-04-10',
			author: 'Islamic Affairs Board',
			category: 'Event Report'
		},
		{
			id: 'pr-3',
			title: 'MSSN OAU Opens Alumnae Reconnection Portal',
			summary: 'Past members are invited to reconnect with the society through a new online portal aimed at strengthening the alumni network.',
			content: '<p>MSSN OAU is excited to announce the launch of its Alumnae Reconnection Portal, a platform designed to reconnect past members with the society and current students.</p><p>The portal allows alumni to share their experiences, offer mentorship, and contribute to the growth of the organization.</p><p>All past members are encouraged to visit the portal and fill out the reconnection form.</p>',
			image: '/images/bg-1.webp',
			date: '2025-03-20',
			author: 'MSSN OAU Secretariat',
			category: 'Announcement'
		},
		{
			id: 'pr-4',
			title: 'MSSN OAU Organizes Career Guidance Workshop for Final Year Students',
			summary: 'A career guidance workshop was organized to help final year Muslim students prepare for life after university.',
			content: '<p>As part of its commitment to the holistic development of Muslim students, MSSN OAU organized a one-day career guidance workshop for final year students.</p><p>The workshop featured panels of professionals and alumni who shared insights on career planning, job search strategies, and entrepreneurship.</p><p>Participants lauded the initiative and called for more of such programmes.</p>',
			image: '/images/bg-4.webp',
			date: '2025-02-28',
			author: 'Welfare Committee',
			category: 'Programme'
		}
	]
};
