export const load = async ({ fetch }) => {
	const blogReq = await fetch('/api/v1/blog');
	const eventsReq = await fetch('/api/v1/events');
	const infoReq = await fetch('/api/v1/info');
	const programmeReq = await fetch('/api/v1/programmes');

	const safeJson = async (res) => {
		try {
			return await res.json();
		} catch (_) {
			return null;
		}
	};

	const blogRes = await safeJson(blogReq);
	const eventRes = await safeJson(eventsReq);
	const infoRes = await safeJson(infoReq);
	const programmeRes = await safeJson(programmeReq);

	// * Always provide fallback prayer times when API fails
	// * Uses timestamps (milliseconds) to match the store format
	const getDefaultPrayerTimes = () => {
		const today = new Date();
		return {
			subhi: {
				adhan: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 5, 0, 0).getTime(),
				iqamah: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 5, 30, 0).getTime()
			},
			dhuhr: {
				adhan: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0, 0).getTime(),
				iqamah: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 30, 0).getTime()
			},
			asr: {
				adhan: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0, 0).getTime(),
				iqamah: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 30, 0).getTime()
			},
			maghrib: {
				adhan: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 30, 0).getTime(),
				iqamah: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 45, 0).getTime()
			},
			isha: {
				adhan: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 30, 0).getTime(),
				iqamah: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 45, 0).getTime()
			},
			jumuah: {
				adhan: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 30, 0).getTime(),
				iqamah: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0, 0).getTime()
			}
		};
	};

	return {
		posts: Array.isArray(blogRes?.data?.posts) ? blogRes.data.posts.slice(0, 3) : [],
		events: Array.isArray(eventRes?.data?.events) ? eventRes.data.events.slice(0, 3) : [],
		programmes: Array.isArray(programmeRes?.data?.programmes) ? programmeRes.data.programmes.slice(0, 4) : [],
		info: (infoRes?.data?.info && Object.keys(infoRes.data.info).length > 0) ? {
			...infoRes.data.info,
			// * Ensure prayer_times always exists, merge with fallback if needed
			prayer_times: infoRes.data.info.prayer_times || getDefaultPrayerTimes()
		} : {
			account: {
				name: 'MSSN OAU',
				bank: 'Access Bank',
				number: '1234567890'
			},
			prayer_times: getDefaultPrayerTimes()
		}
	};
};
