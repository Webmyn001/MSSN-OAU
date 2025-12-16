// * Client-side mock data for all content types
// * This replaces all external API dependencies (Pantry, WordPress, etc.)

import { exampleBlog } from '$lib/examples/blog.js';
import { exampleEvents } from '$lib/examples/events.js';
import { exampleInfo } from '$lib/examples/info.js';
import { programmes } from '$lib/data/programmes.js';

// * Mock blog posts - transform to match expected format
export const mockBlog = {
	posts: (exampleBlog.posts || []).map(post => ({
		...post,
		// * Convert author (singular) to authors (array) format expected by components
		authors: post.author ? [{
			name: post.author.name,
			avatar_urls: {
				"48": post.author.picture || "/images/placeholder.svg",
				"96": post.author.picture || "/images/placeholder.svg"
			}
		}] : [{
			name: "MSSN OAU",
			avatar_urls: {
				"48": "/images/mssn-logo.webp",
				"96": "/images/mssn-logo.webp"
			}
		}],
		// * Ensure featured_image exists
		featured_image: post.featured_image || "/images/placeholder.svg"
	}))
};

// * Mock events
export const mockEvents = {
	events: exampleEvents.events || []
};

// * Mock site info
export const mockInfo = exampleInfo;

// * Mock programmes
export const mockProgrammes = {
	programmes: programmes || []
};

// * Mock advisors
export const mockAdvisors = {
	advisors: {
		sessions: [
			{
				id: '2024-2025',
				label: '2024/2025',
				start_year: 2024,
				end_year: 2025,
				advisors: [
					{
						id: 'advisor-1',
						name: 'Dr. Amina Bello',
						title: 'Dr.',
						position: 'Chief Adviser',
						department: 'Department of Islamic Studies',
						phone: '+234 803 123 4567',
						email: 'amina.bello@oauife.edu.ng',
						photo: '/images/woman_2.webp',
						summary: 'Experienced academic advisor with expertise in Islamic studies and student mentorship.',
						socials: {
							whatsapp: '2348031234567',
							linkedin: 'https://linkedin.com/in/amina-bello'
						}
					},
					{
						id: 'advisor-2',
						name: 'Prof. Khalid Adeyemi',
						title: 'Prof.',
						position: 'Senior Adviser',
						department: 'Department of Arabic and Islamic Studies',
						phone: '+234 802 987 6543',
						email: 'khalid.adeyemi@oauife.edu.ng',
						photo: '/images/man_3.webp',
						summary: 'Dedicated to supporting Muslim students in their academic and spiritual journey.',
						socials: {
							whatsapp: '2348029876543'
						}
					}
				]
			}
		]
	}
};

// * Mock executives (excos)
export const mockExcos = {
	excos: {
		sessions: [
			{
				session: '2024-2025',
				start_year: 2024,
				end_year: 2025,
				executives: [
					{
						committee: 'Executive Council',
						members: [
							{
								id: 'exco-1',
								name: 'Ahmad Ibrahim',
								position: 'Amir',
								photo: '/images/man_1.webp',
								phone: '+234 803 111 2222',
								email: 'amir@mssnoau.org'
							},
							{
								id: 'exco-2',
								name: 'Fatima Abdullah',
								position: 'Amirah',
								photo: '/images/woman_1.webp',
								phone: '+234 803 222 3333',
								email: 'amirah@mssnoau.org'
							}
						]
					},
					{
						committee: 'Academic Committee',
						members: [
							{
								id: 'academic-1',
								name: 'Ibrahim Musa',
								position: 'Coordinator',
								photo: '/images/man_2.webp',
								phone: '+234 803 333 4444',
								email: 'academic@mssnoau.org'
							}
						]
					}
				]
			}
		]
	}
};

// * Mock committees
export const mockCommittees = {
	committees: [
		{
			id: 'academic',
			name: 'Academic Committee',
			description: 'Organizes tutorials and academic support programs for students.',
			image: '/images/chalkboard.webp',
			members: [
				{
					id: 'academic-1',
					name: 'Ibrahim Musa',
					position: 'Coordinator',
					photo: '/images/man_2.webp'
				}
			]
		},
		{
			id: 'islamic-affairs',
			name: 'Islamic Affairs Board',
			description: 'Oversees Islamic education programs including Madrasah and Al-Usrah.',
			image: '/images/madrasah.webp',
			members: [
				{
					id: 'iab-1',
					name: 'Aisha Yusuf',
					position: 'Coordinator',
					photo: '/images/woman_3.webp'
				}
			]
		},
		{
			id: 'jwc',
			name: 'Jihad Week Committee',
			description: 'Organizes the annual Jihad Week activities and competitions.',
			image: '/images/committees/jwc.webp',
			members: [
				{
					id: 'jwc-1',
					name: 'Hassan Ali',
					position: 'Coordinator',
					photo: '/images/man_4.webp'
				}
			]
		},
		{
			id: 'an-nuur',
			name: 'An-Nuur Committee',
			description: 'Organizes events and activities for sisters.',
			image: '/images/committees/an-nuur.webp',
			members: [
				{
					id: 'annuur-1',
					name: 'Zainab Mohammed',
					position: 'Coordinator',
					photo: '/images/woman_4.webp'
				}
			]
		}
	]
};

