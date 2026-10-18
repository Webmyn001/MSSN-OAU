export interface ProgrammeScheduleItem {
	day: string;
	time: string;
	location?: string;
}

export interface Programme {
	id: string | number;
	title: string;
	text?: string;
	summary?: string;
	description?: string;
	image?: string;
	schedule?: ProgrammeScheduleItem[];
}

export interface ProgrammeData {
	programmes: Programme[];
}

export const sampleProgrammeData: ProgrammeData = {
	programmes: [
		{
			id: 'programme-tutorials',
			title: 'Tutorials',
			text: 'Academic tutorials organised by the Academic Committee.',
			summary: 'Rigorous academic tutorials across various disciplines, organized by the Academic Committee to support students\' learning and examination success.',
			image: '/images/chalkboard.webp',
			description: '<p>The <strong>Academic Committee</strong> of MSSN OAU branch is dedicated to fostering academic excellence among Muslim students. Our tutorial programme offers:</p><ul><li><strong>Comprehensive Coverage:</strong> Sessions cover a wide range of courses, particularly challenging ones, across various faculties.</li><li><strong>Experienced Tutors:</strong> Led by high-achieving senior students and sometimes graduate assistants, providing peer-to-peer learning in a supportive environment.</li><li><strong>Interactive Learning:</strong> Focus on problem-solving, understanding difficult concepts, and exam preparation techniques.</li><li><strong>Regular Schedule:</strong> Tutorials are typically scheduled weekly or bi-weekly throughout the semester, with intensified sessions during exam periods.</li></ul>',
			schedule: [
				{ day: 'Mondays', time: '4:00 PM - 6:00 PM', location: 'Amphitheatre, White House' },
				{ day: 'Wednesdays', time: '4:00 PM - 6:00 PM', location: 'HSLT A & B' }
			]
		},
		{
			id: 'programme-madrasah',
			title: 'Madrasah',
			text: 'Classes on Islamic Education organised by the Islamic Affairs Board.',
			summary: 'Structured classes on Quranic recitation (Tajweed), Arabic language, Fiqh (Jurisprudence), and Seerah (Prophetic Biography) by the Islamic Affairs Board.',
			image: '/images/madrasah.webp',
			description: '<p>Deepen your understanding of Islam through our structured Madrasah classes, meticulously organized by the <strong>Islamic Affairs Board</strong>. Key features include:</p><ul><li><strong>Core Islamic Sciences:</strong> Courses in Tajweed, Arabic language, Fiqh, and Seerah.</li><li><strong>Qualified Instructors:</strong> Learn from knowledgeable and approachable teachers.</li><li><strong>Flexible Timings:</strong> Classes are held on weekends or evenings to accommodate academic schedules.</li></ul>',
			schedule: [
				{ day: 'Saturdays', time: '2:00 PM - 5:00 PM', location: 'MSSN OAU Secretariat/Madrasah Hall' },
				{ day: 'Sundays', time: '10:00 AM - 1:00 PM', location: 'MSSN OAU Secretariat/Madrasah Hall' }
			]
		},
		{
			id: 'programme-al-usrah',
			title: 'Al-Usrah',
			text: 'A weekly meetup centering on Islamic perspective of certain issues.',
			summary: 'A weekly engaging Halaqah (study circle) discussing contemporary issues from an Islamic perspective, fostering brotherhood and sisterhood.',
			image: '/images/al-usrah.webp',
			description: '<p>Al-Usrah, meaning \'The Family\', is our vibrant weekly Halaqah (study circle). It\'s a cornerstone of MSSN OAU, aiming to:</p><ul><li><strong>Foster Unity:</strong> Create a strong sense of community, brotherhood, and sisterhood.</li><li><strong>Discuss Relevant Issues:</strong> Address contemporary challenges from an Islamic viewpoint.</li><li><strong>Interactive Sessions:</strong> Short talks followed by engaging Q&A and discussions.</li></ul>',
			schedule: [
				{ day: 'Fridays', time: 'After Asr Prayer (approx. 4:30 PM)', location: 'MSSN OAU Central Mosque Premises' }
			]
		},
		{
			id: 'programme-sisters-circle',
			title: "Sisters' Circle",
			text: 'A weekly sisters-only meetup that aims to strengthen the bonds between sisters.',
			summary: "A dedicated weekly forum for sisters to discuss relevant topics, share experiences, and strengthen bonds of sisterhood in a supportive environment.",
			image: '/images/sisters-circle.webp',
			description: "<p>The Sisters' Circle provides a warm, confidential, and empowering space exclusively for our female members:</p><ul><li><strong>Spiritual Growth:</strong> Discussions on Quran, Hadith, and topics pertinent to a Muslimah's life.</li><li><strong>Personal Development:</strong> Workshops on self-improvement, health, relationships, and career.</li><li><strong>Sisterly Bonds:</strong> Activities designed to foster strong connections and lasting friendships.</li></ul>",
			schedule: [
				{ day: 'Thursdays', time: '5:00 PM - 6:30 PM', location: "Sisters' Common Room / Designated Hall" }
			]
		}
	]
};
