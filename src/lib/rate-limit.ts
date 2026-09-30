/**
 * Best-effort, in-memory rate limiting for the estimate endpoint.
 *
 * Explicit limitation: on Vercel, a serverless function's in-memory
 * state is only shared across requests handled by the SAME warm
 * instance. A cold start (new instance) gets a fresh, empty Map, and
 * under concurrent traffic multiple instances can run at once with
 * separate memory — so this does NOT provide robust, guaranteed rate
 * limiting across all traffic to the endpoint. It only reliably catches
 * rapid repeated requests that land on the same warm instance (e.g. a
 * script hammering the endpoint in a short burst), which is still
 * useful as one layer of defense for a low-volume local business site,
 * but it is not a substitute for real distributed rate limiting.
 *
 * Real, robust rate limiting (guaranteed across every instance and
 * surviving cold starts) requires a shared external store — e.g.
 * Vercel KV or Upstash Redis — which is a new piece of infrastructure
 * and has not been added here without approval. See the
 * production-readiness report for this call-out.
 */

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

const requestLog = new Map<string, number[]>();

/**
 * Returns true if `key` (typically a client IP) is still within its
 * allowance for the current window. Evicts timestamps older than the
 * window on every call so the map doesn't grow unbounded over the life
 * of a warm instance.
 */
export function isWithinRateLimit(key: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const previous = requestLog.get(key) ?? [];
  const recent = previous.filter((timestamp) => timestamp > windowStart);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(key, recent);
    return false;
  }

  recent.push(now);
  requestLog.set(key, recent);
  return true;
}
