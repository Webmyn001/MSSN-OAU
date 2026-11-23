import {
	SITE_NAME,
	SITE_URL,
	DEFAULT_DESCRIPTION,
	DEFAULT_KEYWORDS,
	DEFAULT_OG_IMAGE,
	TWITTER_HANDLE,
} from "~/lib/config";

export interface OgImage {
	url: string;
	width?: number;
	height?: number;
	alt?: string;
}

export interface SeoProps {
	title?: string;
	description?: string;
	path?: string;
	type?: string;
	images?: OgImage[];
	schema?: Record<string, any> | Record<string, any>[];
	keywords?: string[] | string;
}

/**
 * Helper to convert comma-separated string to string array, or use existing array.
 */
function formatKeywords(kw: string[] | string | undefined): string[] {
	if (Array.isArray(kw)) return kw;
	if (typeof kw === "string")
		return kw
			.split(",")
			.map((k) => k.trim())
			.filter((k) => k);
	return [];
}

/**
 * Social platforms handle a consistent 1200x630 image most reliably.
 * Cloudinary-hosted article images are served through a matching crop.
 */
function socialImageUrl(url: string): string {
	const match = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/);
	if (!match) return url;
	const rest = match[2];
	if (/(^|\/)c_[a-z_]+\d*/.test(rest)) return url;
	return `${match[1]}c_fill,w_1200,h_630,g_auto/${rest}`;
}

/**
 * SEO Component for consistent metadata across the site.
 *
 * React 19 hoists `<title>`, `<meta>` and `<link>` rendered anywhere in the tree
 * into `<head>` (during SSR too), which replaces `svelte-meta-tags` MetaTags.
 */
export function Seo({
	title = "",
	description = DEFAULT_DESCRIPTION,
	path = "",
	type = "website",
	images,
	schema,
	keywords = DEFAULT_KEYWORDS,
}: SeoProps) {
	// Canonical + OG URLs are resolved against the live site origin so they always
	// point at the deployed domain (same as the Svelte app's request origin).
	const origin = SITE_URL;
	const url = path ? `${origin}${path.startsWith("/") ? path : `/${path}`}` : origin;

	// An empty array (e.g. a post without an image) must still fall back to the
	// site image so social previews always have something to show.
	const baseImages: OgImage[] = images?.length
		? images
		: [{ url: DEFAULT_OG_IMAGE, width: 1920, height: 357, alt: SITE_NAME }];

	const finalImages = baseImages.map((img) => ({
		...img,
		url: img.url?.startsWith("/") ? `${origin}${img.url}` : socialImageUrl(img.url),
	}));

	const finalKeywords = formatKeywords(keywords);
	const formattedTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

	return (
		<>
			<title>{formattedTitle}</title>
			<meta name="description" content={description} />
			{finalKeywords.length > 0 && (
				<meta name="keywords" content={finalKeywords.join(", ")} />
			)}
			<link rel="canonical" href={url} />

			<meta property="og:url" content={url} />
			<meta property="og:title" content={formattedTitle} />
			<meta property="og:description" content={description} />
			<meta property="og:site_name" content={SITE_NAME} />
			<meta property="og:type" content={type} />
			{finalImages.map((img, i) => (
				<meta key={`og-image-${i}`} property="og:image" content={img.url} />
			))}
			{finalImages.map((img, i) =>
				img.width ? (
					<meta
						key={`og-image-w-${i}`}
						property="og:image:width"
						content={String(img.width)}
					/>
				) : null,
			)}
			{finalImages.map((img, i) =>
				img.height ? (
					<meta
						key={`og-image-h-${i}`}
						property="og:image:height"
						content={String(img.height)}
					/>
				) : null,
			)}
			{finalImages.map((img, i) =>
				img.alt ? (
					<meta key={`og-image-a-${i}`} property="og:image:alt" content={img.alt} />
				) : null,
			)}

			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:site" content={TWITTER_HANDLE} />
			<meta name="twitter:creator" content={TWITTER_HANDLE} />
			<meta name="twitter:title" content={formattedTitle} />
			<meta name="twitter:description" content={description} />
			{finalImages[0] ? (
				<>
					<meta name="twitter:image" content={finalImages[0].url} />
					{finalImages[0].alt ? (
						<meta name="twitter:image:alt" content={finalImages[0].alt} />
					) : null}
				</>
			) : null}

			{schema ? (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
				/>
			) : null}
		</>
	);
}
