import { describe, it, expect } from 'vitest';
import { daysSinceEpoch, todayString, getPuzzleNumber } from '../src/lib/dailyPlayer.ts';

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
    expect(getPuzzleNumber(new Date(2026, 0, 1))).toBe(1);
  });

  it('is 2 on Jan 2', () => {
    expect(getPuzzleNumber(new Date(2026, 0, 2))).toBe(2);
  });
});
