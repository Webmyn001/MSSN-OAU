export interface MosqueEntry {
	id: string;
	label: string;
	url: string;
	images: string[];
	address: string;
	description: string;
}

export interface MosqueData {
	mosques: MosqueEntry[];
}

export const sampleMosqueData: MosqueData = {
	mosques: [
		{
			id: 'awolowo_hall',
			label: 'Awolowo Hall',
			url: '',
			images: ['https://images.unsplash.com/photo-1609657726788-44564a8f304a?w=600&auto=format&fit=crop&q=60&fm=webp'],
			address: 'Awolowo Hall of Residence, After Awo Cafe, OAU.',
			description: 'One of the largest and most active Muslim prayer halls on campus, serving students in Awo Hall and surrounding areas. Known for its vibrant Jumu\'ah congregation and nightly Taraweeh prayers during Ramadan.'
		},
		{
			id: 'fajuyi_hall',
			label: 'Fajuyi Hall',
			url: '',
			images: ['https://images.unsplash.com/photo-1609657726788-44564a8f304a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
			address: 'Fajuyi Hall of Residence, OAU.',
			description: 'A centrally located prayer hall within Fajuyi Hall of Residence, convenient for students in the southern part of campus.'
		},
		{
			id: 'central_mosque',
			label: 'Central Mosque',
			url: '',
			images: ['https://images.unsplash.com/photo-1682995759960-531a5ba3a944?w=600&auto=format&fit=crop&q=60&fm=webp'],
			address: 'Central Mosque, OAU.',
			description: 'The Central Mosque of Unity — the main and largest mosque on campus. It serves as the spiritual heart of the Muslim community at OAU, hosting Friday sermons, Eid prayers, and major Islamic events.'
		},
		{
			id: 'etf_hall',
			label: 'ETF Hall',
			url: '',
			images: ['https://images.unsplash.com/photo-1600383963284-91ef78fc9b6d?w=600&auto=format&fit=crop&q=60&fm=webp'],
			address: 'ETF Hall, OAU.',
			description: 'A convenient prayer space located within the ETF Hall of Residence, serving Muslim students in the eastern corridor of campus.'
		},
		{
			id: 'pg_hall',
			label: 'PG Hall',
			url: '',
			images: ['https://images.unsplash.com/photo-1682995539989-1947b660b879?w=600&auto=format&fit=crop&q=60&fm=webp'],
			address: 'PG Hall, OAU.',
			description: 'A prayer hall primarily serving postgraduate Muslim students, located within the Postgraduate Hall of Residence.'
		},
		{
			id: 'geology_grounds',
			label: 'Geology Grounds',
			url: '',
			images: ['https://images.unsplash.com/photo-1678481816413-00aabc64678d?w=600&auto=format&fit=crop&q=60&fm=webp'],
			address: 'Faculty of Geology, OAU.',
			description: 'A prayer space within the Faculty of Geology building, serving Muslim students and staff in the science corridor during academic hours.'
		},
		{
			id: 'computer_grounds',
			label: 'Computer Grounds',
			url: '',
			images: ['https://images.unsplash.com/photo-1600383962708-4f28dcbce116?w=600&auto=format&fit=crop&q=60&fm=webp'],
			address: 'Computer Science Department, OAU.',
			description: 'A prayer room within the Department of Computer Science, convenient for students and staff in the Faculty of Technology.'
		},
		{
			id: 'spider_grounds',
			label: 'Spider Grounds',
			url: '',
			images: ['https://images.unsplash.com/photo-1682995759960-531a5ba3a944?w=600&auto=format&fit=crop&q=60&fm=webp'],
			address: 'Spider Building, OAU.',
			description: 'A centrally located prayer space near the Spider Building, popular among students from various faculties for its accessibility.'
		},
		{
			id: 'chem_eng_grounds',
			label: 'Chem. Eng Grounds',
			url: '',
			images: ['https://images.unsplash.com/photo-1678488478981-c8cf47f2c280?w=600&auto=format&fit=crop&q=60&fm=webp'],
			address: 'Chemical Engineering Department, OAU.',
			description: 'A prayer hall within the Chemical Engineering Department, serving Muslim students and staff in the engineering faculty.'
		}
	]
};
