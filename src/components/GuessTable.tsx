import type { Player, Language } from '../types/player.ts';
import type { GuessResult } from '../lib/comparison.ts';
import { GuessRow, COLUMNS } from './GuessRow.tsx';
import { t } from '../lib/i18n.ts';

interface GuessTableProps {
  guesses: Player[];
  results: GuessResult[];
  lang: Language;
  winningId?: string;
}

export function GuessTable({ guesses, results, lang, winningId }: GuessTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="guess-grid" role="grid" aria-label="Guess table">
        <div className="sticky left-0 z-10 bg-court-dark" aria-hidden="true" />
        {COLUMNS.map(({ key, labelKey, shortKey }) => (
          <div
            key={key}
            className="flex items-end justify-center pb-1 text-[10px] sm:text-xs font-semibold text-shuttle-feather uppercase tracking-wide text-center leading-tight"
            role="columnheader"
            title={t(labelKey, lang)}
          >
            <span className="sm:hidden">{t(shortKey, lang)}</span>
            <span className="hidden sm:inline">{t(labelKey, lang)}</span>
          </div>
        ))}

        {[...guesses].reverse().map((player, i) => (
          <GuessRow
            key={player.id}
            player={player}
            result={results[guesses.length - 1 - i]}
            rowIndex={i}
            lang={lang}
            isWinningRow={i === 0 && player.id === winningId}
          />
        ))}
      </div>
    </div>
  );
}
