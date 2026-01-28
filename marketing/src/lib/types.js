/**
 * * Shared data types for the marketing site.
 * * This module exists so page/load modules can reference stable types without importing from `src/routes/**/+server.js`.
 */

/**
 * @typedef {Object} AdvisorSocials
 * @property {string} [whatsapp]
 * @property {string} [linkedin]
 */

/**
 * @typedef {Object} Advisor
 * @property {string} id
 * @property {string} name
 * @property {string} [title]
 * @property {'male' | 'female'} [gender]
 * @property {string} [position]
 * @property {string} [department]
 * @property {string} [phone]
 * @property {string} [email]
 * @property {string} [photo]
 * @property {string} [summary]
 * @property {AdvisorSocials} [socials]
 */

/**
 * @typedef {Object} AdvisorSessionData
 * @property {string} id
 * @property {string} label
 * @property {number} start_year
 * @property {number} end_year
 * @property {Advisor[]} advisors
 */

export {};

