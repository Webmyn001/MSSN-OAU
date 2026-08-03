export interface ExecutiveMember {
  id: string;
  name: string;
  position: string;
  gender: 'male' | 'female';
  phone?: string;
  email?: string;
  photo?: string;
  bio?: string;
}

export interface ExecutiveCommittee {
  committee: string;
  members: ExecutiveMember[];
}

export interface ExecutiveSession {
  session: string;
  start_year: number;
  end_year: number;
  executives: ExecutiveCommittee[];
}

export interface ExcosData {
  sessions: ExecutiveSession[];
}

export const sampleExcosData: ExcosData = {
  "sessions": [
    {
      "session": "2024/2025",
      "start_year": 2024,
      "end_year": 2025,
      "executives": [
        {
          "committee": "Executive Council",
          "members": [
            {
              "id": "exco-amao-fareed-ameer",
              "name": "Amao Fareed",
              "position": "Ameer",
              "gender": "male",
              "phone": "+2347035427158",
              "bio": "Department: Mechanical Engineering â¢ Level: 500"
            },
            {
              "id": "exco-asimiyu-muhammad-naibul-ameer-admin-planning-",
              "name": "Asimiyu Muhammad",
              "position": "Naibul Ameer (Admin & Planning)",
              "gender": "male",
              "phone": "+2348122860576",
              "bio": "Department: Food Science and Technology â¢ Level: 500"
            },
            {
              "id": "exco-bello-muhyideen-naibul-ameer-islamic-affairs-",
              "name": "Bello Muhyideen",
              "position": "Naibul Ameer (Islamic Affairs)",
              "gender": "male",
              "phone": "+2349164028709",
              "bio": "Department: Soil Science and Land Resources Mngt â¢ Level: 500"
            },
            {
              "id": "exco-omosolape-ibrahim-general-secretary",
              "name": "Omosolape Ibrahim",
              "position": "General Secretary",
              "gender": "male",
              "phone": "+2349134379594",
              "bio": "Department: Law â¢ Level: 400"
            },
            {
              "id": "exco-shefiu-badamosi-abdulbaaqiy-assistant-general-secretary",
              "name": "Shefiu-badamosi Abdulbaaqiy",
              "position": "Assistant General Secretary",
              "gender": "male",
              "phone": "+2349064082338",
              "bio": "Department: Software Engineering â¢ Level: 200"
            },
            {
              "id": "exco-abdulwaheed-abdul-samad-islamic-affairs-secretary",
              "name": "Abdulwaheed Abdul Samad",
              "position": "Islamic Affairs Secretary",
              "gender": "male",
              "phone": "+2348141960215",
              "bio": "Department: Botany â¢ Level: 400"
            },
            {
              "id": "exco-obayopo-abdurahman-p-r-o-1",
              "name": "Obayopo Abdurahman",
              "position": "P.R.O. 1",
              "gender": "male",
              "phone": "+2349154677647",
              "bio": "Department: Computer Science and Engineering â¢ Level: 300"
            },
            {
              "id": "exco-yusuf-abdurrahman-p-r-o-2",
              "name": "Yusuf Abdurrahman",
              "position": "P.R.O. 2",
              "gender": "male",
              "phone": "+2349029305510",
              "bio": "Department: Chemical Engineering â¢ Level: 300"
            },
            {
              "id": "exco-bamidele-taofeek-financial-secretary",
              "name": "Bamidele Taofeek",
              "position": "Financial Secretary",
              "gender": "male",
              "phone": "+2348160305606",
              "bio": "Department: Management and Accounting â¢ Level: 400"
            },
            {
              "id": "exco-badmus-aminat-internal-auditor",
              "name": "Badmus Aminat",
              "position": "Internal Auditor",
              "gender": "female",
              "phone": "+2349047447918",
              "bio": "Department: Management and Accounting â¢ Level: 400"
            },
            {
              "id": "exco-adetomiwa-ajarat-treasurer",
              "name": "Adetomiwa Ajarat",
              "position": "Treasurer",
              "gender": "female",
              "phone": "+2348069154495",
              "bio": "Department: Agric Economics â¢ Level: 500"
            },
            {
              "id": "exco-alayande-abdulbasit-welfare-officer-male-",
              "name": "Alayande Abdulbasit",
              "position": "Welfare Officer (Male)",
              "gender": "male",
              "phone": "+2349030517035",
              "bio": "Department: Medicine â¢ Level: 400"
            },
            {
              "id": "exco-aisha-abdulkareem-welfare-officer-female-",
              "name": "Aisha Abdulkareem",
              "position": "Welfare Officer (Female)",
              "gender": "female",
              "phone": "+2349132998858",
              "bio": "Department: Microbiology â¢ Level: 300"
            },
            {
              "id": "exco-adunola-abdurahman-ict-director",
              "name": "Adunola Abdurahman",
              "position": "ICT Director",
              "gender": "male",
              "phone": "+2348114992750",
              "bio": "Department: Elect Elect â¢ Level: 400"
            },
            {
              "id": "exco-bashir-habeeb-librarian",
              "name": "Bashir Habeeb",
              "position": "Librarian",
              "gender": "male",
              "phone": "+2349038479173",
              "bio": "Department: Cyber Security â¢ Level: 200"
            },
            {
              "id": "exco-ahmad-ismail-c-s-o",
              "name": "Ahmad Ismail",
              "position": "C.S.O",
              "gender": "male",
              "phone": "+2349059606493",
              "bio": "Department: Animal Science â¢ Level: 400"
            },
            {
              "id": "exco-olakitan-abdulmalik-director-of-studies",
              "name": "Olakitan Abdulmalik",
              "position": "Director of Studies",
              "gender": "male",
              "phone": "+2347046280367",
              "bio": "Department: Elect Elect â¢ Level: 500"
            },
            {
              "id": "exco-imran-muhammad-asset-maintenance-officer",
              "name": "Imran Muhammad",
              "position": "Asset Maintenance Officer",
              "gender": "male",
              "phone": "+2348184539045",
              "bio": "Department: Civil Engineering â¢ Level: 400"
            },
            {
              "id": "mosque-cleaning-alyaqeen-muhammad-chairman-mosque-cleaning-",
              "name": "Alyaqeen Muhammad",
              "position": "Chairman (Mosque Cleaning)",
              "gender": "male",
              "phone": "+2349073586576",
              "bio": "Department: Mechanical Engineering â¢ Level: 500"
            },
            {
              "id": "secondary-school-abdulkareem-abdulbasit-secondary-school-coordinator",
              "name": "Abdulkareem Abdulbasit",
              "position": "Secondary School Coordinator",
              "gender": "male",
              "phone": "+2349079674991",
              "bio": "Department: Food Science and Technology â¢ Level: 500"
            },
            {
              "id": "moro-yusuf-ishaq-qowiyyah-chairman-moro-committee-",
              "name": "Yusuf-Ishaq Qowiyyah",
              "position": "Chairman (Moro Committee)",
              "gender": "female",
              "phone": "+2347043639796",
              "bio": "Department: Nursing â¢ Level: 200"
            },
            {
              "id": "sisters-olajire-baseeroh-ameerah",
              "name": "Olajire Baseeroh",
              "position": "Ameerah",
              "gender": "female",
              "phone": "+2349026043219",
              "bio": "Department: English â¢ Level: 400"
            },
            {
              "id": "sisters-adigun-mubashiroh-naibatul-ameerah",
              "name": "Adigun Mubashiroh",
              "position": "Naibatul Ameerah",
              "gender": "female",
              "phone": "+2347046014209",
              "bio": "Department: Economics Education â¢ Level: 400"
            },
            {
              "id": "sisters-circle-adeagbo-maryam-secretary-sisters-circle-",
              "name": "Adeagbo Maryam",
              "position": "Secretary (Sisters' Circle)",
              "gender": "female",
              "phone": "+2347050721681",
              "bio": "Department: Microbiology â¢ Level: 300"
            },
            {
              "id": "sisters-circle-adesina-rodiat-p-r-o-sisters-circle-",
              "name": "Adesina Rodiat",
              "position": "P.R.O. (Sisters' Circle)",
              "gender": "female",
              "phone": "+2347089066787",
              "bio": "Department: English â¢ Level: 400"
            },
            {
              "id": "sisters-circle-adebisi-rofiyat-assistant-secretary-sisters-circle-",
              "name": "Adebisi Rofiyat",
              "position": "Assistant Secretary (Sisters' Circle)",
              "gender": "female",
              "phone": "+2349071522483",
              "bio": "Department: Industrial Chemistry â¢ Level: 300"
            },
            {
              "id": "sisters-circle-abdurrauf-qiyamatullah-assistant-p-r-o-sisters-circle-",
              "name": "Abdurrauf Qiyamatullah",
              "position": "Assistant P.R.O. (Sisters' Circle)",
              "gender": "female",
              "phone": "+2348116544554",
              "bio": "Department: Agric Extension â¢ Level: 400"
            },
            {
              "id": "exco-yekini-abdulmuizz-ex-officio-1",
              "name": "Yekini Abdulmuizz",
              "position": "Ex-Officio 1",
              "gender": "male",
              "phone": "+2348108003765",
              "bio": "Department: Civil Engineering â¢ Level: 400"
            },
            {
              "id": "exco-sodamade-bushroh-ex-officio-2",
              "name": "Sodamade Bushroh",
              "position": "Ex-Officio 2",
              "gender": "female",
              "phone": "+2348109592556",
              "bio": "Department: Crop Production and Protection â¢ Level: 500"
            }
          ]
        },
        {
          "committee": "Faculty Co-ordinators",
          "members": [
            {
              "id": "faculty-admin-muritala-jamiu-agbolahan-coordinator-faculty-of-administration-",
              "name": "Muritala Jamiu Agbolahan",
              "position": "Coordinator (Faculty of Administration)",
              "gender": "male",
              "phone": "+2347080525973",
              "bio": "Department: Management & Accounting â¢ Level: 400"
            },
            {
              "id": "faculty-arts-abiola-abdur-roqeeb-coordinator-faculty-of-arts-",
              "name": "Abiola Abdur-Roqeeb",
              "position": "Coordinator (Faculty of Arts)",
              "gender": "male",
              "phone": "+2348117879991",
              "bio": "Department: English â¢ Level: 200"
            },
            {
              "id": "faculty-agric-hammed-lukman-olansile-coordinator-faculty-of-agriculture-",
              "name": "Hammed Lukman Olansile",
              "position": "Coordinator (Faculty of Agriculture)",
              "gender": "male",
              "phone": "+2348134678035",
              "bio": "Department: Crop Production and Protection â¢ Level: 500"
            },
            {
              "id": "faculty-edm-agbaje-abdul-samad-coordinator-faculty-of-edm-",
              "name": "Agbaje Abdul-Samad",
              "position": "Coordinator (Faculty of EDM)",
              "gender": "male",
              "phone": "+2348124708418",
              "bio": "Department: Quantity Survey â¢ Level: 600"
            },
            {
              "id": "faculty-edu-abdulrozaq-badirudeen-coordinator-faculty-of-education-",
              "name": "AbdulRozaq Badirudeen",
              "position": "Coordinator (Faculty of Education)",
              "gender": "male",
              "phone": "+2349030081492",
              "bio": "Department: ASE â¢ Level: 400"
            },
            {
              "id": "faculty-tech-adesoji-ridwanullah-coordinator-faculty-of-technology-",
              "name": "Adesoji Ridwanullah",
              "position": "Coordinator (Faculty of Technology)",
              "gender": "male",
              "phone": "+2349039193613",
              "bio": "Department: Chemical Engineering â¢ Level: 500"
            },
            {
              "id": "faculty-science-musa-abdullateef-bamidele-coordinator-faculty-of-science-",
              "name": "Musa Abdullateef Bamidele",
              "position": "Coordinator (Faculty of Science)",
              "gender": "male",
              "phone": "+2349064093672",
              "bio": "Department: Botany â¢ Level: 400"
            },
            {
              "id": "faculty-social-bamigbade-ibrahim-coordinator-faculty-of-social-science-",
              "name": "Bamigbade Ibrahim",
              "position": "Coordinator (Faculty of Social Science)",
              "gender": "male",
              "phone": "+2347038435628",
              "bio": "Department: Sociology â¢ Level: 400"
            },
            {
              "id": "faculty-chs-faozan-shittu-coordinator-college-of-health-sciences-",
              "name": "Faozan Shittu",
              "position": "Coordinator (College of Health Sciences)",
              "gender": "male",
              "phone": "+2348078170778",
              "bio": "Department: Medicine â¢ Level: 700"
            }
          ]
        },
        {
          "committee": "An-Nur Press Agency Editorial Board",
          "members": [
            {
              "id": "annur-abdurrazzaq-tasleem-editor-in-chief",
              "name": "Abdurrazzaq Tasleem",
              "position": "Editor-in-Chief",
              "gender": "male",
              "phone": "+2349161535761",
              "bio": "Department: Linguistics â¢ Level: 400"
            },
            {
              "id": "annur-yusuf-idera-nimah-deputy-editor-in-chief",
              "name": "Yusuf Idera Nimah",
              "position": "Deputy Editor-in-Chief",
              "gender": "female",
              "phone": "+2349068685712",
              "bio": "Department: Food Nutrition and Consumer Science â¢ Level: 500"
            },
            {
              "id": "annur-aderibigbe-hikmah-editor",
              "name": "Aderibigbe Hikmah",
              "position": "Editor",
              "gender": "female",
              "phone": "+2349070144506",
              "bio": "Department: Linguistics â¢ Level: 400"
            },
            {
              "id": "annur-zakariyyah-salamah-secretary",
              "name": "Zakariyyah Salamah",
              "position": "Secretary",
              "gender": "female",
              "phone": "+2347063054487",
              "bio": "Department: English â¢ Level: 400"
            },
            {
              "id": "annur-munirudeen-abdullah-member",
              "name": "Munirudeen Abdullah",
              "position": "Member",
              "gender": "male",
              "phone": "+2349161820684",
              "bio": "Department: English â¢ Level: 400"
            },
            {
              "id": "annur-owuda-zainab-oraachi-member",
              "name": "Owuda Zainab Oraachi",
              "position": "Member",
              "gender": "female",
              "phone": "+2347088364315",
              "bio": "Department: Law â¢ Level: 200"
            }
          ]
        },
        {
          "committee": "Business Committee",
          "members": [
            {
              "id": "business-lukman-hammed-chairman",
              "name": "Lukman Hammed",
              "position": "Chairman",
              "gender": "male",
              "phone": "+2348134678035",
              "bio": "Department: Crop Production and Protection â¢ Level: 500"
            },
            {
              "id": "business-abdul-azeez-mubarak-secretary",
              "name": "Abdul-Azeez Mubarak",
              "position": "Secretary",
              "gender": "male",
              "phone": "+2349156501903",
              "bio": "Department: Local Government Studies â¢ Level: 300"
            },
            {
              "id": "business-amusat-shukroh-member",
              "name": "Amusat Shukroh",
              "position": "Member",
              "gender": "female",
              "phone": "+2349066971711",
              "bio": "Department: Engineering Physics â¢ Level: 400"
            },
            {
              "id": "business-dauda-hajaroh-member",
              "name": "Dauda Hajaroh",
              "position": "Member",
              "gender": "male",
              "phone": "+2349056305848",
              "bio": "Department: Agric Economics â¢ Level: 500"
            },
            {
              "id": "business-adebowale-samiat-member",
              "name": "Adebowale Samiat",
              "position": "Member",
              "gender": "female",
              "phone": "+2349056305848",
              "bio": "Department: Animal Science â¢ Level: 500"
            },
            {
              "id": "business-oladepo-rahmatallah-member",
              "name": "Oladepo Rahmatallah",
              "position": "Member",
              "gender": "female",
              "phone": "+2349056305848",
              "bio": "Department: Law â¢ Level: 400"
            },
            {
              "id": "business-alabi-abdulmuiz-member",
              "name": "Alabi Abdulmuiz",
              "position": "Member",
              "gender": "male",
              "phone": "+2349031465309",
              "bio": "Department: Electrical Engineering â¢ Level: 400"
            }
          ]
        },
        {
          "committee": "Welfare Committee",
          "members": [
            {
              "id": "welfare-soneye-ibrahim-vice-chairman",
              "name": "Soneye Ibrahim",
              "position": "Vice Chairman",
              "gender": "male",
              "phone": "+2347039538099",
              "bio": "Department: Mechanical Engineering â¢ Level: 400"
            },
            {
              "id": "welfare-agbaje-habeeb-vice-chairman-hospitality-",
              "name": "Agbaje Habeeb",
              "position": "Vice Chairman (Hospitality)",
              "gender": "male",
              "phone": "+2348039635076",
              "bio": "Department: Material Science and Engineering â¢ Level: 400"
            },
            {
              "id": "welfare-adebisi-sofiyyah-secretary",
              "name": "Adebisi Sofiyyah",
              "position": "Secretary",
              "gender": "female",
              "phone": "+2348089719027",
              "bio": "Department: Pure Chemistry â¢ Level: 300"
            },
            {
              "id": "welfare-akorede-kamaldeen-member",
              "name": "Akorede Kamaldeen",
              "position": "Member",
              "gender": "male",
              "phone": "+2348107066776",
              "bio": "Department: Material Science and Engineering â¢ Level: 300"
            },
            {
              "id": "welfare-yusuf-rizqoh-member",
              "name": "Yusuf Rizqoh",
              "position": "Member",
              "gender": "female",
              "phone": "+2348166583288",
              "bio": "Department: Mass Communication â¢ Level: 300"
            },
            {
              "id": "welfare-adeagbo-maryam-member",
              "name": "Adeagbo Maryam",
              "position": "Member",
              "gender": "female",
              "phone": "+2347050721681",
              "bio": "Department: Microbiology â¢ Level: 300"
            },
            {
              "id": "welfare-adebisi-rofiyah-member-hospitality-",
              "name": "Adebisi Rofiyah",
              "position": "Member (Hospitality)",
              "gender": "female",
              "phone": "+2349071522483",
              "bio": "Department: Chemistry â¢ Level: 300"
            },
            {
              "id": "welfare-adedeji-haleemah-member-hospitality-",
              "name": "Adedeji Haleemah",
              "position": "Member (Hospitality)",
              "gender": "female",
              "phone": "+2348128275759",
              "bio": "Department: Business Administration â¢ Level: 400"
            },
            {
              "id": "welfare-sulaiman-al-ameen-akanbi-member-hospitality-",
              "name": "Sulaiman Al-Ameen Akanbi",
              "position": "Member (Hospitality)",
              "gender": "male",
              "phone": "+2349017190873",
              "bio": "Department: Chemical Engineering â¢ Level: 300"
            }
          ]
        },
        {
          "committee": "Academic Committee",
          "members": [
            {
              "id": "academic-adesope-muadh-vice-chairman",
              "name": "Adesope Muadh",
              "position": "Vice Chairman",
              "gender": "male",
              "phone": "+2347045904974",
              "bio": "Department: Elect Elect â¢ Level: 400"
            },
            {
              "id": "academic-alli-abd-qoyyum-secretary",
              "name": "Alli Abd. Qoyyum",
              "position": "Secretary",
              "gender": "male",
              "phone": "+2349034645736",
              "bio": "Department: Elect Elect â¢ Level: 300"
            },
            {
              "id": "academic-alao-abdulbasit-member",
              "name": "Alao Abdulbasit",
              "position": "Member",
              "gender": "male",
              "phone": "+2349020850362",
              "bio": "Department: Elect Elect â¢ Level: 400"
            },
            {
              "id": "academic-adesina-rodiat-member",
              "name": "Adesina Rodiat",
              "position": "Member",
              "gender": "female",
              "phone": "+2347089066787",
              "bio": "Department: English â¢ Level: 400"
            },
            {
              "id": "academic-omotosho-mutiullah-member",
              "name": "Omotosho Mutiullah",
              "position": "Member",
              "gender": "male",
              "phone": "+2348061776337",
              "bio": "Department: Civil Engineering â¢ Level: 400"
            },
            {
              "id": "academic-isiaka-yusuf-member",
              "name": "Isiaka Yusuf",
              "position": "Member",
              "gender": "male",
              "phone": "+2347032178035",
              "bio": "Department: Mechanical Engineering â¢ Level: 400"
            }
          ]
        },
        {
          "committee": "ICT and Publicity Team",
          "members": [
            {
              "id": "ict-adewoye-mubarak-vice-chairman",
              "name": "Adewoye Mubarak",
              "position": "Vice Chairman",
              "gender": "male",
              "phone": "+2349027719147",
              "bio": "Department: Education â¢ Level: 400"
            },
            {
              "id": "ict-raji-ummul-khayr-secretary",
              "name": "Raji Ummul-Khayr",
              "position": "Secretary",
              "gender": "female",
              "phone": "+2349049097877",
              "bio": "Department: Pharmacy â¢ Level: 400"
            },
            {
              "id": "ict-adekunle-abdulqudus-member",
              "name": "Adekunle Abdulqudus",
              "position": "Member",
              "gender": "male",
              "phone": "+2348123361499",
              "bio": "Department: Business Administration â¢ Level: 300"
            },
            {
              "id": "ict-adefila-tohir-member",
              "name": "Adefila Tohir",
              "position": "Member",
              "gender": "male",
              "phone": "+2347053841009",
              "bio": "Department: Accounting â¢ Level: 400"
            },
            {
              "id": "ict-abdulhameed-electron-member",
              "name": "Abdulhameed (Electron)",
              "position": "Member",
              "gender": "male",
              "phone": "+2349036111833",
              "bio": "Department: Elect Elect â¢ Level: 400"
            }
          ]
        },
        {
          "committee": "Mosque Cleaning Committee",
          "members": [
            {
              "id": "mosque-cleaning-alyaqeen-muhammad-chairman",
              "name": "Alyaqeen Muhammad",
              "position": "Chairman",
              "gender": "male",
              "phone": "+2349073586576",
              "bio": "Listed as Chairman Mosque Cleaning in the main EXCO list."
            },
            {
              "id": "mosque-cleaning-bankole-sofiyyah-vice-chairman",
              "name": "Bankole Sofiyyah",
              "position": "Vice Chairman",
              "gender": "female",
              "phone": "+2348130463339",
              "bio": "Department: Medical Rehab â¢ Level: 400"
            },
            {
              "id": "mosque-cleaning-abojututu-muhammad-member",
              "name": "Abojututu Muhammad",
              "position": "Member",
              "gender": "male",
              "phone": "+2348108263605",
              "bio": "Department: Computer Engineering â¢ Level: 200"
            },
            {
              "id": "mosque-cleaning-akande-zainab-member",
              "name": "Akande Zainab",
              "position": "Member",
              "gender": "female",
              "phone": "+2349063148133",
              "bio": "Department: Management and Accounting â¢ Level: 300"
            },
            {
              "id": "mosque-cleaning-akorede-khalid-member",
              "name": "Akorede Khalid",
              "position": "Member",
              "gender": "male",
              "phone": "+2349014667975",
              "bio": "Department: Material Science and Engineering â¢ Level: 300"
            }
          ]
        },
        {
          "committee": "Moro Committee",
          "members": [
            {
              "id": "moro-yusuf-ishaq-qowiyyah-chairman",
              "name": "Yusuf-Ishaq Qowiyyah",
              "position": "Chairman",
              "gender": "female",
              "phone": "+2347043639796",
              "bio": "Listed as Chairman Moro Committee in the main EXCO list."
            },
            {
              "id": "moro-adedokun-aisha-vice-chairman",
              "name": "Adedokun Aisha",
              "position": "Vice Chairman",
              "gender": "female",
              "phone": "+2348147682561",
              "bio": "Department: Art and Social Science Education â¢ Level: 300"
            },
            {
              "id": "moro-tajudeen-ismail-secretary",
              "name": "Tajudeen Ismail",
              "position": "Secretary",
              "gender": "male",
              "phone": "+2349160310042",
              "bio": "Department: Medicine â¢ Level: 200"
            }
          ]
        },
        {
          "committee": "Secondary School Committee",
          "members": [
            {
              "id": "secondary-school-abdulkareem-abdulbasit-coordinator",
              "name": "Abdulkareem Abdulbasit",
              "position": "Coordinator",
              "gender": "male",
              "phone": "+2349079674991",
              "bio": "Listed as Secondary School Coordinator in the main EXCO list."
            },
            {
              "id": "secondary-school-omotosho-mutiullah-vice-chairman",
              "name": "Omotosho Mutiullah",
              "position": "Vice Chairman",
              "gender": "male",
              "phone": "+2348061776337",
              "bio": "Department: Civil Engineering â¢ Level: 400"
            },
            {
              "id": "secondary-school-oyinlola-royhanah-secretary",
              "name": "Oyinlola Royhanah",
              "position": "Secretary",
              "gender": "female",
              "phone": "+2348127178813",
              "bio": "Department: Accounting â¢ Level: 300"
            },
            {
              "id": "secondary-school-badmus-muheebah-member",
              "name": "Badmus Muheebah",
              "position": "Member",
              "gender": "female",
              "phone": "+2348089952221",
              "bio": "Department: Elect Elect â¢ Level: 400"
            },
            {
              "id": "secondary-school-muslm-abdulgafar-member",
              "name": "Muslm Abdulgafar",
              "position": "Member",
              "gender": "male",
              "phone": "+2348169120477",
              "bio": "Department: Building â¢ Level: 400"
            }
          ]
        },
        {
          "committee": "Asset Maintenance Office",
          "members": [
            {
              "id": "asset-imran-muhammad-asset-maintenance-officer",
              "name": "Imran Muhammad",
              "position": "Asset Maintenance Officer",
              "gender": "male",
              "phone": "+2348184539045",
              "bio": "Listed in the main EXCO list."
            },
            {
              "id": "asset-adedokun-abdurrahman-vice-chairman",
              "name": "Adedokun Abdurrahman",
              "position": "Vice Chairman",
              "gender": "male",
              "phone": "+2347025599019",
              "bio": "Department: Chemical Engineering â¢ Level: 400"
            },
            {
              "id": "asset-yusuf-bashir-secretary",
              "name": "Yusuf Bashir",
              "position": "Secretary",
              "gender": "male",
              "phone": "+2349063895319",
              "bio": "Department: Surveying and Geoinformatics â¢ Level: 400"
            }
          ]
        },
        {
          "committee": "Shuuroh",
          "members": [
            {
              "id": "shuuroh-hamzat-abdul-awwal-chairman-shuuroh",
              "name": "Hamzat Abdul-Awwal",
              "position": "Chairman Shuuroh",
              "gender": "male"
            },
            {
              "id": "shuuroh-salako-adegoke-m-secretary-shuuroh",
              "name": "Salako Adegoke M.",
              "position": "Secretary Shuuroh",
              "gender": "male"
            }
          ]
        }
      ]
    }
  ]
};
