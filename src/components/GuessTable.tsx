import type { Player } from '../types/player.ts';
import type { GuessResult } from '../lib/comparison.ts';
import { GuessRow } from './GuessRow.tsx';

const COLUMN_HEADERS = [
  'Genre', 'Continent', 'Pays', 'Statut', 'Discipline',
  'Main', 'Âge', 'Taille', 'Classement', 'Médaille JO',
  'Titres', 'Décennie',
];

interface GuessTableProps {
  guesses: Player[];
  results: GuessResult[];
}

export function GuessTable({ guesses, results }: GuessTableProps) {
  if (guesses.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="min-w-max">
        {/* Column headers */}
        <div className="flex gap-1 mb-1">
          <div className="min-w-[120px] max-w-[140px] flex-shrink-0" />
          {COLUMN_HEADERS.map(h => (
            <div
              key={h}
              className="min-w-[60px] text-center text-[10px] text-game-muted font-medium px-1"
            >
              {h}
            </div>
          ))}
        </div>
        {/* Rows — most recent first */}
        <div className="flex flex-col gap-1">
          {[...guesses].reverse().map((player, i) => (
            <GuessRow
              key={player.id}
              player={player}
              result={results[guesses.length - 1 - i]}
              rowIndex={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
