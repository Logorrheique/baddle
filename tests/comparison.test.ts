import { describe, it, expect } from 'vitest';
import { compareGuess } from '../src/lib/comparison.ts';
import type { Player } from '../src/types/player.ts';

const BASE: Player = {
  id: 'target', name: 'Target', imageUrl: null,
  gender: 'H', continent: 'Asie', country: 'Chine', countryCode: 'CN',
  status: 'Actif', discipline: 'Simple', hand: 'Droitier',
  ageBracket: '30-35', heightBracket: '180-185', bestRanking: 'N°1',
  bestOlympicMedal: 'Or', majorTitles: '10-19', proStartDecade: '2010s',
};

function g(overrides: Partial<Player>): Player {
  return { ...BASE, id: 'guess', name: 'Guess', ...overrides };
}

describe('exact attributes', () => {
  it('correct when gender matches',   () => expect(compareGuess(g({}), BASE).gender.state).toBe('correct'));
  it('incorrect when gender differs', () => expect(compareGuess(g({ gender: 'F' }), BASE).gender.state).toBe('incorrect'));
  it('no arrow on exact attributes',  () => expect(compareGuess(g({ gender: 'F' }), BASE).gender.arrow).toBeNull());

  it('continent exact correct', () => expect(compareGuess(g({ continent: 'Asie' }), BASE).continent.state).toBe('correct'));
  it('continent exact incorrect', () => expect(compareGuess(g({ continent: 'Europe' }), BASE).continent.state).toBe('incorrect'));
  it('status exact', () => expect(compareGuess(g({ status: 'Retraité' }), BASE).status.state).toBe('incorrect'));
  it('discipline exact', () => expect(compareGuess(g({ discipline: 'Double' }), BASE).discipline.state).toBe('incorrect'));
  it('hand exact correct', () => expect(compareGuess(g({ hand: 'Droitier' }), BASE).hand.state).toBe('correct'));
  it('hand exact incorrect', () => expect(compareGuess(g({ hand: 'Gaucher' }), BASE).hand.state).toBe('incorrect'));
});

describe('ordinal — ageBracket', () => {
  it('correct when exact', () => {
    const r = compareGuess(g({ ageBracket: '30-35' }), BASE).ageBracket;
    expect(r.state).toBe('correct'); expect(r.arrow).toBeNull();
  });
  it('partial ↑ when 1 step below target', () => {
    const r = compareGuess(g({ ageBracket: '25-30' }), BASE).ageBracket;
    expect(r.state).toBe('partial'); expect(r.arrow).toBe('up');
  });
  it('partial ↓ when 1 step above target', () => {
    const r = compareGuess(g({ ageBracket: '35-40' }), BASE).ageBracket;
    expect(r.state).toBe('partial'); expect(r.arrow).toBe('down');
  });
  it('incorrect ↑ when 2+ steps below', () => {
    const r = compareGuess(g({ ageBracket: '<25' }), BASE).ageBracket;
    expect(r.state).toBe('incorrect'); expect(r.arrow).toBe('up');
  });
});

describe('ordinal — heightBracket', () => {
  it('correct when exact', () => expect(compareGuess(g({ heightBracket: '180-185' }), BASE).heightBracket.state).toBe('correct'));
  it('partial ↑ when 1 below', () => {
    const r = compareGuess(g({ heightBracket: '175-180' }), BASE).heightBracket;
    expect(r.state).toBe('partial'); expect(r.arrow).toBe('up');
  });
});

describe('ordinal — bestRanking', () => {
  it('partial ↑ when 1 step from N°1', () => {
    const r = compareGuess(g({ bestRanking: 'Top 2' }), BASE).bestRanking;
    expect(r.state).toBe('partial'); expect(r.arrow).toBe('up');
  });
  it('incorrect ↑ far from N°1', () => {
    const r = compareGuess(g({ bestRanking: 'Top 20' }), BASE).bestRanking;
    expect(r.state).toBe('incorrect'); expect(r.arrow).toBe('up');
  });
});
