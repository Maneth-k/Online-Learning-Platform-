/**
 * Base URL for API requests.
 * Defaults to empty string so requests use relative paths with Vite's proxy locally.
 * In production on Vercel, this can be pointed directly to the Render backend
 * using the VITE_API_URL environment variable (for example, https://lms-api.onrender.com).
 */
const rawBase = (import.meta.env.VITE_API_URL as string | undefined) || '';
export const API_ROOT = rawBase.replace(/\/+$/, '');
