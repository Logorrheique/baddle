import { describe, it, expect } from 'vitest';
import { comparePlayer } from '../src/lib/comparison';
import type { Player } from '../src/types/player';

const base: Player = {
  id: 'viktor-axelsen',
  name: 'Viktor Axelsen',
  imageUrl: null,
  gender: 'H',
  continent: 'Europe',
  country: 'Danemark',
  countryCode: 'DK',
  status: 'Actif',
  discipline: 'Simple',
  hand: 'Droitier',
  ageBracket: '30-35',
  heightBracket: '>185',
  bestRanking: 'N°1',
  bestOlympicMedal: 'Or',
  majorTitles: '20+',
  proStartDecade: '2010s',
};

describe('comparePlayer — attributs catégoriels', () => {
  it('gender correct si identique', () => {
    const result = comparePlayer(base, base);
    expect(result.gender.state).toBe('correct');
    expect(result.gender.arrow).toBeNull();
  });

  it('gender incorrect si différent', () => {
    const target = { ...base, gender: 'F' } as Player;
    const result = comparePlayer(base, target);
    expect(result.gender.state).toBe('incorrect');
  });

  it('status correct si identique', () => {
    const result = comparePlayer(base, base);
    expect(result.status.state).toBe('correct');
  });

  it('discipline incorrect si différente', () => {
    const target = { ...base, discipline: 'Double' } as Player;
    const result = comparePlayer(base, target);
    expect(result.discipline.state).toBe('incorrect');
  });

  it('hand correct si identique', () => {
    const result = comparePlayer(base, base);
    expect(result.hand.state).toBe('correct');
  });
});

describe('comparePlayer — pays avec orange', () => {
  it('pays correct si même pays', () => {
    const result = comparePlayer(base, base);
    expect(result.country.state).toBe('correct');
  });

  it('pays partial si même continent mais pays différent', () => {
    const guess = { ...base, country: 'France', countryCode: 'FR' } as Player;
    const result = comparePlayer(guess, base);
    expect(result.country.state).toBe('partial');
  });

  it('pays incorrect si continent différent', () => {
    const guess = { ...base, continent: 'Asie', country: 'Chine', countryCode: 'CN' } as Player;
    const result = comparePlayer(guess, base);
    expect(result.country.state).toBe('incorrect');
  });
});

describe('comparePlayer — attributs ordonnés avec flèches', () => {
  it('ageBracket correct si identique', () => {
    const result = comparePlayer(base, base);
    expect(result.ageBracket.state).toBe('correct');
    expect(result.ageBracket.arrow).toBeNull();
  });

  it('ageBracket partial si adjacent, flèche vers le haut si cible plus âgée', () => {
    const target = { ...base, ageBracket: '35-40' } as Player;
    const result = comparePlayer(base, target);
    expect(result.ageBracket.state).toBe('partial');
    expect(result.ageBracket.arrow).toBe('up');
  });

  it('ageBracket partial si adjacent, flèche vers le bas si cible plus jeune', () => {
    const target = { ...base, ageBracket: '25-30' } as Player;
    const result = comparePlayer(base, target);
    expect(result.ageBracket.state).toBe('partial');
    expect(result.ageBracket.arrow).toBe('down');
  });

  it('ageBracket incorrect si écart > 1', () => {
    const target = { ...base, ageBracket: '>40' } as Player;
    const result = comparePlayer(base, target);
    expect(result.ageBracket.state).toBe('incorrect');
    expect(result.ageBracket.arrow).toBe('up');
  });

  it('bestRanking correct si identique', () => {
    const result = comparePlayer(base, base);
    expect(result.bestRanking.state).toBe('correct');
  });

  it('bestRanking flèche down si guess est meilleur que target', () => {
    // guess=N°1 (index 4), target=Top 3 (index 3) => target lower => arrow down
    const target = { ...base, bestRanking: 'Top 3' } as Player;
    const result = comparePlayer(base, target);
    expect(result.bestRanking.state).toBe('partial');
    expect(result.bestRanking.arrow).toBe('down');
  });

  it('bestOlympicMedal partial si adjacent', () => {
    // guess=Or (3), target=Argent (2) => arrow down
    const target = { ...base, bestOlympicMedal: 'Argent' } as Player;
    const result = comparePlayer(base, target);
    expect(result.bestOlympicMedal.state).toBe('partial');
    expect(result.bestOlympicMedal.arrow).toBe('down');
  });

  it('majorTitles flèche up si cible a plus de titres', () => {
    const guess = { ...base, majorTitles: '10-19' } as Player;
    const result = comparePlayer(guess, base);
    expect(result.majorTitles.state).toBe('partial');
    expect(result.majorTitles.arrow).toBe('up');
  });

  it('proStartDecade incorrect et flèche down si cible a commencé avant', () => {
    // guess=2010s (index 2), target=2000s (index 1) => distance 1 => partial
    const target = { ...base, proStartDecade: '2000s' } as Player;
    const result = comparePlayer(base, target);
    expect(result.proStartDecade.state).toBe('partial');
    expect(result.proStartDecade.arrow).toBe('down');
  });
});

describe('comparePlayer — valeur dans CellResult', () => {
  it('retourne la valeur du guess dans chaque cellule', () => {
    const result = comparePlayer(base, base);
    expect(result.gender.value).toBe('H');
    expect(result.country.value).toBe('Danemark');
    expect(result.ageBracket.value).toBe('30-35');
  });
});
