/**
 * @typedef {Object} Event
 * @property {string} title
 * @property {string} image
 * @property {string} summary
 * @property {boolean} paid
 * @property {string} price
 * @property {string} date
 * @property {string} venue
 * @property {string} url
 * @property {'weekly' | 'monthly'} [periodical]
 * @property {number} [day]
 */

/**
 * @typedef {Event[]} Events
 */

/**
 * @typedef {Object} Post
 * @property {number} id - The unique identifier for the post.
 * @property {string} date - The date the post was created.
 * @property {string} date_gmt - The GMT date the post was created.
 * @property {Object} guid - The globally unique identifier (GUID) for the post.
 * @property {string} modified - The date the post was last modified.
 * @property {string} modified_gmt - The GMT date the post was last modified.
 * @property {string} slug - The URL slug for the post.
 * @property {string} status - The current status of the post (e.g., 'publish').
 * @property {string} type - The type of content (e.g., 'post').
 * @property {string} link - The URL link to the post.
 * @property {Object} title - The title of the post.
 * @property {Object} content - The content of the post.
 * @property {Object} excerpt - The excerpt/summary of the post.
 * @property {boolean} excerpt.protected - If the excerpt is protected or not.
 * @property {number} author - The ID of the post author.
 * @property {number} featured_media - The ID of the featured media image.
 * @property {string} comment_status - The comment status (e.g., 'open').
 * @property {string} ping_status - The ping status (e.g., 'open').
 * @property {boolean} sticky - If the post is sticky (pinned).
 * @property {string} template - The template used for the post.
 * @property {string} format - The format of the post (e.g., 'standard').
 * @property {Object} meta - Additional meta information about the post.
 * @property {Object} _links - Links to related resources.
 * @property {Object} _embedded - Embedded resources related to the post.
 * @property {Object[]} _embedded.author - Information about the post author.
 * @property {number} _embedded.author.id - The author's ID.
 * @property {string} _embedded.author.name - The author's name.
 * @property {string} _embedded.author.url - The URL to the author's website.
 * @property {string} _embedded.author.link - The link to the author's profile.
 * @property {Object} _embedded.author.avatar_urls - The URLs to the author's avatar images.
 * @property {string} _embedded.author.avatar_urls[24] - The 24px avatar image URL.
 * @property {string} _embedded.author.avatar_urls[48] - The 48px avatar image URL.
 * @property {string} _embedded.author.avatar_urls[96] - The 96px avatar image URL.
 * @property {Object[]} _embedded.wp:featuredmedia - The featured media related to the post.
 * @property {number} _embedded.wp:featuredmedia.id - The media ID.
 * @property {string} _embedded.wp:featuredmedia.link - The URL link to the media.
 * @property {string} _embedded.wp:featuredmedia.source_url - The source URL of the media.
 * @property {Object[]} _embedded.wp:term - The taxonomy terms (e.g., categories).
 * @property {Object} _embedded.wp:term[0] - The first taxonomy term.
 * @property {number} _embedded.wp:term[0].id - The term ID.
 * @property {string} _embedded.wp:term[0].link - The URL link to the term.
 * @property {string} _embedded.wp:term[0].name - The name of the term.
 * @property {string} _embedded.wp:term[0].slug - The slug of the term.
 * @property {string} _embedded.wp:term[0].taxonomy - The taxonomy type of the term (e.g., 'category').
 */


/**
 * @typedef {Object} MiniEvent
 * @property {string} title
 * @property {string} text
 * @property {string} icon
 * @property {string} image
 */


/**
 * @export {MiniEvent}
 */


/**
 * @typedef {Object} PostRes
 * @property {string} link - The link to the post.
 * @property {string} featured_image - URL of the featured image for the post.
 * @property {string} title - The title of the post.
 * @property {string} excerpt - A brief excerpt from the post.
 * @property {string} date - The date the post was published, or GMT date.
 * @property {Array.<Author>} authors - List of authors for the post.
 */

/**
 * @typedef {Object} Author
 * @property {Object} avatar_urls - URLs for the author's avatar.
 * @property {string} name - The name of the author.
 */
