import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { Toaster } from "~/components/ui/sonner";
import { NavBar } from "~/components/layout/NavBar";
import { Footer } from "~/components/layout/Footer";
import { ORGANIZATION } from "~/lib/config";
import { loadSiteData } from "~/lib/api/site-data";
import type { SiteData } from "~/lib/api/site-data";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.webp" },
  { rel: "manifest", href: "/app.webmanifest" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "preconnect", href: "https://cdn.jsdelivr.net", crossOrigin: "anonymous" },
  { rel: "preconnect", href: "https://images.unsplash.com", crossOrigin: "anonymous" },
  { rel: "preconnect", href: "https://annuurpress.org.ng", crossOrigin: "anonymous" },
  { rel: "preconnect", href: "https://api.aladhan.com", crossOrigin: "anonymous" },
  { rel: "preload", href: "/mssn-logo.webp", as: "image", fetchPriority: "high" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@600&display=swap",
  },
];

export async function loader(_args: Route.LoaderArgs): Promise<{ site: SiteData }> {
  const site = await loadSiteData(fetch, [
    "info",
    "events",
    "programmes",
    "mosques",
    "latestNews",
    "posts",
    "alumni",
  ]);
  return { site };
}

function OrganizationJsonLd({ origin }: { origin: string }) {
  const org = { ...ORGANIZATION, url: origin || ORGANIZATION.url };
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "NonProfitOrganization",
      "@id": org.url + "#organization",
      name: org.name,
      alternateName: org.shortName,
      url: org.url,
      logo: org.logo,
      image: org.ogImage,
      description: org.description,
      address: {
        "@type": "PostalAddress",
        streetAddress: org.address.street,
        addressLocality: org.address.city,
        addressRegion: org.address.state,
        postalCode: org.address.postalCode,
        addressCountry: org.address.country,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: org.coordinates.latitude,
        longitude: org.coordinates.longitude,
      },
      hasMap: org.map,
      contactPoint: [
        {
          "@type": "ContactPoint",
          email: org.email,
          contactType: "General Enquiry",
          areaServed: "NG",
          availableLanguage: ["en", "yo"],
        },
        {
          "@type": "ContactPoint",
          telephone: "+234-814-685-1394",
          contactType: "Financial Enquiries",
          areaServed: "NG",
          availableLanguage: ["en", "yo"],
        },
      ],
      openingHours:
        "Mo 09:00-17:00 Tu 09:00-17:00 We 09:00-17:00 Th 09:00-17:00 Fr 09:00-17:00 Sa 09:00-17:00 Su Closed",
      sameAs: [org.socialMedia.facebook],
      foundingDate: org.foundingYear,
      founder: {
        "@type": "Organization",
        name: "Muslim Students' Society of Nigeria",
      },
      member: {
        "@type": "OrganizationRole",
        member: {
          "@type": "Person",
          name: "Muslim students at Obafemi Awolowo University",
        },
        roleName: "Member",
      },
      department: [
        { "@type": "Organization", name: "Programmes and Events", url: org.url + "/programmes" },
        { "@type": "Organization", name: "Executive Council", url: org.url + "/our-excos" },
        { "@type": "Organization", name: "Advisory Board", url: org.url + "/our-advisors" },
        { "@type": "Organization", name: "Alumnae Relations", url: org.url + "/alumni" },
      ],
      knowsAbout: [
        "Islam",
        "Student Development",
        "Community Service",
        "Islamic Education",
        "Spiritual Growth",
        "Academic Excellence",
      ],
      mainEntityOfPage: { "@type": "WebPage", "@id": org.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": org.url + "#website",
      name: org.name,
      url: org.url,
      publisher: { "@id": org.url + "#organization" },
      inLanguage: "en-NG",
      about: { "@id": org.url + "#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: org.url + "/search?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: org.url },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#003a1c" />
        <meta name="color-scheme" content="light dark" />
        <meta
          name="description"
          content="Muslim Students Society of Nigeria, Obafemi Awolowo University Branch"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <div style={{ display: "contents" }} className="content-placeholder">
          {children}
        </div>
        <ScrollRestoration />
        <Scripts />
        <Toaster richColors />
      </body>
    </html>
  );
}

export default function App() {
  const { site } = useLoaderData<typeof loader>();
  const origin = ORGANIZATION.url;

  const maintenance = site?.info?.maintenance && site?.info?.maintenance_ends;

  if (maintenance) {
    return <Maintenance time={site.info.maintenance_ends} />;
  }

  return (
    <>
      <OrganizationJsonLd origin={origin} />
      <NavBar />
      <div id="modal-portal" />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function Maintenance({ time }: { time: string | null }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-primary-50 px-4">
      <div className="max-w-md rounded-xl border border-primary-100 bg-white/90 p-8 text-center shadow-md">
        <h1 className="font-secondary text-2xl font-bold text-primary-800">
          We&apos;ll be back soon
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          The site is undergoing scheduled maintenance.
        </p>
        {time ? (
          <p className="mt-2 text-xs text-gray-500">Expected back: {time}</p>
        ) : null}
      </div>
    </main>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-2xl font-bold">{message}</h1>
      <p className="mt-2 text-muted-foreground">{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
