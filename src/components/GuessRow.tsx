import type { Player, Language } from '../types/player.ts';
import type { GuessResult } from '../lib/comparison.ts';
import { AttributeCell, FLAG_URL } from './AttributeCell.tsx';
import { displayCellValue, t } from '../lib/i18n.ts';

interface GuessRowProps {
  player: Player;
  result: GuessResult;
  rowIndex: number;
  lang: Language;
  isWinningRow?: boolean;
}

export const COLUMNS: { key: keyof GuessResult; labelKey: string; shortKey: string }[] = [
  { key: 'gender',        labelKey: 'col.gender',     shortKey: 'col.gender.short' },
  { key: 'continent',     labelKey: 'col.continent',  shortKey: 'col.continent.short' },
  { key: 'status',        labelKey: 'col.status',     shortKey: 'col.status.short' },
  { key: 'discipline',    labelKey: 'col.discipline', shortKey: 'col.discipline.short' },
  { key: 'hand',          labelKey: 'col.hand',       shortKey: 'col.hand.short' },
  { key: 'ageBracket',    labelKey: 'col.age',        shortKey: 'col.age.short' },
  { key: 'heightBracket', labelKey: 'col.height',     shortKey: 'col.height.short' },
  { key: 'bestRanking',   labelKey: 'col.ranking',    shortKey: 'col.ranking.short' },
];

function rawValue(player: Player, key: keyof GuessResult): string {
  return String(player[key as keyof Player]);
}

/**
 * Format player name as "F.LASTNAME" (first initial + uppercase last name).
 * Truncates with … if longer than maxLen.
 */
export function shortPlayerName(name: string, maxLen = 10): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) {
    const w = parts[0].toUpperCase();
    return w.length > maxLen ? w.slice(0, maxLen - 1) + '…' : w;
  }
  const first = parts[0][0]?.toUpperCase() ?? '';
  const last  = parts[parts.length - 1].toUpperCase();
  const formatted = `${first}.${last}`;
  return formatted.length > maxLen ? formatted.slice(0, maxLen - 1) + '…' : formatted;
}

export function GuessRow({ player, result, rowIndex, lang, isWinningRow }: GuessRowProps) {
  return (
    <>
      <div
        className={`sticky left-0 z-10 bg-court-mid aspect-square rounded-cell border-2 border-white/10 overflow-hidden relative ${isWinningRow ? 'animate-celebrate' : ''}`}
        title={player.name}
      >
        {player.imageUrl ? (
          <img src={player.imageUrl} alt={player.name} className="absolute inset-0 w-full h-full object-cover object-top" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-base font-bold text-shuttle-feather">
            {player.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
        )}
        {/* Country flag — top-right */}
        <img
          src={FLAG_URL(player.countryCode)}
          alt={player.country}
          className="absolute top-1 right-1 w-5 h-3.5 sm:w-6 sm:h-4 object-cover rounded-[2px] ring-1 ring-black/50"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        {/* Name label — bottom overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-black/65 text-white text-[10px] sm:text-xs font-bold text-center py-0.5 leading-tight uppercase tracking-wider">
          {shortPlayerName(player.name)}
        </div>
      </div>
      {COLUMNS.map(({ key }, i) => (
        <AttributeCell
          key={key}
          value={displayCellValue(key, rawValue(player, key), player, lang)}
          state={result[key].state}
          arrow={result[key].arrow}
          delay={rowIndex === 0 ? i * 80 : 0}
          label={t(COLUMNS[i].labelKey, lang)}
        />
      ))}
    </>
  );
}
