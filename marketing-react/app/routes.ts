import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("al-mamharah", "routes/al-mamharah.tsx"),
] satisfies RouteConfig;
