import { describe, it, expect } from 'vitest';
import {
  parseBirthDate, parseHeight, parseHandedness,
  parseHighestRanking, parseCountry, calculateAge,
} from '../parsers.js';

describe('parseBirthDate', () => {
  it('parses ISO date in parentheses', () => {
    const d = parseBirthDate('(1994-01-04)');
    expect(d?.getUTCFullYear()).toBe(1994);
    expect(d?.getUTCMonth()).toBe(0);
    expect(d?.getUTCDate()).toBe(4);
  });

  it('parses "D Month YYYY" format', () => {
    const d = parseBirthDate('4 January 1994');
    expect(d?.getUTCFullYear()).toBe(1994);
    expect(d?.getUTCMonth()).toBe(0);
    expect(d?.getUTCDate()).toBe(4);
  });

  it('parses "Month D, YYYY" format', () => {
    const d = parseBirthDate('January 4, 1994');
    expect(d?.getUTCFullYear()).toBe(1994);
    expect(d?.getUTCDate()).toBe(4);
  });

  it('parses plain ISO YYYY-MM-DD', () => {
    const d = parseBirthDate('1983-10-14');
    expect(d?.getUTCFullYear()).toBe(1983);
    expect(d?.getUTCMonth()).toBe(9);
  });

  it('handles age suffix "(age 30)"', () => {
    const d = parseBirthDate('(1994-01-04)(age 30)');
    expect(d?.getUTCFullYear()).toBe(1994);
  });

  it('returns null for empty string', () => {
    expect(parseBirthDate('')).toBeNull();
  });

  it('returns null for unparseable string', () => {
    expect(parseBirthDate('unknown')).toBeNull();
  });
});

describe('parseHeight', () => {
  it('parses meters "1.94 m"', () => {
    expect(parseHeight('1.94 m')).toBe(194);
  });

  it('parses meters without space "1.80m"', () => {
    expect(parseHeight('1.80m')).toBe(180);
  });

  it('parses centimeters "170 cm"', () => {
    expect(parseHeight('170 cm')).toBe(170);
  });

  it('parses feet and inches "6 ft 4 in"', () => {
    const h = parseHeight('6 ft 4 in');
    expect(h).toBeGreaterThan(190);
    expect(h).toBeLessThan(195);
  });

  it('parses feet only "5 ft"', () => {
    const h = parseHeight('5 ft');
    expect(h).toBeGreaterThan(150);
    expect(h).toBeLessThan(155);
  });

  it('returns null for empty string', () => {
    expect(parseHeight('')).toBeNull();
  });
});

describe('parseHandedness', () => {
  it('detects left-handed', () => {
    expect(parseHandedness('Left')).toBe('Gaucher');
    expect(parseHandedness('left-handed')).toBe('Gaucher');
  });

  it('detects right-handed', () => {
    expect(parseHandedness('Right')).toBe('Droitier');
    expect(parseHandedness('right-handed')).toBe('Droitier');
  });

  it('returns null for unknown', () => {
    expect(parseHandedness('')).toBeNull();
    expect(parseHandedness('ambidextrous')).toBeNull();
  });
});

describe('parseHighestRanking', () => {
  it('parses "World No. 1"', () => {
    expect(parseHighestRanking('World No. 1')).toBe(1);
  });

  it('parses plain number "3"', () => {
    expect(parseHighestRanking('3')).toBe(3);
  });

  it('parses "No. 5 (2022)"', () => {
    expect(parseHighestRanking('No. 5 (2022)')).toBe(5);
  });

  it('returns null for empty', () => {
    expect(parseHighestRanking('')).toBeNull();
  });
});

describe('parseCountry', () => {
  it('strips ref markers', () => {
    expect(parseCountry('Denmark[1]')).toBe('Denmark');
  });

  it('strips parenthetical dates', () => {
    expect(parseCountry('China (2010–present)')).toBe('China');
  });

  it('strips flag emojis', () => {
    expect(parseCountry('🇩🇰 Denmark')).toBe('Denmark');
  });

  it('returns null for empty string', () => {
    expect(parseCountry('')).toBeNull();
  });
});

describe('calculateAge', () => {
  it('calculates age correctly for known date', () => {
    const birth = new Date('1983-10-14');
    const age = calculateAge(birth);
    expect(age).toBeGreaterThanOrEqual(40);
    expect(age).toBeLessThanOrEqual(50);
  });

  it('handles recent birth', () => {
    // Use exact date 20 years ago to avoid leap-year drift
    const now = new Date();
    const birth = new Date(Date.UTC(now.getUTCFullYear() - 20, now.getUTCMonth(), now.getUTCDate()));
    const age = calculateAge(birth);
    expect(age).toBe(20);
  });
});
