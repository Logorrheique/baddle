import type { Player } from '../types/player';

const SHUFFLE_SEED = 42;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const shuffled = [...arr];
  const rand = seededRandom(seed);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getDayNumber(date: Date = new Date()): number {
  const utcDate = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const epochUtc = Date.UTC(2026, 0, 1);
  return Math.floor((utcDate - epochUtc) / (1000 * 60 * 60 * 24));
}

export function getDailyPlayer(
  players: Player[],
  date: Date = new Date()
): Player {
  const shuffled = seededShuffle(players, SHUFFLE_SEED);
  const n = getDayNumber(date);
  const index = ((n % shuffled.length) + shuffled.length) % shuffled.length;
  return shuffled[index];
}
