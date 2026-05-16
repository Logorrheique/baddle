import type { Player } from '../types/player.ts';

const EPOCH_DATE = new Date('2026-01-01T00:00:00Z');
const SEED = 42;

/**
 * Deterministic Fisher-Yates shuffle with a fixed seed.
 * Same seed always produces the same permutation.
 */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    // LCG random
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Returns number of full days since EPOCH_DATE in the user's local timezone.
 */
export function daysSinceEpoch(date: Date = new Date()): number {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const epoch = new Date(
    EPOCH_DATE.getUTCFullYear(),
    EPOCH_DATE.getUTCMonth(),
    EPOCH_DATE.getUTCDate(),
  );
  return Math.floor((local.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Returns today's date string in "YYYY-MM-DD" format (local time).
 */
export function todayString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns the daily player for the given list of players and optional date.
 * Identical for all users on the same calendar day (local time).
 */
export function getDailyPlayer(players: Player[], date: Date = new Date()): Player {
  const shuffled = seededShuffle(players, SEED);
  const days = daysSinceEpoch(date);
  const index = ((days % shuffled.length) + shuffled.length) % shuffled.length;
  return shuffled[index];
}

/**
 * Returns the puzzle number (1-indexed) for a given date.
 */
export function getPuzzleNumber(_players: Player[], date: Date = new Date()): number {
  return daysSinceEpoch(date) + 1;
}
