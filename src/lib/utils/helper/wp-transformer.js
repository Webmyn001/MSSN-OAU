// src/lib/types.js (or .ts if using TypeScript)

/**
 * @typedef {object} ReadingStats
 * @property {number} minutes - Estimated reading time in minutes.
 * @property {number} words - Total word count.
 * @property {string} text - Formatted reading time text (e.g., "4 min read").
 */

/**
 * @typedef {object} Author
 * @property {number} id - The author's unique ID.
 * @property {string} name - The author's display name.
 * @property {string} slug - The author's URL slug.
 * @property {string} description - The author's biographical information.
 * @property {{small: string, medium: string, large: string}} avatarUrls - URLs for different sizes of the author's avatar.
 * @property {string} profileUrl - URL to the author's profile page.
 */

/**
 * @typedef {object} ImageSize
 * @property {string} url - URL of the image for this size.
 * @property {number} width - Width of the image.
 * @property {number} height - Height of the image.
 * @property {string} [mimeType] - Mime type of the image.
 */

/**
 * @typedef {object} FeaturedImage
 * @property {number} id - The media ID of the featured image.
 * @property {string} altText - Alternative text for the image.
 * @property {string} caption - Caption for the image.
 * @property {string} sourceUrl - URL to the original/full-size image.
 * @property {number} width - Original width of the image.
 * @property {number} height - Original height of the image.
 * @property {Object<string, ImageSize>} sizes - Object containing different registered image sizes (e.g., thumbnail, medium, large).
 */

/**
 * @typedef {object} Term
 * @property {number} id - The term's unique ID.
 * @property {string} name - The term's display name.
 * @property {string} slug - The term's URL slug.
 * @property {string} link - URL to the term's archive page.
 * @property {string} taxonomy - The taxonomy of the term (e.g., 'category', 'post_tag').
 */

/**
 * @typedef {object} CommentItem
 * @property {number} id - The comment's ID.
 * @property {string} authorName - The name of the comment author.
 * @property {string} date - ISO 8601 date string of when the comment was posted.
 * @property {string} dateFormatted - Human-readable formatted date.
 * @property {string} contentHtml - The HTML content of the comment.
 * @property {string} avatarUrl - URL to the commenter's avatar.
 * @property {number} parentId - ID of the parent comment if it's a reply.
 */

/**
 * @typedef {object} CommentsData
 * @property {string} status - Comment status ("open" or "closed").
 * @property {number} count - Total number of comments (might be from embedded replies or a separate count).
 * @property {boolean} allowComments - Whether comments are allowed.
 * @property {string} repliesLink - API link to fetch/post comments.
 * @property {CommentItem[]} items - Array of comment items, possibly pre-loaded.
 */

/**
 * @typedef {object} SeoData
 * @property {string} metaDescription - Meta description for SEO.
 * @property {string} ogTitle - Open Graph title.
 * @property {string} ogDescription - Open Graph description.
 * @property {string} ogImage - Open Graph image URL.
 */

/**
 * @typedef {object} RelatedPostSummary
 * @property {number} id - The related post's ID.
 * @property {string} title - The related post's title.
 * @property {string} slug - The related post's slug.
 * @property {string} permalink - The related post's permalink.
 * @property {string} publishedDate - ISO 8601 date string.
 * @property {string} publishedDateFormatted - Human-readable formatted date.
 * @property {string | null} featuredImageThumbnailUrl - URL to the thumbnail of the featured image, or null.
 */

