export interface Committee {
	id: string | number;
	name: string;
	description: string;
	image?: string;
	alt?: string;
	badge?: string;
	badgeColor?: string;
	objectives?: string[];
}

export const mockCommittees: { committees: Committee[] } = {
	committees: [
		{
			id: "islamic-affairs",
			name: "Islamic Affairs Committee",
			description:
				"Oversees Islamic education programs including Madrasah and Al-Usrah, and coordinates spiritual development for members.",
		},
		{
			id: "academic",
			name: "Academic Committee",
			description:
				"Organizes tutorials and academic support programs to help students excel in their studies.",
		},
		{
			id: "welfare",
			name: "Welfare Committee",
			description:
				"Caters to the welfare needs of members, providing support and assistance whenever needed.",
		},
		{
			id: "secondary-school",
			name: "Secondary School Committee",
			description:
				"Coordinates outreach and support for Muslim students in secondary schools within the community.",
		},
		{
			id: "moro",
			name: "Moro Committee",
			description:
				"Handles activities and outreach in the Moro community, fostering unity among Muslim residents.",
		},
		{
			id: "mosque-cleaning",
			name: "Mosque Cleaning Committee",
			description:
				"Ensures the mosque is kept clean, neat and welcoming for all worshippers at all times.",
		},
		{
			id: "jwc",
			name: "Jihad Week Committee",
			description: "Organizes the annual Jihad Week activities and competitions.",
		},
		{
			id: "an-nuur",
			name: "An-Nuur Committee",
			description:
				"In charge of publications, article writing, blogs and magazines for MSSN OAU.",
		},
	],
};
