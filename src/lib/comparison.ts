import type { Player, AgeBracket, HeightBracket, RankingTier } from '../types/player.ts';

export type CellState = 'correct' | 'partial' | 'incorrect';
export type Arrow = 'up' | 'down' | null;

export interface CellResult {
  state: CellState;
  arrow: Arrow;
}

// 8 comparison columns — Palmarès (JO medal, titles, decade) removed
export type GuessResult = {
  [K in keyof Omit<Player, 'id' | 'name' | 'imageUrl' | 'countryCode' | 'country' | 'bestOlympicMedal' | 'majorTitles' | 'proStartDecade'>]: CellResult;
};

const AGE_ORDER: AgeBracket[]    = ['<25', '25-30', '30-35', '35-40', '>40'];
const HEIGHT_ORDER: HeightBracket[] = ['<170', '170-175', '175-180', '180-185', '>185'];
const RANKING_ORDER: RankingTier[]  = ['Top 50', 'Top 20', 'Top 10', 'Top 5', 'Top 4', 'Top 3', 'Top 2', 'N°1'];

function ordinal<T>(order: T[], guess: T, target: T): CellResult {
  if (guess === target) return { state: 'correct', arrow: null };
  const gi = order.indexOf(guess);
  const ti = order.indexOf(target);
  const arrow: Arrow = gi < ti ? 'up' : 'down';
  if (Math.abs(gi - ti) === 1) return { state: 'partial', arrow };
  return { state: 'incorrect', arrow };
}

function exact<T>(guess: T, target: T): CellResult {
  return guess === target
    ? { state: 'correct', arrow: null }
    : { state: 'incorrect', arrow: null };
}

export function compareGuess(guess: Player, target: Player): GuessResult {
  return {
    gender:        exact(guess.gender,        target.gender),
    continent:     exact(guess.continent,     target.continent),
    status:        exact(guess.status,        target.status),
    discipline:    exact(guess.discipline,    target.discipline),
    hand:          exact(guess.hand,          target.hand),
    ageBracket:    ordinal(AGE_ORDER,    guess.ageBracket,    target.ageBracket),
    heightBracket: ordinal(HEIGHT_ORDER, guess.heightBracket, target.heightBracket),
    bestRanking:   ordinal(RANKING_ORDER, guess.bestRanking,  target.bestRanking),
  };
}
