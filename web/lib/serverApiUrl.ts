/**
 * API base URL for SERVER-SIDE code (server components, route handlers,
 * NextAuth authorize). This runs inside the web process, not the browser.
 *
 * In Docker the web container must reach the API via the compose service name
 * (`INTERNAL_API_URL=http://api:3001`) — `localhost:3001` there points at the
 * web container itself. The browser instead uses NEXT_PUBLIC_API_URL
 * (http://localhost:3001, reachable via the published port).
 *
 * INTERNAL_API_URL is intentionally NOT prefixed with NEXT_PUBLIC_, so it is
 * read at runtime (not inlined at build). When it is unset — e.g. running the
 * web natively with `npm run dev` — it falls back to the public URL, so local
 * dev keeps working unchanged.
 */
export const SERVER_API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001';
