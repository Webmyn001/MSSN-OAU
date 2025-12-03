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

        const req = await getPantry("blog")
        const wordpressPosts = await fetch("https://annuurpress.org.ng/wp-json/wp/v2/posts?_embed");
        let res = [];
        if (wordpressPosts.ok) {
            res = await wordpressPosts.json();
        }
        const combinedLocal = (req?.enabled ? req.posts : []);
        const wpMapped = Array.isArray(res) ? res.filter(post => post.status === 'publish').map(post => {
            return {
                link: post.link,
                featured_image: post._embedded['wp:featuredmedia']['0'].source_url,
                title: post.title.rendered,
                excerpt: post.excerpt.rendered,
                date: post.date ?? post.date_gmt,
                authors: post._embedded.author.map(author => {
                    return {
                        avatar_urls: author.avatar_urls,
                        name: author.name
                    }
                })
            }
        }) : [];
        const allPosts = [...combinedLocal, ...wpMapped];
        const finalPosts = allPosts.length > 0 ? allPosts : exampleBlog.posts;
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
        return json({
            status: true,
            data: { posts: exampleBlog.posts }
        }, { status: 200 })
    }
}