import { json } from "@sveltejs/kit";
import { getPantry } from "$lib/utils/pantry.server.js";
import { redis } from "$lib/utils/redis.server.js";
import { exampleBlog } from "$lib/examples/blog.js";

/**
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const GET = async ({ setHeaders }) => {
    try {
        let cached = null;
        try { cached = await redis.get("blog"); } catch { }
        if (cached) {

            return json({
                status: true,
                data: {
                    posts: JSON.parse(cached)
                }
            })
        }

        // * Try to fetch from Pantry, but don't fail if it's unavailable
        let req = null;
        try {
            req = await getPantry("blog");
        } catch (error) {
            console.error("Error fetching blog from Pantry:", error);
        }

        // * Try to fetch from WordPress, but don't fail if it's unavailable
        let res = [];
        try {
            const wordpressPosts = await fetch("https://annuurpress.org.ng/wp-json/wp/v2/posts?_embed");
            if (wordpressPosts.ok) {
                res = await wordpressPosts.json();
            }
        } catch (error) {
            console.error("Error fetching blog from WordPress:", error);
        }

        const combinedLocal = (req?.enabled ? req.posts : []);
        const wpMapped = Array.isArray(res) ? res.filter(post => post.status === 'publish').map(post => {
            try {
                return {
                    link: post.link,
                    featured_image: post._embedded?.['wp:featuredmedia']?.['0']?.source_url || "",
                    title: post.title.rendered,
                    excerpt: post.excerpt.rendered,
                    date: post.date ?? post.date_gmt,
                    authors: post._embedded?.author?.map(author => {
                        return {
                            avatar_urls: author.avatar_urls,
                            name: author.name
                        }
                    }) || []
                }
            } catch {
                return null;
            }
        }).filter(Boolean) : [];
        const allPosts = [...combinedLocal, ...wpMapped];
        
        // * Return empty array if no data available (no fallback to example data)
        const finalPosts = allPosts.length > 0 ? allPosts : [];
        
        if (finalPosts && finalPosts.length > 0) {
            let ttl = 60;
            try { ttl = await redis.ttl("blog") } catch { }
            setHeaders({
                "cache-control": `max-age=${ttl}`,
            });
            try { await redis.set("blog", JSON.stringify(finalPosts), "EX", 300) } catch { }
        }
        return json({
            status: true,
            data: {
                posts: finalPosts
            }
        })
    } catch (e) {
        console.error("Error in blog API endpoint:", e);
        // * Return empty array instead of example data when all APIs fail
        return json({
            status: true,
            data: { posts: [] }
        }, { status: 200 })
    }
}