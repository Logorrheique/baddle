import type { GuessResult, CellState } from './comparison.ts';

const EMOJI: Record<CellState, string> = {
  correct: '🟩',
  partial: '🟧',
  incorrect: '⬛',
};

const ATTRIBUTE_ORDER = [
  'gender', 'continent', 'country', 'status', 'discipline', 'hand',
  'ageBracket', 'heightBracket', 'bestRanking', 'bestOlympicMedal', 'majorTitles', 'proStartDecade',
] as const;

export function buildShareText(
  puzzleNumber: number,
  guessResults: GuessResult[],
): string {
  const guessCount = guessResults.length;
  const rows = guessResults.map(result =>
    ATTRIBUTE_ORDER.map(attr => EMOJI[result[attr as keyof GuessResult].state]).join(''),
  );

  return [
    `Baddle #${puzzleNumber} — ${guessCount}/∞`,
    '',
    ...rows,
    '',
    'https://baddle.app',
  ].join('\n');
}
