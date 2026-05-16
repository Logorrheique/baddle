interface HeaderProps {
  onHowToPlay: () => void;
  onStats: () => void;
}

export function Header({ onHowToPlay, onStats }: HeaderProps) {
  return (
    <header className="border-b border-game-border bg-game-card">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={onHowToPlay}
          className="text-game-muted hover:text-game-text transition-colors text-sm font-medium"
          aria-label="Comment jouer"
        >
          ?
        </button>
        <h1 className="text-2xl font-bold tracking-widest text-game-text select-none">
          BADDLE
        </h1>
        <button
          onClick={onStats}
          className="text-game-muted hover:text-game-text transition-colors"
          aria-label="Statistiques"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="18" y="3" width="4" height="18" rx="1" />
            <rect x="10" y="8" width="4" height="13" rx="1" />
            <rect x="2" y="13" width="4" height="8" rx="1" />
          </svg>
        </button>
      </div>
    </header>
  );
}
