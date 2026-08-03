/**
 * @typedef {Object} Alumnus
 * @property {string} id
 * @property {string} name
 * @property {string} position - e.g. "Ameer", "Ameerah", "Vice President"
 * @property {'male' | 'female'} gender
 * @property {string} session - e.g. "2023/2024"
 * @property {string} [department]
 * @property {string} [phone]
 * @property {string} [email]
 * @property {string} [photo]
 * @property {string} [currentRole] - What they do now
 * @property {string} [company] - Where they work now
 */

/**
 * @typedef {Object} AlumniSession
 * @property {string} session
 * @property {number} start_year
 * @property {number} end_year
 * @property {Alumnus[]} members
 */

/**
 * @typedef {Object} AlumniData
 * @property {AlumniSession[]} sessions
 */

/** @type {AlumniData} */
export const alumni = {
	sessions: []
};
