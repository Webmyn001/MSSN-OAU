export interface ContactEntry {
	id: string;
	fname: string;
	lname: string;
	email?: string;
	phone: string;
	message: string;
	submittedAt: string;
	status: 'new' | 'read' | 'replied';
	notes?: string;
}

export interface ContactData {
	entries: ContactEntry[];
}

export const sampleContactData: ContactData = {
	entries: [
		{
			id: 'contact-1',
			fname: 'Abdullah',
			lname: 'Mustapha',
			email: 'abdullah.mustapha@student.oauife.edu.ng',
			phone: '+2348123456789',
			message: 'Assalamu Alaikum. I would like to inquire about the upcoming Ramadan preparation programme. When will it start and how can I volunteer?',
			submittedAt: '2025-06-15T10:30:00Z',
			status: 'new'
		},
		{
			id: 'contact-2',
			fname: 'Fatimah',
			lname: 'Abdulrahman',
			email: 'fatimah.a@gmail.com',
			phone: '+2348098765432',
			message: 'I am an alumna from the 2019/2020 session. I would love to contribute to the tutorial programme as a volunteer tutor. Please let me know how to get involved.',
			submittedAt: '2025-06-14T14:22:00Z',
			status: 'read',
			notes: 'Referred to Academic Committee coordinator'
		},
		{
			id: 'contact-3',
			fname: 'Ibrahim',
			lname: 'Olanrewaju',
			phone: '+2347055512345',
			message: 'The prayer time notification on the website seems to be 5 minutes behind the actual time. Can this be looked into? JazakAllahu Khairan.',
			submittedAt: '2025-06-13T08:15:00Z',
			status: 'replied',
			notes: 'Fixed the time offset issue on 2025-06-14'
		},
		{
			id: 'contact-4',
			fname: 'Aisha',
			lname: 'Bello',
			email: 'aisha.bello@oauife.edu.ng',
			phone: '+2348111222333',
			message: 'Assalamu Alaikum. I am a 300-level student in the Department of Computer Science. I want to know if there are any IT skill acquisition programmes organized by MSSN.',
			submittedAt: '2025-06-12T16:45:00Z',
			status: 'new'
		},
		{
			id: 'contact-5',
			fname: 'Yusuf',
			lname: 'Ademola',
			phone: '+2348044455566',
			message: 'JazakAllahu Khairan for the wonderful work MSSN is doing. I would like to make a donation to support the Madrasah programme. Kindly share the account details.',
			submittedAt: '2025-06-11T11:20:00Z',
			status: 'read',
			notes: 'Sent donation details via WhatsApp'
		}
	]
};
