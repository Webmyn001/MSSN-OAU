const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatDate = (dateString) => {
    const date = new Date(dateString);


    const day = date.getDate();
    const daySuffix =
        day === 1 || day === 21 || day === 31
            ? "st"
            : day === 2 || day === 22
                ? "nd"
                : day === 3 || day === 23
                    ? "rd"
                    : "th";

    const formattedDate = `${days[date.getDay()]} ${day}${daySuffix} ${months[date.getMonth()]}, ${date.getFullYear()}`;
    const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });

    return { date: formattedDate, time: formattedTime };
};

const isPastDate = (dateString) => {
    const inputDate = new Date(dateString);
    const currentDate = new Date();

    // Compare the input date with the current date
    return inputDate < currentDate;
};

export { formatDate, isPastDate, months, days };