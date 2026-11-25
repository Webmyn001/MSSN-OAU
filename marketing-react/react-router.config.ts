import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

// * Vercel sets VERCEL=1 during its builds. Other hosts (Plesk, a VPS, or a
// * local server) get the standard server build that `react-router-serve` runs.
const isVercel = process.env.VERCEL === "1";

export default {
  ssr: true,
  presets: isVercel ? [vercelPreset()] : [],
} satisfies Config;
