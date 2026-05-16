import type { CellState, Arrow } from '../lib/comparison.ts';

export const FLAG_URL = (code: string) =>
  `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

interface AttributeCellProps {
  value: string;
  state: CellState;
  arrow?: Arrow;
  delay?: number;
  revealed?: boolean;
}

const BG: Record<CellState, string> = {
  correct: 'bg-game-correct',
  partial: 'bg-game-partial',
  incorrect: 'bg-game-incorrect',
};

const ARIA_LABEL: Record<CellState, string> = {
  correct: 'correct',
  partial: 'proche',
  incorrect: 'incorrect',
};

export function AttributeCell({ value, state, arrow, delay = 0, revealed = true }: AttributeCellProps) {
  return (
    <div
      className={`
        relative flex items-center justify-center min-w-[60px] h-12 px-1
        rounded-cell text-xs font-semibold text-white text-center leading-tight
        transition-all duration-300 select-none
        ${revealed ? BG[state] : 'bg-game-card border border-game-border'}
      `}
      style={{ transitionDelay: `${delay}ms` }}
      aria-label={`${value} — ${revealed ? ARIA_LABEL[state] : 'non révélé'}`}
      role="cell"
    >
      <span className="break-words max-w-full px-1">{value}</span>
      {revealed && arrow && (
        <span
          className="absolute -right-1 -top-1 text-base leading-none"
          aria-label={arrow === 'up' ? 'plus grand' : 'plus petit'}
        >
          {arrow === 'up' ? '⬆️' : '⬇️'}
        </span>
      )}
    </div>
  );
}
