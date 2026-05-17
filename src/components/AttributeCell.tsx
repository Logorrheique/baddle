import type { CellState, Arrow } from '../lib/comparison.ts';

export const FLAG_URL = (code: string) =>
  `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

interface AttributeCellProps {
  value: string;
  state: CellState;
  arrow?: Arrow;
  delay?: number;
  label?: string;
}

const BG: Record<CellState, string> = {
  correct:   'bg-ace-green',
  partial:   'bg-racket-orange',
  incorrect: 'bg-miss-grey',
};

export function AttributeCell({ value, state, arrow, delay = 0, label }: AttributeCellProps) {
  const arrowLabel = arrow === 'up' ? ', plus grand' : arrow === 'down' ? ', plus petit' : '';
  return (
    <div
      className={`${BG[state]} aspect-square flex items-center justify-center rounded-cell px-1 select-none border-2 border-white/10 ${delay > 0 ? 'animate-flip' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
      role="cell"
      title={label ? `${label} : ${value}` : value}
      aria-label={`${label ? label + ' : ' : ''}${value} — ${state}${arrowLabel}`}
    >
      <span className="flex items-center gap-0.5 text-white font-bold text-[11px] sm:text-sm text-center leading-tight uppercase tracking-wide">
        {arrow === 'up'   && <span aria-hidden>↑</span>}
        {arrow === 'down' && <span aria-hidden>↓</span>}
        <span className="break-words max-w-full">{value}</span>
      </span>
    </div>
  );
}
