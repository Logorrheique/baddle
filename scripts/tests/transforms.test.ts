import { describe, it, expect } from 'vitest';
import {
  ageToBracket, heightToBracket, rankingToTier, titlesToTier,
  COUNTRY_TO_CONTINENT, COUNTRY_TO_CODE, COUNTRY_EN_TO_FR,
} from '../transforms.js';

describe('ageToBracket', () => {
  it.each([
    [24, '<25'],
    [25, '25-30'],
    [29, '25-30'],
    [30, '30-35'],
    [34, '30-35'],
    [35, '35-40'],
    [40, '>40'],
    [50, '>40'],
  ])('age %i → %s', (age, expected) => {
    expect(ageToBracket(age)).toBe(expected);
  });
});

describe('heightToBracket', () => {
  it.each([
    [165, '<170'],
    [169, '<170'],
    [170, '170-175'],
    [174, '170-175'],
    [175, '175-180'],
    [179, '175-180'],
    [180, '180-185'],
    [184, '180-185'],
    [185, '>185'],
    [194, '>185'],
  ])('%i cm → %s', (cm, expected) => {
    expect(heightToBracket(cm)).toBe(expected);
  });
});

describe('rankingToTier', () => {
  it.each([
    [1, 'N°1'],
    [2, 'Top 3'],
    [3, 'Top 3'],
    [4, 'Top 5'],
    [5, 'Top 5'],
    [6, 'Top 10'],
    [10, 'Top 10'],
    [11, 'Top 20'],
    [20, 'Top 20'],
  ])('rank %i → %s', (rank, expected) => {
    expect(rankingToTier(rank)).toBe(expected);
  });
});

describe('titlesToTier', () => {
  it.each([
    [0, '0'],
    [1, '1-3'],
    [3, '1-3'],
    [4, '4-9'],
    [9, '4-9'],
    [10, '10-19'],
    [19, '10-19'],
    [20, '20+'],
    [30, '20+'],
  ])('%i titles → %s', (n, expected) => {
    expect(titlesToTier(n)).toBe(expected);
  });
});

describe('country mappings', () => {
  it('Denmark maps to Europe', () => {
    expect(COUNTRY_TO_CONTINENT['Denmark']).toBe('Europe');
  });

  it('China maps to Asie', () => {
    expect(COUNTRY_TO_CONTINENT['China']).toBe('Asie');
  });

  it('Denmark code is DK', () => {
    expect(COUNTRY_TO_CODE['Denmark']).toBe('DK');
  });

  it('France translates to French', () => {
    expect(COUNTRY_EN_TO_FR['France']).toBe('France');
  });

  it('South Korea translates correctly', () => {
    expect(COUNTRY_EN_TO_FR['South Korea']).toBe('Corée du Sud');
  });
});
