import type { Player, AgeBracket, HeightBracket, RankingTier, TitlesTier, OlympicMedal, Decade } from '../types/player.ts';

export type CellState = 'correct' | 'partial' | 'incorrect';
export type Arrow = 'up' | 'down' | null;

export interface CellResult {
  state: CellState;
  arrow: Arrow;
}

export type GuessResult = {
  [K in keyof Omit<Player, 'id' | 'name' | 'imageUrl' | 'countryCode'>]: CellResult;
};

const AGE_ORDER: AgeBracket[] = ['<25', '25-30', '30-35', '35-40', '>40'];
const HEIGHT_ORDER: HeightBracket[] = ['<170', '170-175', '175-180', '180-185', '>185'];
const RANKING_ORDER: RankingTier[] = ['Top 20', 'Top 10', 'Top 5', 'Top 3', 'N°1'];
const TITLES_ORDER: TitlesTier[] = ['0', '1-3', '4-9', '10-19', '20+'];
const DECADE_ORDER: Decade[] = ['1990s', '2000s', '2010s', '2020s'];
const MEDAL_ORDER: OlympicMedal[] = ['Aucune', 'Bronze', 'Argent', 'Or'];

function ordinal<T>(order: T[], guess: T, target: T): CellResult {
  if (guess === target) return { state: 'correct', arrow: null };
  const gi = order.indexOf(guess);
  const ti = order.indexOf(target);
  const diff = Math.abs(gi - ti);
  const arrow: Arrow = gi < ti ? 'up' : 'down';
  if (diff === 1) return { state: 'partial', arrow };
  return { state: 'incorrect', arrow };
}

function exact<T>(guess: T, target: T): CellResult {
  return guess === target
    ? { state: 'correct', arrow: null }
    : { state: 'incorrect', arrow: null };
}

/**
 * Compares a guessed player against the target and returns per-attribute results.
 */
export function compareGuess(guess: Player, target: Player): GuessResult {
  // Country: correct / same continent (partial) / different (incorrect)
  let countryResult: CellResult;
  if (guess.country === target.country) {
    countryResult = { state: 'correct', arrow: null };
  } else if (guess.continent === target.continent) {
    countryResult = { state: 'partial', arrow: null };
  } else {
    countryResult = { state: 'incorrect', arrow: null };
  }

  return {
    gender: exact(guess.gender, target.gender),
    continent: exact(guess.continent, target.continent),
    country: countryResult,
    status: exact(guess.status, target.status),
    discipline: exact(guess.discipline, target.discipline),
    hand: exact(guess.hand, target.hand),
    ageBracket: ordinal(AGE_ORDER, guess.ageBracket, target.ageBracket),
    heightBracket: ordinal(HEIGHT_ORDER, guess.heightBracket, target.heightBracket),
    bestRanking: ordinal(RANKING_ORDER, guess.bestRanking, target.bestRanking),
    bestOlympicMedal: ordinal(MEDAL_ORDER, guess.bestOlympicMedal, target.bestOlympicMedal),
    majorTitles: ordinal(TITLES_ORDER, guess.majorTitles, target.majorTitles),
    proStartDecade: ordinal(DECADE_ORDER, guess.proStartDecade, target.proStartDecade),
  };
}
