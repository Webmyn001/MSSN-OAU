// Single source of truth for the backend API base URL.
// Override with VITE_API_BASE_URL (e.g. https://mssn-api-vusm.onrender.com) when
// building/deploying to production. Defaults to the local dev API.
const rawBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:3000";

export const API_BASE = rawBase.replace(/\/$/, "");
