/**
 * Where the API is. Comes from the .env files (VITE_API_BASE_URL), never typed in code:
 * .env.development → your local API (https://localhost:7311); .env.production is added at M9 (deploy).
 */
const configured = import.meta.env.VITE_API_BASE_URL

if (!configured) {
  throw new Error('VITE_API_BASE_URL is empty. Set it in .env.development (and .env.production once deployed).')
}

/** The API's address without a trailing slash. */
export const apiBaseUrl = configured.replace(/\/+$/, '')

/** A full address for an API path, e.g. "api/hello" → "https://localhost:7311/api/hello". */
export function apiUrl(path: string): string {
  return `${apiBaseUrl}/${path.replace(/^\/+/, '')}`
}
