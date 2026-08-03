export interface Advisor {
	id: string;
	name: string;
	title?: string;
	gender?: 'male' | 'female';
	position?: string;
	department?: string;
	phone?: string;
	email?: string;
	photo?: string;
	summary?: string;
	socials?: {
		whatsapp?: string;
		linkedin?: string;
	};
}

export interface AdvisorData {
	advisors: Advisor[];
}

export const sampleAdvisorData: AdvisorData = {
	advisors: [
		{
			id: 'advisor-1',
			name: 'Dr. Amina Bello',
			title: 'Dr.',
			gender: 'female',
			position: 'Chief Adviser',
			department: 'Department of Islamic Studies',
			phone: '+2348031234567',
			email: 'amina.bello@oauife.edu.ng',
			photo: '/images/user/female.jpg',
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
			gender: 'male',
			position: 'Senior Adviser',
			department: 'Department of Arabic and Islamic Studies',
			phone: '+2348029876543',
			email: 'khalid.adeyemi@oauife.edu.ng',
			photo: '/images/user/male.jpg',
			summary: 'Dedicated to supporting Muslim students in their academic and spiritual journey.',
			socials: {
				whatsapp: '2348029876543'
			}
		},
		{
			id: 'advisor-3',
			name: 'Dr. Ibrahim Olanrewaju',
			title: 'Dr.',
			gender: 'male',
			position: 'Chief Adviser',
			department: 'Faculty of Law',
			phone: '+2348051112233',
			email: 'ibrahim.olanrewaju@oauife.edu.ng',
			photo: '/images/user/male.jpg',
			summary: 'Legal expert and mentor guiding students in both academic and moral development.'
		},
		{
			id: 'advisor-4',
			name: 'Dr. Fatimah Abdulrahman',
			title: 'Dr.',
			gender: 'female',
			position: 'Senior Adviser',
			department: 'Department of English',
			phone: '+2348063334455',
			email: 'fatimah.abdulrahman@oauife.edu.ng',
			photo: '/images/user/female.jpg',
			summary: 'Passionate about empowering students through education and spiritual growth.',
			socials: {
				linkedin: 'https://linkedin.com/in/fatimah-abdulrahman'
			}
		}
	]
};
