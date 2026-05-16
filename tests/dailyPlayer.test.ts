import { describe, it, expect } from 'vitest';
import { getDailyPlayer, daysSinceEpoch, todayString, getPuzzleNumber } from '../src/lib/dailyPlayer.ts';
import type { Player } from '../src/types/player.ts';

function makePlayer(id: string): Player {
  return {
    id, name: id, imageUrl: null, gender: 'H', continent: 'Asie',
    country: 'Chine', countryCode: 'CN', status: 'Actif',
    discipline: 'Simple', hand: 'Droitier', ageBracket: '30-35',
    heightBracket: '180-185', bestRanking: 'N°1', bestOlympicMedal: 'Or',
    majorTitles: '4-9', proStartDecade: '2010s',
  };
}

const PLAYERS = Array.from({ length: 10 }, (_, i) => makePlayer(`player-${i}`));

describe('daysSinceEpoch', () => {
  it('returns 0 on epoch date', () => {
    expect(daysSinceEpoch(new Date(2026, 0, 1))).toBe(0);
  });

  it('returns 1 on Jan 2 2026', () => {
    expect(daysSinceEpoch(new Date(2026, 0, 2))).toBe(1);
  });

  it('returns 365 roughly one year later', () => {
    const d = daysSinceEpoch(new Date(2027, 0, 1));
    expect(d).toBe(365);
  });
});

describe('getDailyPlayer — determinism', () => {
  it('same date always returns same player', () => {
    const d = new Date(2026, 4, 16);
    const p1 = getDailyPlayer(PLAYERS, d);
    const p2 = getDailyPlayer(PLAYERS, d);
    expect(p1.id).toBe(p2.id);
  });

  it('two different dates return different players (most of the time)', () => {
    const d1 = new Date(2026, 0, 1);
    const d2 = new Date(2026, 0, 2);
    const p1 = getDailyPlayer(PLAYERS, d1);
    const p2 = getDailyPlayer(PLAYERS, d2);
    // Not guaranteed but extremely likely for 10 players
    expect(p1.id).not.toBe(p2.id);
  });

  it('cycles through all players over N days', () => {
    const seen = new Set<string>();
    for (let i = 0; i < PLAYERS.length; i++) {
      const d = new Date(2026, 0, 1 + i);
      seen.add(getDailyPlayer(PLAYERS, d).id);
    }
    expect(seen.size).toBe(PLAYERS.length);
  });
});

describe('todayString', () => {
  it('formats date correctly', () => {
    expect(todayString(new Date(2026, 4, 16))).toBe('2026-05-16');
  });

  it('pads month and day', () => {
    expect(todayString(new Date(2026, 0, 3))).toBe('2026-01-03');
  });
});

describe('getPuzzleNumber', () => {
  it('is 1 on epoch date', () => {
    expect(getPuzzleNumber(PLAYERS, new Date(2026, 0, 1))).toBe(1);
  });

  it('is 2 on Jan 2', () => {
    expect(getPuzzleNumber(PLAYERS, new Date(2026, 0, 2))).toBe(2);
  });
});
