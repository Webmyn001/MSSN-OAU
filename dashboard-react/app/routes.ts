import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
	route("login", "routes/login.tsx"),
	route("otp", "routes/otp.tsx"),
	layout("routes/dashboard-layout.tsx", [
		index("routes/home.tsx"),
		route("excos", "routes/excos.tsx"),
		route("prayer-times", "routes/prayer-times.tsx"),
		route("events", "routes/events.tsx"),
		route("alumni", "routes/alumni.tsx"),
		route("advisors", "routes/advisors.tsx"),
		route("programmes", "routes/programmes.tsx"),
		route("contacts", "routes/contacts.tsx"),
		route("latest-news", "routes/latest-news.tsx"),
		route("blog", "routes/blog.tsx"),
		route("newsletter", "routes/newsletter.tsx"),
		route("mosques", "routes/mosques.tsx"),
		route("annual-dues", "routes/annual-dues.tsx"),
		route("admins", "routes/admins.tsx"),
		route("press-releases", "routes/press-releases.tsx"),
	]),
] satisfies RouteConfig;