/**
 * @typedef {object} IdealPostType
 * @property {number} id - Unique identifier for the post.
 * @property {string} slug - URL-friendly slug for the post.
 * @property {string} permalink - The full URL to the post.
 * @property {string} title - The title of the post (HTML entities decoded).
 * @property {string} contentHtml - The full HTML content of the post.
 * @property {string} excerptHtml - The HTML excerpt of the post.
 * @property {string} publishedDate - ISO 8601 date string of when the post was published.
 * @property {string} publishedDateFormatted - Human-readable formatted publication date.
 * @property {string} modifiedDate - ISO 8601 date string of when the post was last modified.
 * @property {string} modifiedDateFormatted - Human-readable formatted modification date.
 * @property {ReadingStats} readingStats - Estimated reading time and word count.
 * @property {Author | null} author - Information about the post author.
 * @property {FeaturedImage | null} featuredImage - Information about the post's featured image.
 * @property {Term[]} categories - Array of categories assigned to the post.
 * @property {Term[]} tags - Array of tags assigned to the post.
 * @property {CommentsData} comments - Information about comments for the post.
 * @property {SeoData} seo - SEO-related metadata.
 * @property {RelatedPostSummary[]} relatedPosts - Array of summarized related posts.
 * @property {string} postFormat - The format of the post (e.g., 'standard', 'video').
 * @property {boolean} isSticky - Whether the post is sticky.
 */

// src/lib/wpTransformer.js (or .ts)
import { readingTime } from 'reading-time-estimator';
import he from 'he'; // For HTML entity decoding

const WP_READING_TIME_WORDS_PER_MINUTE = 200; // Common default for reading time

/**
 * Helper to format dates (example, you might use a library like date-fns or moment)
 * @param {string} dateString
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDate(dateString, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
  if (!dateString) return "";
  try {
    return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
  } catch (e) {
    return dateString; // fallback
  }
};

/**
 * Transforms a raw WordPress API post object (with _embedded data)
 * into a more structured and frontend-friendly format.
 *
 * @param {object} wpPost The raw post object from the WordPress REST API.
 * @returns {import('./types').IdealPostType | null} The transformed post object, or null if input is invalid.
 */
