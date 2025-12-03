export function getFormattedDateVerbose() {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString('default', {month: 'long'});
    const year = now.getFullYear();
    
    const suffix =
        day % 10 === 1 && day !== 11 ? 'st' :
        day % 10 === 2 && day !== 12 ? 'nd' :
        day % 10 === 3 && day !== 13 ? 'rd' :
        'th';
        
    return `${day}${suffix} ${month}, ${year}`;
}

export function getFormattedDateVerboseShort() {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString('default', {month: 'short'});
    const year = now.getFullYear();
    
    return `${day} ${month}, ${year}`;
} 