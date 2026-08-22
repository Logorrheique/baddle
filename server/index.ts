/**
 * Production server: serves the Vite-built SPA from /dist and exposes
 * a single API endpoint that runs the daily-player comparison server-side.
 *
 * Suggestions are NOT handled here — the in-app form opens GitHub's own
 * "new issue" page pre-filled, so there is no secret to store and no
 * abuse surface to defend.
 *
 * Required env vars (Railway → Variables):
 *   PORT                       (injected by Railway)
 *   DAILY_SEED_INTL            integer, hidden seed for INTL shuffle
 *   DAILY_SEED_FR              integer, hidden seed for FR shuffle
 *   DAILY_SEED_FALLBACK_OFFSET integer, applied if INTL and FR pick the same player
 *   ALLOWED_ORIGINS            optional, comma-separated; restricts /api/guess origin
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');
const PLAYERS_JSON = resolve(__dirname, '../src/data/players.json');

interface Player {
  id: string;
  name: string;
  imageUrl: string | null;
  gender: 'H' | 'F';
  country: string;
  countryCode: string;
  status: 'Actif' | 'Retraité';
  discipline: 'Simple' | 'Double' | 'Double mixte';
  hand: 'Droitier' | 'Gaucher';
  ageBracket: string;
  heightBracket: string;
  bestRanking: string;
  bestOlympicMedal: string;
  majorTitles: string;
  proStartDecade: string;
}

const PLAYERS: Player[] = JSON.parse(readFileSync(PLAYERS_JSON, 'utf-8')) as Player[];
const PLAYERS_BY_ID = new Map(PLAYERS.map(p => [p.id, p]));
const FR_PLAYERS = PLAYERS.filter(p => p.country === 'France');

// ─── Daily player (seeds in env vars so they stay out of the client) ─

const SEED_INTL = Number(process.env.DAILY_SEED_INTL ?? 42);
const SEED_FR = Number(process.env.DAILY_SEED_FR ?? 1042);
const SEED_FALLBACK_OFFSET = Number(process.env.DAILY_SEED_FALLBACK_OFFSET ?? 7919);
const EPOCH_DATE = new Date('2026-01-01T00:00:00Z');

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const r = [...arr];
  let s = seed;
  for (let i = r.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function daysSinceEpoch(date = new Date()): number {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const epoch = new Date(EPOCH_DATE.getUTCFullYear(), EPOCH_DATE.getUTCMonth(), EPOCH_DATE.getUTCDate());
  return Math.floor((local.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24));
}

function pick(players: Player[], seed: number, date: Date): Player {
  const shuffled = seededShuffle(players, seed);
  const days = daysSinceEpoch(date);
  const index = ((days % shuffled.length) + shuffled.length) % shuffled.length;
  return shuffled[index];
}

function dailyPlayer(mode: 'intl' | 'fr', date = new Date()): Player {
  const frPick = pick(FR_PLAYERS, SEED_FR, date);
  if (mode === 'fr') return frPick;
  let intlPick = pick(PLAYERS, SEED_INTL, date);
  if (intlPick.id === frPick.id) {
    intlPick = pick(PLAYERS, SEED_INTL + SEED_FALLBACK_OFFSET, date);
  }
  return intlPick;
}

// ─── Comparison (server-side so the target never reaches the client) ─

type CellState = 'correct' | 'partial' | 'incorrect';
type Arrow = 'up' | 'down' | null;
interface CellResult { state: CellState; arrow: Arrow }

const AGE_ORDER = ['<25', '25-30', '30-35', '35-40', '>40'] as const;
const HEIGHT_ORDER = ['<170', '170-175', '175-180', '180-185', '>185'] as const;
const RANKING_ORDER = ['Top 50', 'Top 20', 'Top 10', 'Top 5', 'Top 4', 'Top 3', 'Top 2', 'N°1'] as const;

function ordinal(order: readonly string[], g: string, t: string): CellResult {
  if (g === t) return { state: 'correct', arrow: null };
  const gi = order.indexOf(g);
  const ti = order.indexOf(t);
  const arrow: Arrow = gi < ti ? 'up' : 'down';
  return { state: Math.abs(gi - ti) === 1 ? 'partial' : 'incorrect', arrow };
}

function exact<T>(g: T, t: T): CellResult {
  return { state: g === t ? 'correct' : 'incorrect', arrow: null };
}

function compare(guess: Player, target: Player) {
  return {
    gender:        exact(guess.gender,        target.gender),
    country:       exact(guess.country,       target.country),
    status:        exact(guess.status,        target.status),
    discipline:    exact(guess.discipline,    target.discipline),
    hand:          exact(guess.hand,          target.hand),
    ageBracket:    ordinal(AGE_ORDER,    guess.ageBracket,    target.ageBracket),
    heightBracket: ordinal(HEIGHT_ORDER, guess.heightBracket, target.heightBracket),
    bestRanking:   ordinal(RANKING_ORDER, guess.bestRanking,  target.bestRanking),
  };
}

// ─── Rate limit (per IP, sliding window) ───────────────────────────

interface Bucket { hits: number[] }
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS  = 24 * HOUR_MS;
const GUESS_BUCKETS = new Map<string, Bucket>();
const GUESS_HOURLY = 60;
const GUESS_DAILY  = 200;

function checkGuessRate(ip: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const bucket = GUESS_BUCKETS.get(ip) ?? { hits: [] };
  bucket.hits = bucket.hits.filter(ts => now - ts < DAY_MS);
  const lastHour = bucket.hits.filter(ts => now - ts < HOUR_MS).length;
  if (lastHour >= GUESS_HOURLY) {
    const oldest = bucket.hits[bucket.hits.length - GUESS_HOURLY];
    return { ok: false, retryAfter: Math.ceil((oldest + HOUR_MS - now) / 1000) };
  }
  if (bucket.hits.length >= GUESS_DAILY) {
    const oldest = bucket.hits[0];
    return { ok: false, retryAfter: Math.ceil((oldest + DAY_MS - now) / 1000) };
  }
  bucket.hits.push(now);
  GUESS_BUCKETS.set(ip, bucket);
  return { ok: true };
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, b] of GUESS_BUCKETS) {
    b.hits = b.hits.filter(ts => now - ts < DAY_MS);
    if (b.hits.length === 0) GUESS_BUCKETS.delete(ip);
  }
}, HOUR_MS).unref();

// ─── App ───────────────────────────────────────────────────────────

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '8kb' }));

// ─── Security headers ──────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
});

function getClientIp(req: express.Request): string {
  return (req.headers['cf-connecting-ip'] as string | undefined)
      ?? (req.headers['x-real-ip'] as string | undefined)
      ?? req.ip
      ?? 'unknown';
}

function originAllowed(req: express.Request, allowed: string[]): boolean {
  if (allowed.length === 0) return true;
  const origin = req.headers.origin ?? '';
  const referer = req.headers.referer ?? '';
  return allowed.some(a => origin === a || referer.startsWith(a + '/') || referer === a);
}

// Healthcheck (for Railway / uptime monitors)
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, players: PLAYERS.length, frPlayers: FR_PLAYERS.length });
});

app.post('/api/guess', (req, res) => {
  const allowed = (process.env.ALLOWED_ORIGINS ?? '').split(',').map(s => s.trim()).filter(Boolean);
  if (!originAllowed(req, allowed)) { res.status(403).json({ error: 'Origin not allowed' }); return; }

  const body = req.body as { mode?: string; playerId?: string };
  if (typeof body?.playerId !== 'string') { res.status(400).json({ error: 'Invalid playerId' }); return; }

  const mode: 'intl' | 'fr' = body.mode === 'fr' ? 'fr' : 'intl';
  const guess = PLAYERS_BY_ID.get(body.playerId);
  if (!guess) { res.status(404).json({ error: 'Unknown player' }); return; }

  const ip = getClientIp(req);
  const rl = checkGuessRate(ip);
  if (!rl.ok) {
    res.setHeader('Retry-After', String(rl.retryAfter));
    res.status(429).json({ error: 'Rate limited', retryAfter: rl.retryAfter });
    return;
  }

  const target = dailyPlayer(mode);
  const result = compare(guess, target);
  const isWin = guess.id === target.id;

  res.json({
    result,
    isWin,
    target: isWin ? target : undefined,
  });
});

// JSON 404 for unknown API routes (before SPA fallback would return HTML)
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Static assets + SPA fallback
app.use(express.static(DIST, {
  maxAge: '1h',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
    if (path.includes('/assets/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  },
}));
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  res.sendFile(resolve(DIST, 'index.html'));
});

// Body-parse & unexpected errors → JSON, never leak stack traces
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) return next(err);
  const isBodyParse = err instanceof SyntaxError && 'body' in (err as object);
  res.status(isBodyParse ? 400 : 500).json({ error: isBodyParse ? 'Invalid JSON' : 'Internal error' });
});

const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => {
  console.log(`Baddle server listening on :${port} — serving ${DIST}`);
});

// Graceful shutdown
function shutdown(signal: string) {
  console.log(`${signal} received, shutting down…`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
