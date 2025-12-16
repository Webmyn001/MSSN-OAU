// * Use mocked data directly (no server-side fetching)
import { mockBlog, mockEvents, mockInfo, mockProgrammes } from "$lib/mocks/data.js";

// * Always provide fallback prayer times
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

export const load = async () => {
	return {
		posts: mockBlog.posts.slice(0, 3),
		events: mockEvents.events.slice(0, 3),
		programmes: mockProgrammes.programmes.slice(0, 4),
		info: {
			...mockInfo,
			// * Ensure prayer_times always exists with fallback
			prayer_times: mockInfo.prayer_times || getDefaultPrayerTimes()
		}
	};
};
