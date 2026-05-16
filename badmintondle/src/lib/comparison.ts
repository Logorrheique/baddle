import type { Player } from '../types/player';

export type CellState = 'correct' | 'partial' | 'incorrect';
export type Arrow = 'up' | 'down' | null;

export interface CellResult {
  state: CellState;
  arrow: Arrow;
  value: string;
}

const ORDERS = {
  ageBracket: ['<25', '25-30', '30-35', '35-40', '>40'],
  heightBracket: ['<170', '170-175', '175-180', '180-185', '>185'],
  bestRanking: ['Top 20', 'Top 10', 'Top 5', 'Top 3', 'N°1'],
  majorTitles: ['0', '1-3', '4-9', '10-19', '20+'],
  proStartDecade: ['1990s', '2000s', '2010s', '2020s'],
  bestOlympicMedal: ['Aucune', 'Bronze', 'Argent', 'Or'],
} as const;

function compareOrdered(
  guessVal: string,
  targetVal: string,
  order: readonly string[]
): CellResult {
  const guessIdx = order.indexOf(guessVal);
  const targetIdx = order.indexOf(targetVal);

  if (guessIdx === targetIdx) {
    return { state: 'correct', arrow: null, value: guessVal };
  }

  const diff = Math.abs(guessIdx - targetIdx);
  const state = diff === 1 ? 'partial' : 'incorrect';
  // Arrow points toward the target: if target has higher index (higher rank/more) → up
  const arrow: Arrow = targetIdx > guessIdx ? 'up' : 'down';
  return { state, arrow, value: guessVal };
}

function compareCategorical(guessVal: string, targetVal: string): CellResult {
  return {
    state: guessVal === targetVal ? 'correct' : 'incorrect',
    arrow: null,
    value: guessVal,
  };
}

export function comparePlayer(
  guess: Player,
  target: Player
): Record<keyof Player, CellResult> {
  return {
    id: compareCategorical(guess.id, target.id),
    name: compareCategorical(guess.name, target.name),
    imageUrl: compareCategorical(
      guess.imageUrl ?? '',
      target.imageUrl ?? ''
    ),
    gender: compareCategorical(guess.gender, target.gender),
    continent: compareCategorical(guess.continent, target.continent),
    country: (() => {
      if (guess.country === target.country)
        return { state: 'correct' as CellState, arrow: null, value: guess.country };
      if (guess.continent === target.continent)
        return { state: 'partial' as CellState, arrow: null, value: guess.country };
      return { state: 'incorrect' as CellState, arrow: null, value: guess.country };
    })(),
    countryCode: compareCategorical(guess.countryCode, target.countryCode),
    status: compareCategorical(guess.status, target.status),
    discipline: compareCategorical(guess.discipline, target.discipline),
    hand: compareCategorical(guess.hand, target.hand),
    ageBracket: compareOrdered(
      guess.ageBracket,
      target.ageBracket,
      ORDERS.ageBracket
    ),
    heightBracket: compareOrdered(
      guess.heightBracket,
      target.heightBracket,
      ORDERS.heightBracket
    ),
    bestRanking: compareOrdered(
      guess.bestRanking,
      target.bestRanking,
      ORDERS.bestRanking
    ),
    bestOlympicMedal: compareOrdered(
      guess.bestOlympicMedal,
      target.bestOlympicMedal,
      ORDERS.bestOlympicMedal
    ),
    majorTitles: compareOrdered(
      guess.majorTitles,
      target.majorTitles,
      ORDERS.majorTitles
    ),
    proStartDecade: compareOrdered(
      guess.proStartDecade,
      target.proStartDecade,
      ORDERS.proStartDecade
    ),
  };
}
