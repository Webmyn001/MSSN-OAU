// * Executive and committee data for the marketing site (static source of truth).
// * Transcribed from: marketing/docs/NEWLY APPOINTED EXECUTIVES_260128_023101.pdf

/**
 * @typedef {Object} ExecutiveMember
 * @property {string} id
 * @property {string} name
 * @property {string} position
 * @property {'male' | 'female'} gender
 * @property {string} [phone]
 * @property {string} [photo]
 * @property {string} [bio]
 */

/**
 * @typedef {Object} ExecutiveCommittee
 * @property {string} committee
 * @property {ExecutiveMember[]} members
 */

/**
 * @typedef {Object} ExecutiveSession
 * @property {string} session
 * @property {number} start_year
 * @property {number} end_year
 * @property {ExecutiveCommittee[]} executives
 */

/**
 * @typedef {Object} ExcosData
 * @property {ExecutiveSession[]} sessions
 */

/**
 * * Normalizes Nigerian phone numbers into a consistent +234 format.
 * @param {string} raw
 * @returns {string}
 */
function normalizePhone(raw) {
	const digits = String(raw).replace(/\D/g, '');
	if (!digits) return '';
	if (digits.startsWith('234')) return `+${digits}`;
	if (digits.startsWith('0')) return `+234${digits.slice(1)}`;
	return `+234${digits}`;
}

/**
 * * Convenience helper for building members with a consistent id.
 * @param {string} committeeKey
 * @param {string} name
 * @param {string} position
 * @param {'male' | 'female'} gender
 * @param {string | undefined} phone
 * @param {string | undefined} bio
 * @returns {ExecutiveMember}
 */
