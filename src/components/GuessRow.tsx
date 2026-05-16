import type { Player } from '../types/player.ts';
import type { GuessResult } from '../lib/comparison.ts';
import { AttributeCell, FLAG_URL } from './AttributeCell.tsx';

interface GuessRowProps {
  player: Player;
  result: GuessResult;
  rowIndex: number;
}

const LABELS: { key: keyof GuessResult; label: string }[] = [
  { key: 'gender', label: 'Genre' },
  { key: 'continent', label: 'Continent' },
  { key: 'country', label: 'Pays' },
  { key: 'status', label: 'Statut' },
  { key: 'discipline', label: 'Discipline' },
  { key: 'hand', label: 'Main' },
  { key: 'ageBracket', label: 'Âge' },
  { key: 'heightBracket', label: 'Taille' },
  { key: 'bestRanking', label: 'Classement' },
  { key: 'bestOlympicMedal', label: 'JO' },
  { key: 'majorTitles', label: 'Titres' },
  { key: 'proStartDecade', label: 'Décennie' },
];

function getDisplayValue(player: Player, key: keyof GuessResult): string {
  switch (key) {
    case 'gender': return player.gender === 'H' ? '♂' : '♀';
    case 'country': return player.countryCode;
    default: return String(player[key as keyof Player]);
  }
}

export function GuessRow({ player, result, rowIndex }: GuessRowProps) {
  return (
    <div className="flex gap-1" role="row">
      {/* Sticky player name column */}
      <div className="sticky left-0 z-10 bg-game-bg flex items-center gap-2 min-w-[120px] max-w-[140px] pr-2 flex-shrink-0">
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-game-card">
          {player.imageUrl ? (
            <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover object-top" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-game-muted">
              {player.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-game-text truncate">{player.name}</div>
          <img
            src={FLAG_URL(player.countryCode)}
            alt={player.country}
            className="w-5 h-3 object-cover rounded-sm mt-0.5"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      </div>

      {/* Attribute cells */}
      {LABELS.map(({ key }, i) => (
        <AttributeCell
          key={key}
          value={getDisplayValue(player, key)}
          state={result[key].state}
          arrow={result[key].arrow}
          delay={rowIndex === 0 ? i * 100 : 0}
          revealed
        />
      ))}
    </div>
  );
}
