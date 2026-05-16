import type { GuessEntry } from '../hooks/useGameState';
import GuessRow from './GuessRow';

const HEADERS = ['Genre','Cont.','Pays','Statut','Discip.','Main','Âge','Taille','Rank','Médail.','Titres','Début'];

interface GuessTableProps {
  guesses: GuessEntry[];
}

export default function GuessTable({ guesses }: GuessTableProps) {
  if (guesses.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto scrollbar-thin" role="table" aria-label="Tentatives">
      {/* Header */}
      <div className="flex items-center gap-1 md:gap-1.5 pb-2 border-b border-game-border min-w-max">
        <div className="min-w-[122px] md:min-w-[146px] shrink-0" />
        {HEADERS.map((h) => (
          <div
            key={h}
            role="columnheader"
            className="min-w-[56px] md:min-w-[68px] text-center text-[10px] font-semibold uppercase tracking-wider text-game-muted py-1"
          >
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-1.5 pt-2 min-w-max">
        {guesses.map((entry, i) => (
          <GuessRow
            key={entry.player.id}
            player={entry.player}
            results={entry.results}
            rowIndex={i}
          />
        ))}
      </div>
    </div>
  );
}
