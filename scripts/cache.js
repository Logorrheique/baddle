import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';
const CACHE_DIR = new URL('./cache/', import.meta.url).pathname;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
}
function cacheKey(url) {
    return createHash('md5').update(url).digest('hex') + '.json';
}
export function getCached(url) {
    const file = join(CACHE_DIR, cacheKey(url));
    if (!existsSync(file))
        return null;
    const stat = statSync(file);
    if (Date.now() - stat.mtimeMs > CACHE_TTL_MS)
        return null;
    try {
        const entry = JSON.parse(readFileSync(file, 'utf-8'));
        return entry.data;
    }
    catch {
        return null;
    }
}
export function setCached(url, data) {
    const file = join(CACHE_DIR, cacheKey(url));
    const entry = { url, data, timestamp: Date.now() };
    writeFileSync(file, JSON.stringify(entry), 'utf-8');
}
