export const load = async ({ fetch }) => {
	const blogReq = await fetch('/api/v1/blog');
	const eventsReq = await fetch('/api/v1/events');
	const infoReq = await fetch('/api/v1/info');
	const programmeReq = await fetch('/api/v1/programmes');

	const blogRes = await blogReq.json();
	const eventRes = await eventsReq.json();
	const infoRes = await infoReq.json();
	const programmeRes = await programmeReq.json();

	return {
		posts: (blogRes?.data?.posts ?? []).slice(0, 3),
		events: eventRes.data.events.slice(0, 2),
		programmes: programmeRes.data.programmes.splice(0, 4),
		info: infoRes.data || {
			account: {
				name: 'MSSN OAU',
				bank: 'Access Bank',
				number: '1234567890'
			},
			prayer_times: {
				subhi: {
					adhan: new Date().setHours(5, 0, 0),
					iqamah: new Date().setHours(5, 30, 0)
				},
				dhuhr: {
					adhan: new Date().setHours(13, 0, 0),
					iqamah: new Date().setHours(13, 30, 0)
				},
				asr: {
					adhan: new Date().setHours(16, 0, 0),
					iqamah: new Date().setHours(16, 30, 0)
				},
				maghrib: {
					adhan: new Date().setHours(18, 30, 0),
					iqamah: new Date().setHours(18, 45, 0)
				},
				isha: {
					adhan: new Date().setHours(19, 30, 0),
					iqamah: new Date().setHours(19, 45, 0)
				}
			}
		}
	};
};
