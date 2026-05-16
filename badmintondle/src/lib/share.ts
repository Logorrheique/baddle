import type { CellResult } from './comparison';

const EMOJI = {
  correct: '🟩',
  partial: '🟧',
  incorrect: '🟥',
} as const;

const GAME_ATTRIBUTES = [
  'gender',
  'continent',
  'country',
  'status',
  'discipline',
  'hand',
  'ageBracket',
  'heightBracket',
  'bestRanking',
  'bestOlympicMedal',
  'majorTitles',
  'proStartDecade',
] as const;

export function generateShareText(
  dayNumber: number,
  guessResults: Record<string, CellResult>[]
): string {
  const lines = guessResults.map((row) =>
    GAME_ATTRIBUTES.map((attr) => EMOJI[row[attr].state]).join('')
  );
  return [
    `Badmintondle #${dayNumber} — ${guessResults.length}/∞`,
    ...lines,
    'https://badmintondle.vercel.app',
  ].join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
