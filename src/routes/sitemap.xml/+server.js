// Define constants for the sitemap
const SITE_URL = "https://mssnoau.org";

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function GET({ fetch }) {
  // Fetch blog posts
  const blogRes = await fetch('/api/v1/blog');
  const blogData = await blogRes.json();
  const posts = blogData?.data?.posts || [];
  
  // Fetch events
  const eventsRes = await fetch('/api/v1/events');
  const eventsData = await eventsRes.json();
  const events = eventsData?.data?.events || [];

  // Base URLs that are always present
  const staticPages = [
    { url: '/', changefreq: 'weekly', priority: 1.0 },
    { url: '/about', changefreq: 'monthly', priority: 0.8 },
    { url: '/our-excos', changefreq: 'monthly', priority: 0.7 },
    { url: '/our-advisors', changefreq: 'monthly', priority: 0.7 },
    { url: '/events', changefreq: 'weekly', priority: 0.8 },
    { url: '/blog', changefreq: 'weekly', priority: 0.8 },
    { url: '/contact', changefreq: 'monthly', priority: 0.6 },
    { url: '/alumnae', changefreq: 'monthly', priority: 0.6 },
    { url: '/annual-dues', changefreq: 'monthly', priority: 0.5 },
  ];

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
    ${staticPages.map(page => `
    <url>
        <loc>${SITE_URL}${page.url}</loc>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`).join('')}
    
    ${posts.map(post => `
    <url>
        <loc>${SITE_URL}/blog/${post.slug || post.id}</loc>
        <lastmod>${new Date(post.published_at || post.created_at || Date.now()).toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>`).join('')}
    
    ${events.map(event => `
    <url>
        <loc>${SITE_URL}/events/${event.slug || event.id}</loc>
        <lastmod>${new Date(event.updated_at || event.created_at || Date.now()).toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>`).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, s-maxage=3600'
    }
  });
} 