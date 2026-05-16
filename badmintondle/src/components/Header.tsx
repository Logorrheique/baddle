interface HeaderProps {
  onStats: () => void;
  onHowToPlay: () => void;
  dayNumber: number;
}

export default function Header({ onStats, onHowToPlay, dayNumber }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-game-bg border-b border-game-border">
      <div className="max-w-3xl mx-auto flex items-center justify-between px-4 h-14">

        {/* Title */}
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 28" fill="none" className="w-6 h-6 shrink-0" aria-hidden="true">
            <circle cx="12" cy="21" r="5" fill="#22c55e" />
            <line x1="12" y1="16" x2="7"  y2="2" stroke="#4d7a49" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="12" y1="16" x2="10" y2="1" stroke="#4d7a49" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="12" y1="16" x2="12" y2="1" stroke="#4d7a49" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="12" y1="16" x2="14" y2="1" stroke="#4d7a49" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="12" y1="16" x2="17" y2="2" stroke="#4d7a49" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M7 2 Q12 6 17 2" stroke="#4d7a49" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          </svg>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-game-text">Badmintondle</span>
            <span className="font-mono text-xs text-game-muted">#{dayNumber}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onHowToPlay}
            aria-label="Comment jouer"
            className="px-3 py-2 rounded-md text-game-muted hover:text-game-text hover:bg-game-card text-sm font-medium transition-colors"
          >
            Règles
          </button>
          <button
            onClick={onStats}
            aria-label="Mes statistiques"
            className="px-3 py-2 rounded-md text-game-muted hover:text-game-text hover:bg-game-card text-sm font-medium transition-colors"
          >
            Stats
          </button>
        </div>
      </div>
    </header>
  );
}