export function transformWpPost(wpPost) {
  if (!wpPost || typeof wpPost !== 'object' || !wpPost.id) {
    console.error("Invalid WordPress post object provided for full transformation:", wpPost);
    return null;
  }

  const getEmbedded = (path) => {
    let current = wpPost._embedded;
    for (const key of path) {
      if (!current || !current[key]) return null;
      current = current[key];
    }
    return current;
  };

  const contentRendered = wpPost.content?.rendered || "";
  const readingStatsResult = readingTime(contentRendered, WP_READING_TIME_WORDS_PER_MINUTE);

  const authorData = getEmbedded(['author', 0]);
  let author = null;
  if (authorData) {
    author = {
      id: authorData.id,
      name: he.decode(authorData.name || ""),
      slug: authorData.slug || "",
      description: he.decode(authorData.description || ""),
      avatarUrls: {
        small: authorData.avatar_urls?.['24'] || "",
        medium: authorData.avatar_urls?.['48'] || "",
        large: authorData.avatar_urls?.['96'] || "",
      },
      profileUrl: authorData.link || "",
    };
  }

  const featuredMediaData = getEmbedded(['wp:featuredmedia', 0]);
  let featuredImage = null;
  if (featuredMediaData) {
    const sizes = {};
    if (featuredMediaData.media_details?.sizes) {
      for (const sizeKey in featuredMediaData.media_details.sizes) {
        const sizeInfo = featuredMediaData.media_details.sizes[sizeKey];
        sizes[sizeKey.toLowerCase().replace(/-/g, '_')] = {
          url: sizeInfo.source_url,
          width: sizeInfo.width,
          height: sizeInfo.height,
          mimeType: sizeInfo.mime_type
        };
      }
    }
    featuredImage = {
      id: featuredMediaData.id,
      altText: he.decode(featuredMediaData.alt_text || featuredMediaData.title?.rendered || ""),
      caption: he.decode(featuredMediaData.caption?.rendered || ""),
      sourceUrl: featuredMediaData.source_url || "",
      width: featuredMediaData.media_details?.width || 0,
      height: featuredMediaData.media_details?.height || 0,
      sizes: sizes,
    };
  }

  const termsData = getEmbedded(['wp:term']);
  let categories = [];
  let tags = [];
  if (termsData && Array.isArray(termsData)) {
    termsData.forEach(termGroup => {
      if (Array.isArray(termGroup)) {
        termGroup.forEach(term => {
          const termObj = {
            id: term.id,
            name: he.decode(term.name || ""),
            slug: term.slug || "",
            link: term.link || "",
            taxonomy: term.taxonomy || ""
          };
          if (term.taxonomy === 'category') {
            categories.push(termObj);
          } else if (term.taxonomy === 'post_tag') {
            tags.push(termObj);
          }
        });
      }
    });
  }

  const embeddedReplies = getEmbedded(['replies', 0]);
  let commentItems = [];
  if (embeddedReplies && Array.isArray(embeddedReplies)) {
      commentItems = embeddedReplies.map(reply => ({
          id: reply.id,
          authorName: he.decode(reply.author_name || ""),
          date: reply.date,
          dateFormatted: formatDate(reply.date, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }),
          contentHtml: reply.content?.rendered || "",
          avatarUrl: reply.author_avatar_urls?.['48'] || "",
          parentId: reply.parent || 0,
      }));
  }
  const comments = {
    status: wpPost.comment_status || "closed",
    count: commentItems.length > 0 ? commentItems.length : (wpPost.comment_count || 0),
    allowComments: (wpPost.comment_status === "open"),
    repliesLink: wpPost._links?.replies?.[0]?.href || "",
    items: commentItems
  };

  const excerptText = he.decode(wpPost.excerpt?.rendered?.replace(/<[^>]+>/g, '').trim() || "");
  const seo = {
    metaDescription: excerptText,
    ogTitle: he.decode(wpPost.title?.rendered || ""),
    ogDescription: excerptText,
    ogImage: featuredImage?.sizes?.large?.url || featuredImage?.sourceUrl || "",
  };

  return {
    id: wpPost.id,
    slug: wpPost.slug || "",
    permalink: wpPost.link || "",
    title: he.decode(wpPost.title?.rendered || ""),
    contentHtml: contentRendered,
    excerptHtml: wpPost.excerpt?.rendered || "",
    publishedDate: wpPost.date || "",
    publishedDateFormatted: formatDate(wpPost.date),
    modifiedDate: wpPost.modified || "",
    modifiedDateFormatted: formatDate(wpPost.modified, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
    readingStats: {
        minutes: readingStatsResult.minutes,
        words: readingStatsResult.words,
        text: readingStatsResult.text,
    },
    author: author,
    featuredImage: featuredImage,
    categories: categories,
    tags: tags,
    comments: comments,
    seo: seo,
    relatedPosts: [], // To be populated by the load function
    postFormat: wpPost.format || "standard",
    isSticky: wpPost.sticky || false,
  };
}


/**
 * Transforms a raw WordPress API post object (with _embedded data)
 * into a summarized format suitable for related post listings.
 *
 * @param {object} wpPost The raw post object from the WordPress REST API.
 * @returns {import('./types').RelatedPostSummary | null} The transformed related post summary, or null.
 */
function transformWpRelatedPost(wpPost) {
    if (!wpPost || typeof wpPost !== 'object' || !wpPost.id) {
        console.warn("Invalid WordPress post object provided for related post transformation:", wpPost);
        return null;
    }

    const featuredMediaData = wpPost._embedded?.['wp:featuredmedia']?.[0];
    let featuredImageThumbnailUrl = null;
    if (featuredMediaData) {
        featuredImageThumbnailUrl = featuredMediaData.media_details?.sizes?.thumbnail?.source_url ||
                                    featuredMediaData.media_details?.sizes?.medium?.source_url || // Fallback
                                    featuredMediaData.source_url; // Ultimate fallback
    }

    return {
        id: wpPost.id,
        title: he.decode(wpPost.title?.rendered || ""),
        slug: wpPost.slug || "",
        permalink: wpPost.link || "",
        publishedDate: wpPost.date || "",
        publishedDateFormatted: formatDate(wpPost.date),
        featuredImageThumbnailUrl: featuredImageThumbnailUrl,
    };
}