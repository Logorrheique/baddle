/**
 * Rate limiting: Wikipedia max 1 req/sec, BWF max 0.5 req/sec.
 * All requests use a descriptive User-Agent per Wikipedia policy.
 */
export const USER_AGENT = 'BaddleScraper/1.0 (educational project)';
const lastRequestTime = {};
/**
 * Enforces a minimum delay between requests to the same host.
 */
export async function rateLimit(host) {
    const minInterval = host === 'wikipedia' ? 1000 : 2000;
    const last = lastRequestTime[host] ?? 0;
    const elapsed = Date.now() - last;
    if (elapsed < minInterval) {
        await sleep(minInterval - elapsed);
    }
    lastRequestTime[host] = Date.now();
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
