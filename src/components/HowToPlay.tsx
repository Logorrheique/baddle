interface HowToPlayProps {
  onClose: () => void;
}

export function HowToPlay({ onClose }: HowToPlayProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-game-card rounded-card p-6 max-w-sm w-full shadow-2xl border border-game-border"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-game-text text-center mb-4">Comment jouer</h2>
        <div className="space-y-3 text-sm text-game-muted mb-5">
          <p>
            Devine le <span className="text-game-text font-semibold">joueur ou la joueuse de badminton</span> mystère
            parmi 50 légendes du sport.
          </p>
          <p>Chaque essai révèle des indices sur 12 attributs :</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-cell bg-game-correct inline-flex items-center justify-center text-white text-xs flex-shrink-0">✓</span>
              <span><span className="text-game-text">Vert</span> — attribut identique</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-cell bg-game-partial inline-flex items-center justify-center text-white text-xs flex-shrink-0">~</span>
              <span><span className="text-game-text">Orange</span> — proche (même continent, palier adjacent)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-cell bg-game-incorrect inline-flex items-center justify-center text-white text-xs flex-shrink-0">✗</span>
              <span><span className="text-game-text">Gris</span> — incorrect</span>
            </div>
          </div>
          <p>
            Les flèches <span className="text-white">⬆️ ⬇️</span> indiquent si la valeur cible est
            plus grande ou plus petite pour les attributs numériques.
          </p>
          <p>Un nouveau joueur est proposé chaque jour à minuit.</p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2 rounded-card bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors text-sm"
        >
          Jouer
        </button>
      </div>
    </div>
  );
}
