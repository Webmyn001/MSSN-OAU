const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** @param {string | number | Date} dateString */
const formatDate = (dateString) => {
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

    // For convenience, create a full date string too, though it might not be directly used by the card anymore
    const fullDateString = `${weekday} ${dayOfMonth}${daySuffix} ${monthName}, ${year}`;

    return {
        weekday: weekday,
        day: dayOfMonth, // actual day number
        daySuffix: daySuffix,
        month: monthName, // month name e.g., "Jan"
        year: year,
        time: formattedTime,
        fullDate: fullDateString // e.g., "Sat 1st Jan, 2024"
    };
};

/** @param {string | number | Date} dateString */
const isPastDate = (dateString) => {
    const inputDate = new Date(dateString);
    const currentDate = new Date();

    // Compare the input date with the current date
    return inputDate < currentDate;
};

export { formatDate, isPastDate, months, days };