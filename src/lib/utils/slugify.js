/**
 * Converts a string into a URL-friendly slug.
 * @param {string} text - The input string to be slugified.
 * @returns {string} - The slugified string.
 */
function slugify(text) {
    return text
        .toString() // Ensure it's a string
        .trim() // Remove leading and trailing spaces
        .toLowerCase() // Convert to lowercase
        .replace(/[\s\-_]+/g, '-') // Replace spaces, underscores, and multiple hyphens with a single hyphen
        .replace(/[^\w\-]+/g, '') // Remove all non-word characters except hyphens
        .replace(/^-+|-+$/g, ''); // Remove hyphens from the start and end
}

export default slugify