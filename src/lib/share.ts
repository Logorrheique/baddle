import type { GuessResult, CellState } from './comparison.ts';

const EMOJI: Record<CellState, string> = {
  correct: '🟩',
  partial: '🟧',
  incorrect: '⬛',
};

const ATTRIBUTE_ORDER: (keyof GuessResult)[] = [
  'gender', 'country', 'status', 'discipline', 'hand',
  'ageBracket', 'heightBracket', 'bestRanking',
];

export function buildShareText(puzzleNumber: number, guessResults: GuessResult[]): string {
  const rows = guessResults.map(result =>
    ATTRIBUTE_ORDER.map(attr => EMOJI[result[attr].state]).join(''),
  );
  return [
    `Baddle #${puzzleNumber} — ${guessResults.length}/∞`,
    '',
    ...rows,
    '',
    'https://baddle.app',
  ].join('\n');
}
