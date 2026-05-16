import { describe, it, expect } from 'vitest';
import { compareGuess } from '../src/lib/comparison.ts';
import type { Player } from '../src/types/player.ts';

const BASE: Player = {
  id: 'target',
  name: 'Target',
  imageUrl: null,
  gender: 'H',
  continent: 'Asie',
  country: 'Chine',
  countryCode: 'CN',
  status: 'Actif',
  discipline: 'Simple',
  hand: 'Droitier',
  ageBracket: '30-35',
  heightBracket: '180-185',
  bestRanking: 'N°1',
  bestOlympicMedal: 'Or',
  majorTitles: '10-19',
  proStartDecade: '2010s',
};

function guess(overrides: Partial<Player>): Player {
  return { ...BASE, id: 'guess', name: 'Guess', ...overrides };
}

describe('exact attributes', () => {
  it('correct when gender matches', () => {
    expect(compareGuess(guess({}), BASE).gender.state).toBe('correct');
  });

  it('incorrect when gender differs', () => {
    expect(compareGuess(guess({ gender: 'F' }), BASE).gender.state).toBe('incorrect');
  });

  it('exact attributes have no arrow', () => {
    const r = compareGuess(guess({ gender: 'F' }), BASE).gender;
    expect(r.arrow).toBeNull();
  });
});

describe('country rule', () => {
  it('correct when same country', () => {
    expect(compareGuess(guess({ country: 'Chine' }), BASE).country.state).toBe('correct');
  });

  it('partial when same continent, different country', () => {
    expect(compareGuess(guess({ country: 'Japon', continent: 'Asie' }), BASE).country.state).toBe('partial');
  });

  it('incorrect when different continent', () => {
    expect(compareGuess(guess({ country: 'Danemark', continent: 'Europe' }), BASE).country.state).toBe('incorrect');
  });
});

describe('ordinal attributes — ageBracket', () => {
  it('correct when exact match', () => {
    const r = compareGuess(guess({ ageBracket: '30-35' }), BASE).ageBracket;
    expect(r.state).toBe('correct');
    expect(r.arrow).toBeNull();
  });

  it('partial with up arrow when 1 step below', () => {
    // guess 25-30, target 30-35 → need to go up
    const r = compareGuess(guess({ ageBracket: '25-30' }), BASE).ageBracket;
    expect(r.state).toBe('partial');
    expect(r.arrow).toBe('up');
  });

  it('partial with down arrow when 1 step above', () => {
    const r = compareGuess(guess({ ageBracket: '35-40' }), BASE).ageBracket;
    expect(r.state).toBe('partial');
    expect(r.arrow).toBe('down');
  });

  it('incorrect with arrow when 2+ steps away', () => {
    const r = compareGuess(guess({ ageBracket: '<25' }), BASE).ageBracket;
    expect(r.state).toBe('incorrect');
    expect(r.arrow).toBe('up');
  });
});

describe('ordinal attributes — bestRanking', () => {
  it('partial when 1 step away', () => {
    // Target N°1, guess Top 3
    const r = compareGuess(guess({ bestRanking: 'Top 3' }), BASE).bestRanking;
    expect(r.state).toBe('partial');
    expect(r.arrow).toBe('up'); // Top 3 < N°1 in order → needs to go up
  });
});

describe('ordinal attributes — bestOlympicMedal', () => {
  it('partial when Bronze vs Silver', () => {
    const target = { ...BASE, bestOlympicMedal: 'Argent' } as Player;
    const r = compareGuess(guess({ bestOlympicMedal: 'Bronze' }), target).bestOlympicMedal;
    expect(r.state).toBe('partial');
    expect(r.arrow).toBe('up');
  });

  it('correct for Aucune', () => {
    const target = { ...BASE, bestOlympicMedal: 'Aucune' } as Player;
    const r = compareGuess(guess({ bestOlympicMedal: 'Aucune' }), target).bestOlympicMedal;
    expect(r.state).toBe('correct');
  });
});
