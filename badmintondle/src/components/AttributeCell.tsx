import { useEffect, useRef, useState } from 'react';
import type { CellResult } from '../lib/comparison';

interface AttributeCellProps {
  result: CellResult;
  label: string;
  delay?: number;
}

const REVEALED_BG: Record<string, string> = {
  correct:   '#14532d',
  partial:   '#78350f',
  incorrect: '#1a2e1a',
};

const REVEALED_TEXT: Record<string, string> = {
  correct:   '#86efac',
  partial:   '#fcd34d',
  incorrect: '#4d7a49',
};

export default function AttributeCell({ result, label, delay = 0 }: AttributeCellProps) {
  const [shown, setShown] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timer.current = setTimeout(() => setShown(true), delay);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [delay]);

  const arrowIcon = result.arrow === 'up' ? '↑' : result.arrow === 'down' ? '↓' : null;

  return (
    <div
      role="cell"
      aria-label={`${label}: ${result.value} — ${result.state}${result.arrow ? ' ' + result.arrow : ''}`}
      className="flex flex-col items-center justify-between rounded-cell select-none min-w-[56px] md:min-w-[68px] h-[68px] md:h-[76px] px-1 py-1.5 border transition-colors duration-200"
      style={{
        backgroundColor: shown ? REVEALED_BG[result.state] : undefined,
        borderColor: shown ? 'transparent' : undefined,
      }}
    >
      {/* Label */}
      <span
        className="text-[9px] font-semibold uppercase tracking-wider leading-none text-center"
        style={{ color: shown ? REVEALED_TEXT[result.state] : '#4d7a49' }}
      >
        {label}
      </span>

      {/* Value */}
      <span
        className="font-semibold leading-none text-center transition-opacity duration-150 px-0.5"
        style={{
          fontSize: result.value.length > 8 ? '10px' : result.value.length > 5 ? '11px' : '13px',
          color: shown ? '#ffffff' : 'transparent',
          opacity: shown ? 1 : 0,
        }}
      >
        {result.value}
      </span>

      {/* Indicator */}
      <span
        className="text-[10px] font-mono leading-none transition-opacity duration-150"
        style={{
          color: shown ? REVEALED_TEXT[result.state] : 'transparent',
          opacity: shown ? 1 : 0,
        }}
      >
        {arrowIcon ?? (result.state === 'correct' ? '✓' : result.state === 'partial' ? '~' : '✗')}
      </span>
    </div>
  );
}
