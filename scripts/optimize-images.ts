/**
 * Recompresses public/players/*.jpg in place: max 256×256, mozjpeg q80.
 * Idempotent — skips images already smaller than the target.
 * Usage: npm run optimize-images
 */
import { readdir, readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import sharp from 'sharp';

const DIR = resolve(process.cwd(), 'public/players');
const MAX_DIM = 256;
const QUALITY = 80;

const files = (await readdir(DIR)).filter(f => f.endsWith('.jpg'));
let before = 0;
let after = 0;
let changed = 0;

for (const file of files) {
  const path = resolve(DIR, file);
  const input = await readFile(path);
  const output = await sharp(input)
    .resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();
  if (output.length < input.length) {
    await writeFile(path, output);
    before += input.length;
    after += output.length;
    changed++;
    console.log(`${file}: ${(input.length / 1024).toFixed(0)}kB → ${(output.length / 1024).toFixed(0)}kB`);
  } else {
    before += input.length;
    after += input.length;
  }
}

console.log(`\n${changed}/${files.length} images optimized — ${(before / 1024).toFixed(0)}kB → ${(after / 1024).toFixed(0)}kB`);
