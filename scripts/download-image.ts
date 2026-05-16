import axios from 'axios';
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { USER_AGENT } from './ethics.js';

const OUT_DIR = new URL('../public/players/', import.meta.url).pathname;

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Downloads a Wikipedia image and saves it as a 400x400 JPG (quality 85).
 * Returns the local public path (/players/{slug}.jpg), or null on failure.
 * Retries up to 3 times with backoff for 429 rate limits.
 */
export async function downloadAndResizeImage(
  slug: string,
  remoteUrl: string,
): Promise<string | null> {
  const outPath = join(OUT_DIR, `${slug}.jpg`);

  if (existsSync(outPath)) {
    return `/players/${slug}.jpg`;
  }

  const cleanUrl = remoteUrl.split('?')[0];

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await sleep(3000 * attempt);
    try {
      const res = await axios.get<ArrayBuffer>(cleanUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': USER_AGENT,
          'Referer': 'https://en.wikipedia.org/',
        },
        timeout: 20000,
      });

      const buffer = Buffer.from(res.data);
      await sharp(buffer)
        .resize(400, 400, { fit: 'cover', position: 'top' })
        .jpeg({ quality: 85 })
        .toFile(outPath);

      return `/players/${slug}.jpg`;
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 429 && attempt < 2) continue;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`  [${slug}] Image download failed: ${msg}`);
      return null;
    }
  }

  return null;
}
