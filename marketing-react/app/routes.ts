import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("contact", "routes/contact.tsx"),
  route("programmes", "routes/programmes.tsx"),
  route("events", "routes/events.tsx"),
  route("events/how-to-register-paid-events-online", "routes/events.how-to-register-paid-events-online.tsx"),
  route("events/:slug", "routes/events.$slug.tsx"),
  route("alumni", "routes/alumni.tsx"),
  route("our-advisors", "routes/our-advisors.tsx"),
  route("our-excos", "routes/our-excos.tsx"),
  route("latest-news", "routes/latest-news.tsx"),
  route("latest-news/:id", "routes/latest-news.$id.tsx"),
  route("blog", "routes/blog.tsx"),
  route("blog/:slug", "routes/blog.$slug.tsx"),
  route("al-mamharah", "routes/al-mamharah.tsx"),
  route("al-mamharah/dashboard", "routes/al-mamharah.dashboard.tsx"),
  route("al-mamharah/manager", "routes/al-mamharah.manager.tsx"),
  route("al-mamharah/manager/activate", "routes/al-mamharah.manager.activate.tsx"),
] satisfies RouteConfig;