function member(committeeKey, name, position, gender, phone, bio) {
	const safeName = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
	return {
		id: `${committeeKey}-${safeName}-${position.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
		name,
		position,
		gender,
		phone: phone ? normalizePhone(phone) : undefined,
		bio: bio || undefined
	};
}

/** @type {ExcosData} */
export const excos = {
	sessions: [
		{
			session: '2024/2025',
			start_year: 2024,
			end_year: 2025,
			executives: [
				{
					committee: 'Executive Council',
					members: [
						member(
							'exco',
							'Amoo Fareed',
							'Ameer',
							'male',
							'07035427158',
							'Department: Mechanical Engineering • Level: 400'
						),
						member(
							'exco',
							'Asimiyu Muhammad',
							'Naibul Ameer (Admin & Planning)',
							'male',
							'08122860576',
							'Department: Food Science and Technology • Level: 400'
						),
						member(
							'exco',
							'Bello Muhyideen',
							'Naibul Ameer (Islamic Affairs)',
							'male',
							'09164028709',
							'Department: Animal Science • Level: 400'
						),
						member(
							'exco',
							'Omosolape Ibrahim',
							'General Secretary',
							'male',
							'09134379594',
							'Department: Law • Level: 300'
						),
						member(
							'exco',
							'Shefiu-badamosi Abdulbaaqiy',
							'Assistant General Secretary',
							'male',
							'09064082338',
							'Department: Software Engineering • Level: 100'
						),
						member(
							'exco',
							'Abdulwaheed Abdul Samad',
							'Islamic Affairs Secretary',
							'male',
							'08141960215',
							'Department: Botany • Level: 300'
						),
						member(
							'exco',
							'Obayopo Abdurahman',
							'P.R.O. 1',
							'male',
							'09154677647',
							'Department: Computer Science and Engineering • Level: 200'
						),
						member(
							'exco',
							'Yusuf Abdurrahman',
							'P.R.O. 2',
							'male',
							'09029305510',
							'Department: Chemical Engineering • Level: 200'
						),
						member(
							'exco',
							'Bamidele Taofeek',
							'Financial Secretary',
							'male',
							'08160305606',
							'Department: Management and Accounting • Level: 300'
						),
						member(
							'exco',
							'Badmus Aminat',
							'Internal Auditor',
							'female',
							'09047447918',
							'Department: Management and Accounting • Level: 300'
						),
						member(
							'exco',
							'Adetomiwa Ajarat',
							'Treasurer',
							'female',
							'08069154495',
							'Department: Agric Economics • Level: 400'
						),
						member(
							'exco',
							'Alayande Abdulbasit',
							'Welfare Officer (Male)',
							'male',
							'09030517035',
							'Department: Medicine • Level: 300'
						),
						member(
							'exco',
							'Aisha Abdulkareem',
							'Welfare Officer (Female)',
							'female',
							'09132998858',
							'Department: Microbiology • Level: 200'
						),
						member(
							'exco',
							'Adunola Abdurahman',
							'ICT Director',
							'male',
							'08114992750',
							'Department: Elect Elect • Level: 300'
						),
						member(
							'exco',
							'Bashir Habeeb',
							'Librarian',
							'male',
							'09038479173',
							'Department: Cyber Security • Level: 100'
						),
						member(
							'exco',
							'Ahmad Ismail',
							'C.S.O',
							'male',
							'09059606493',
							'Department: Animal Science • Level: 300'
						),
						member(
							'exco',
							'Olakitan Abdulmalik',
							'Director of Studies',
							'male',
							'07046280367',
							'Department: Elect Elect • Level: 400'
						),
						member(
							'exco',
							'Imran Muhammad',
							'Asset Maintenance Officer',
							'male',
							'08184539045',
							'Department: Civil Engineering • Level: 300'
						),
						member(
							'mosque-cleaning',
							'Alyaqeen Muhammad',
							'Chairman (Mosque Cleaning)',
							'male',
							'09073586576',
							'Department: Mechanical Engineering • Level: 400'
						),
						member(
							'secondary-school',
							'Abdulkareem Abdulbasit',
							'Secondary School Coordinator',
							'male',
							'09079674991',
							'Department: Food Science and Technology • Level: 400'
						),
						member(
							'moro',
							'Yusuf-Ishaq Qowiyyah',
							'Chairman (Moro Committee)',
							'female',
							'07043639796',
							'Department: Nursing • Level: 100'
						),
						member(
							'sisters',
							'Olajire Baseeroh',
							'Ameerah',
							'female',
							'09026043219',
							'Department: English • Level: 300'
						),
						member(
							'sisters',
							'Adigun Mubashiroh',
							'Naibatul Ameerah',
							'female',
							'07046014209',
							'Department: Economics Education • Level: 300'
						),
						member(
							'sisters-circle',
							'Balogun Maryam',
							"Secretary (Sisters' Circle)",
							'female',
							'08058600854',
							'Department: Animal Science • Level: 300'
						),
						member(
							'sisters-circle',
							'Adesina Rodiat',
							"P.R.O. (Sisters' Circle)",
							'female',
							'07089066787',
							'Department: English • Level: 300'
						),
						member(
							'sisters-circle',
							'Adebisi Rofiyat',
							"Assistant Secretary (Sisters' Circle)",
							'female',
							'09071522483',
							'Department: Industrial Chemistry • Level: 200'
						),
						member(
							'sisters-circle',
							'Abdurrauf Qiyamatullah',
							"Assistant P.R.O. (Sisters' Circle)",
							'female',
							'08116544554',
							'Department: Agric Extension • Level: 300'
						),
						member(
							'exco',
							'Yekini Abdulmuizz',
							'Ex-Officio 1',
							'male',
							'08108003765',
							'Department: Civil Engineering • Level: 300'
						),
						member(
							'exco',
							'Sodamade Bushroh',
							'Ex-Officio 2',
							'female',
							'08109592556',
							'Department: Crop Production and Protection • Level: 400'
						)
					]
				},
				{
					committee: 'Faculty Co-ordinators',
					members: [
						member(
							'faculty-admin',
							'Muritala Jamiu Agbolahan',
							'Coordinator (Faculty of Administration)',
							'male',
							'07080525973',
							'Department: Management & Accounting • Level: 300'
						),
						member(
							'faculty-arts',
							'Abiola Abdur-Roqeeb',
							'Coordinator (Faculty of Arts)',
							'male',
							'08117879991',
							'Department: English • Level: 100'
						),
						member(
							'faculty-agric',
							'Hammed Lukman Olansile',
							'Coordinator (Faculty of Agriculture)',
							'male',
							'08134678035',
							'Department: Crop Production and Protection • Level: 400'
						),
						member(
							'faculty-edm',
							'Agbaje Abdul-Samad',
							'Coordinator (Faculty of EDM)',
							'male',
							'08124708418',
							'Department: Quantity Survey • Level: 500'
						),
						member(
							'faculty-edu',
							'AbdulRozaq Badirudeen',
							'Coordinator (Faculty of Education)',
							'male',
							'09030081492',
							'Department: ASE • Level: 300'
						),
						// member("faculty-pharm", "Faculty of Pharmacy", "Coordinator", "male", undefined, "Coordinator details not listed in the source PDF."),
						member(
							'faculty-tech',
							'Adesoji Ridwanullah',
							'Coordinator (Faculty of Technology)',
							'male',
							'09039193613',
							'Department: Chemical Engineering • Level: 400'
						),
						member(
							'faculty-science',
							'Musa Abdullateef Bamidele',
							'Coordinator (Faculty of Science)',
							'male',
							'09064093672',
							'Department: Botany • Level: 300'
						),
						member(
							'faculty-social',
							'Bamigbade Ibrahim',
							'Coordinator (Faculty of Social Science)',
							'male',
							'07038435628',
							'Department: Sociology • Level: 300'
						),
						member(
							'faculty-chs',
							'Faozan Shittu',
							'Coordinator (College of Health Sciences)',
							'male',
							'08078170778',
							'Department: Medicine • Level: 600'
						)
					]
				},
				{
					committee: 'An-Nur Press Agency Editorial Board',
					members: [
						member(
							'annur',
							'Abdurrazzaq Tasleem',
							'Editor-in-Chief',
							'male',
							'09161535761',
							'Department: Linguistics • Level: 300'
						),
						member(
							'annur',
							'Yusuf Idera Nimah',
							'Deputy Editor-in-Chief',
							'female',
							'09068685712',
							'Department: Food Nutrition and Consumer Science • Level: 400'
						),
						member(
							'annur',
							'Aderibigbe Hikmah',
							'Editor',
							'female',
							'09070144506',
							'Department: Linguistics • Level: 300'
						),
						member(
							'annur',
							'Zakariyyah Salamah',
							'Secretary',
							'female',
							'07063054487',
							'Department: English • Level: 300'
						),
						member(
							'annur',
							'Munirudeen Abdullah',
							'Member',
							'male',
							'09161820684',
							'Department: English • Level: 300'
						),
						member(
							'annur',
							'Owuda Zainab Oraachi',
							'Member',
							'female',
							'07088364315',
							'Department: Law • Level: 100'
						)
					]
				},
				{
					committee: 'Business Committee',
					members: [
						member(
							'business',
							'Lukman Hammed',
							'Chairman',
							'male',
							'08134678035',
							'Department: Crop Production and Protection • Level: 400'
						),
						member(
							'business',
							'Abdul-Azeez Mubarak',
							'Secretary',
							'male',
							'09156501903',
							'Department: Local Government Studies • Level: 200'
						),
						member(
							'business',
							'Amusat Shukroh',
							'Member',
							'female',
							'09066971711',
							'Department: Engineering Physics • Level: 300'
						),
						member(
							'business',
							'Dauda Hajaroh',
							'Member',
							'male',
							'09056305848',
							'Department: Agric Economics • Level: 400'
						),
						member(
							'business',
							'Adebowale Samiat',
							'Member',
							'female',
							'09056305848',
							'Department: Animal Science • Level: 400'
						),
						member(
							'business',
							'Oladepo Rahmatallah',
							'Member',
							'female',
							'09056305848',
							'Department: Law • Level: 300'
						),
						member(
							'business',
							'Alabi Abdulmuiz',
							'Member',
							'male',
							'09031465309',
							'Department: Electrical Engineering • Level: 300'
						)
					]
				},
				{
					committee: 'Welfare Committee',
					members: [
						member(
							'welfare',
							'Soneye Ibrahim',
							'Vice Chairman',
							'male',
							'07039538099',
							'Department: Mechanical Engineering • Level: 300'
						),
						member(
							'welfare',
							'Agbaje Habeeb',
							'Vice Chairman (Hospitality)',
							'male',
							'08039635076',
							'Department: Material Science and Engineering • Level: 300'
						),
						member(
							'welfare',
							'Adebisi Sofiyyah',
							'Secretary',
							'female',
							'08089719027',
							'Department: Pure Chemistry • Level: 200'
						),
						member(
							'welfare',
							'Akorede Kamaldeen',
							'Member',
							'male',
							'08107066776',
							'Department: Material Science and Engineering • Level: 200'
						),
						member(
							'welfare',
							'Yusuf Rizqoh',
							'Member',
							'female',
							'08166583288',
							'Department: Mass Communication • Level: 200'
						),
						member(
							'welfare',
							'Adeagbo Maryam',
							'Member',
							'female',
							'07050721681',
							'Department: Microbiology • Level: 200'
						),
						member(
							'welfare',
							'Adebisi Rofiyah',
							'Member (Hospitality)',
							'female',
							'09071522483',
							'Department: Chemistry • Level: 200'
						),
						member(
							'welfare',
							'Adedeji Haleemah',
							'Member (Hospitality)',
							'female',
							'08128275759',
							'Department: Business Administration • Level: 300'
						),
						member(
							'welfare',
							'Sulaiman Al-Ameen Akanbi',
							'Member (Hospitality)',
							'male',
							'09017190873',
							'Department: Chemical Engineering • Level: 200'
						)
					]
				},
				{
					committee: 'Academic Committee',
					members: [
						member(
							'academic',
							'Adesope Muadh',
							'Vice Chairman',
							'male',
							'07045904974',
							'Department: Elect Elect • Level: 300'
						),
						member(
							'academic',
							'Alli Abd. Qoyyum',
							'Secretary',
							'male',
							'09034645736',
							'Department: Elect Elect • Level: 200'
						),
						member(
							'academic',
							'Alao Abdulbasit',
							'Member',
							'male',
							'09020850362',
							'Department: Elect Elect • Level: 300'
						),
						member(
							'academic',
							'Adesina Rodiat',
							'Member',
							'female',
							'07089066787',
							'Department: English • Level: 300'
						),
						member(
							'academic',
							'Omotosho Mutiullah',
							'Member',
							'male',
							'08061776337',
							'Department: Civil Engineering • Level: 300'
						),
						member(
							'academic',
							'Isiaka Yusuf',
							'Member',
							'male',
							'07032178035',
							'Department: Mechanical Engineering • Level: 300'
						)
					]
				},
				{
					committee: 'ICT and Publicity Team',
					members: [
						member(
							'ict',
							'Adewoye Mubarak',
							'Vice Chairman',
							'male',
							'09027719147',
							'Department: Education • Level: 300'
						),
						member(
							'ict',
							'Raji Ummul-Khayr',
							'Secretary',
							'female',
							'09049097877',
							'Department: Pharmacy • Level: 300'
						),
						member(
							'ict',
							'Adekunle Abdulqudus',
							'Member',
							'male',
							'08123361499',
							'Department: Business Administration • Level: 200'
						),
						member(
							'ict',
							'Adefila Tohir',
							'Member',
							'male',
							'07053841009',
							'Department: Accounting • Level: 300'
						),
						member(
							'ict',
							'Abdulhameed (Electron)',
							'Member',
							'male',
							'09036111833',
							'Department: Elect Elect • Level: 300'
						)
					]
				},
				{
					committee: 'Mosque Cleaning Committee',
					members: [
						member(
							'mosque-cleaning',
							'Alyaqeen Muhammad',
							'Chairman',
							'male',
							'09073586576',
							'Listed as Chairman Mosque Cleaning in the main EXCO list.'
						),
						member(
							'mosque-cleaning',
							'Bankole Sofiyyah',
							'Vice Chairman',
							'female',
							'08130463339',
							'Department: Medical Rehab • Level: 300'
						),
						member(
							'mosque-cleaning',
							'Abojututu Muhammad',
							'Member',
							'male',
							'08108263605',
							'Department: Computer Engineering • Level: 100'
						),
						member(
							'mosque-cleaning',
							'Akande Zainab',
							'Member',
							'female',
							'09063148133',
							'Department: Management and Accounting • Level: 200'
						),
						member(
							'mosque-cleaning',
							'Akorede Khalid',
							'Member',
							'male',
							'09014667975',
							'Department: Material Science and Engineering • Level: 200'
						)
					]
				},
				{
					committee: 'Moro Committee',
					members: [
						member(
							'moro',
							'Yusuf-Ishaq Qowiyyah',
							'Chairman',
							'female',
							'07043639796',
							'Listed as Chairman Moro Committee in the main EXCO list.'
						),
						member(
							'moro',
							'Adedokun Aisha',
							'Vice Chairman',
							'female',
							'08147682561',
							'Department: Art and Social Science Education • Level: 200'
						),
						member(
							'moro',
							'Tajudeen Ismail',
							'Secretary',
							'male',
							'09160310042',
							'Department: Medicine • Level: 100'
						)
					]
				},
				{
					committee: 'Secondary School Committee',
					members: [
						member(
							'secondary-school',
							'Abdulkareem Abdulbasit',
							'Coordinator',
							'male',
							'09079674991',
							'Listed as Secondary School Coordinator in the main EXCO list.'
						),
						member(
							'secondary-school',
							'Omotosho Mutiullah',
							'Vice Chairman',
							'male',
							'08061776337',
							'Department: Civil Engineering • Level: 300'
						),
						member(
							'secondary-school',
							'Oyinlola Royhanah',
							'Secretary',
							'female',
							'08127178813',
							'Department: Accounting • Level: 200'
						),
						member(
							'secondary-school',
							'Badmus Muheebah',
							'Member',
							'female',
							'08089952221',
							'Department: Elect Elect • Level: 300'
						),
						member(
							'secondary-school',
							'Muslm Abdulgafar',
							'Member',
							'male',
							'08169120477',
							'Department: Building • Level: 300'
						)
					]
				},
				{
					committee: 'Asset Maintenance Office',
					members: [
						member(
							'asset',
							'Imran Muhammad',
							'Asset Maintenance Officer',
							'male',
							'08184539045',
							'Listed in the main EXCO list.'
						),
						member(
							'asset',
							'Adedokun Abdurrahman',
							'Vice Chairman',
							'male',
							'07025599019',
							'Department: Chemical Engineering • Level: 300'
						),
						member(
							'asset',
							'Yusuf Bashir',
							'Secretary',
							'male',
							'09063895319',
							'Department: Surveying and Geoinformatics • Level: 300'
						)
					]
				},
				{
					committee: 'Shuuroh',
					members: [
						member(
							'shuuroh',
							'Hamzat Abdul-Awwal',
							'Chairman Shuuroh',
							'male',
							undefined,
							undefined
						),
						member(
							'shuuroh',
							'Salako Adegoke M.',
							'Secretary Shuuroh',
							'male',
							undefined,
							undefined
						)
					]
				}
			]
		}
	]
};
