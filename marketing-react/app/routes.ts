import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("al-mamharah", "routes/al-mamharah.tsx"),
  route("al-mamharah/dashboard", "routes/al-mamharah.dashboard.tsx"),
  route("al-mamharah/manager", "routes/al-mamharah.manager.tsx"),
  route("al-mamharah/manager/activate", "routes/al-mamharah.manager.activate.tsx"),
] satisfies RouteConfig;
