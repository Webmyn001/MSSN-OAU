import {json} from "@sveltejs/kit";
import {getPantry} from "$lib/utils/pantry.server.js";
import {redis} from "$lib/utils/redis.server.js";

/**
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const GET = async ({ setHeaders }) => {
    try {
        const cached = await redis.get("blog")
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
        if (!wordpressPosts.ok) {
            throw new Error("WordPress Not Responding")
        }
        const res = await wordpressPosts.json();
        const allPosts = [...(req.enabled ? req.posts : []), ...res.filter(post => post.status === 'publish').map(post => {
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
        })]
        if (allPosts && allPosts.length > 0) {
            const ttl = await redis.ttl("blog")
            setHeaders({
                "cache-control": `max-age=${ttl}`,
            });
            redis.set("blog", JSON.stringify(allPosts), "EX", 300)
        }
        return json({
            status: true,
            data: {
                posts: allPosts
            }
        })
    } catch (e) {
        return json({
            status: false,
            message: e?.message ?? "Something went wrong"
        }, {
            statusCode: 500,
        })
    }
}