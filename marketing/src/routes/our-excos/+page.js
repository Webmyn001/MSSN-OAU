// JSDoc types you provided (keep them in this file or import them)
/**
 * Represents an individual executive member.
 * @typedef {object} ExecutiveMember
 * @property {string} id - The unique identifier for the member.
 * @property {string} name - The full name of the member.
 * @property {string} position - The position held by the member.
 * @property {string} photo - URL to the member's photo.
 * @property {string} phone - The member's phone number.
 * @property {string} email - The member's email address.
 */

/**
 * Represents a specific committee within an executive session.
 * @typedef {object} ExecutiveCommittee
 * @property {string} committee - The name of the committee.
 * @property {ExecutiveMember[]} members - An array of members belonging to this committee.
 */

/**
 * Represents the executive data for a single academic session.
 * @typedef {object} SessionData
 * @property {string} session - The academic session identifier.
 * @property {number} start_year - The starting year of the session.
 * @property {number} end_year - The ending year of the session.
 * @property {ExecutiveCommittee[]} executives - An array of executive committees for this session.
 */

/**
 * Represents the main data structure containing all executive sessions.
 * @typedef {object} ExcosData
 * @property {SessionData[]} sessions - An array of academic sessions, each containing executive information.
 */

/**
 * This is the structure expected within the `data` field of the API's response envelope.
 * @typedef {object} ExcosPayload
 * @property {ExcosData} excos - The main data object containing session-wise executive information.
 */

/**
 * Represents the overall envelope of the API response from /api/v1/excos.
 * @template T The type of the data payload.
 * @typedef {object} ApiEnvelope
 * @property {boolean} status - Indicates if the API call was successful on the server side.
 * @property {T} [data] - The data payload if status is true.
 * @property {string} [message] - An error message if status is false or if there's an issue.
 */


// * Use mocked data directly (no server-side fetching)
import { mockExcos } from "$lib/mocks/data.js";

/**
 * Loads the executive data for the page.
 * @returns {Promise<ExcosPayload>} The executive data.
 */
export const load = async () => {
    return mockExcos;
};