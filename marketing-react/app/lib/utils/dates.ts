const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface FormattedDate {
	weekday: string;
	day: number;
	daySuffix: string;
	month: string;
	year: number;
	time: string;
	fullDate: string;
}

const formatDate = (dateString: string | number | Date): FormattedDate => {
	const date = new Date(dateString);

	const dayOfMonth = date.getDate();
	const daySuffix =
		dayOfMonth === 1 || dayOfMonth === 21 || dayOfMonth === 31
			? "st"
			: dayOfMonth === 2 || dayOfMonth === 22
				? "nd"
				: dayOfMonth === 3 || dayOfMonth === 23
					? "rd"
					: "th";

	const weekday = days[date.getDay()];
	const monthName = months[date.getMonth()];
	const year = date.getFullYear();

	const formattedTime = date.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	});

	const fullDateString = `${weekday} ${dayOfMonth}${daySuffix} ${monthName}, ${year}`;

	return {
		weekday,
		day: dayOfMonth,
		daySuffix,
		month: monthName,
		year,
		time: formattedTime,
		fullDate: fullDateString,
	};
};

const isPastDate = (dateString: string | number | Date): boolean => {
	const inputDate = new Date(dateString);
	const currentDate = new Date();
	return inputDate < currentDate;
};

export { formatDate, isPastDate, months, days };
