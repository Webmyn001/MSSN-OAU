// Single source of truth for the backend API base URL.
// Override with VITE_API_BASE_URL (e.g. https://mssn-api-vusm.onrender.com) when
// building/deploying to production. Defaults to the local dev API.
export const API_BASE: string = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
