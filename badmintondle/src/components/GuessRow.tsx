import type { Player } from '../types/player';
import type { CellResult } from '../lib/comparison';
import AttributeCell from './AttributeCell';

interface GuessRowProps {
  player: Player;
  results: Record<string, CellResult>;
  rowIndex: number;
}

const COLUMNS: { key: keyof Player; label: string }[] = [
  { key: 'gender',           label: 'Genre'   },
  { key: 'continent',        label: 'Cont.'   },
  { key: 'country',          label: 'Pays'    },
  { key: 'status',           label: 'Statut'  },
  { key: 'discipline',       label: 'Discip.' },
  { key: 'hand',             label: 'Main'    },
  { key: 'ageBracket',       label: 'Âge'     },
  { key: 'heightBracket',    label: 'Taille'  },
  { key: 'bestRanking',      label: 'Rank'    },
  { key: 'bestOlympicMedal', label: 'Médail.' },
  { key: 'majorTitles',      label: 'Titres'  },
  { key: 'proStartDecade',   label: 'Début'   },
];

function Avatar({ player }: { player: Player }) {
  const initials = player.name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  if (player.imageUrl) {
    return (
      <img src={player.imageUrl} alt={player.name} className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-game-border" />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-game-border shrink-0 flex items-center justify-center text-xs font-bold text-game-muted">
      {initials}
    </div>
  );
}

export default function GuessRow({ player, results, rowIndex }: GuessRowProps) {
  return (
    <div
      role="row"
      className="flex items-center gap-1 md:gap-1.5 animate-row-in"
      style={{ animationDelay: `${rowIndex * 15}ms` }}
    >
      {/* Player info — sticky */}
      <div
        role="rowheader"
        className="sticky left-0 z-10 flex items-center gap-2 min-w-[122px] md:min-w-[146px] pr-2.5 border-r border-game-border bg-game-bg shrink-0"
      >
        <Avatar player={player} />
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-game-text truncate max-w-[72px] md:max-w-[88px] leading-tight">
            {player.name}
          </span>
          <span className="font-mono text-[10px] text-game-muted mt-0.5">{player.countryCode}</span>
        </div>
      </div>

      {/* Cells */}
      {COLUMNS.map((col, i) => (
        <AttributeCell
          key={col.key}
          result={results[col.key]}
          label={col.label}
          delay={i * 90}
        />
      ))}
    </div>
  );
}
