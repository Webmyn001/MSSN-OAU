import { SITE_URL } from '$lib/config';
import { mockBlog, mockEvents } from '$lib/mocks/data.js';

/**
 * * Returns sitemap using mocked data (no server-side fetching)
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function GET() {
  // * Use mocked data directly
  const posts = mockBlog.posts || [];
  const events = mockEvents.events || [];

  // Base URLs that are always present
  const staticPages = [
    { url: '/', changefreq: 'weekly', priority: 1.0 },
    { url: '/about', changefreq: 'monthly', priority: 0.8 },
    { url: '/our-excos', changefreq: 'monthly', priority: 0.7 },
    { url: '/our-advisors', changefreq: 'monthly', priority: 0.7 },
    { url: '/events', changefreq: 'weekly', priority: 0.8 },
    { url: '/events/how-to-register-paid-events-online', changefreq: 'monthly', priority: 0.6 },
    { url: '/blog', changefreq: 'weekly', priority: 0.8 },
    { url: '/contact', changefreq: 'monthly', priority: 0.6 },
    { url: '/alumni', changefreq: 'monthly', priority: 0.6 },
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