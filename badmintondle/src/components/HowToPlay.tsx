import { useEffect, useState } from 'react';

interface HowToPlayProps {
  onClose: () => void;
}

const EXAMPLES = [
  { label: 'Pays', value: 'Danemark', state: 'correct',   hint: 'Même pays que le joueur mystère' },
  { label: 'Âge',  value: '25-30',    state: 'partial',   hint: 'Tranche adjacente (↑ ou ↓)' },
  { label: 'Main', value: 'Gaucher',  state: 'incorrect', hint: 'Attribut différent' },
] as const;

const STATE_BG: Record<string, string> = {
  correct:   'cell-correct',
  partial:   'cell-partial',
  incorrect: 'cell-incorrect',
};
const STATE_TEXT: Record<string, string> = {
  correct:   'text-green-300',
  partial:   'text-yellow-300',
  incorrect: 'text-slate-400',
};
const STATE_ICON: Record<string, string> = {
  correct: '✓', partial: '~', incorrect: '✗',
};

export default function HowToPlay({ onClose }: HowToPlayProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t); }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Comment jouer"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(6,9,26,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`bg-game-card border border-game-border rounded-card w-full max-w-sm shadow-card-float overflow-y-auto max-h-[90vh] transition-all duration-300 ${visible ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}`}
      >
        {/* Top accent */}
        <div className="h-[3px] bg-gradient-to-r from-game-partial via-yellow-300 to-transparent" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl uppercase tracking-wide text-game-text">Comment jouer</h2>
            <button onClick={onClose} aria-label="Fermer"
              className="w-8 h-8 rounded-full flex items-center justify-center text-game-muted hover:text-game-text hover:bg-game-border transition-all">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
              </svg>
            </button>
          </div>

          <p className="text-sm text-game-muted mb-5 leading-relaxed">
            Devine le joueur mystère parmi <span className="text-game-text font-semibold">50 légendes</span> du badminton.
            Chaque tentative révèle des indices sur <span className="text-game-text font-semibold">12 attributs</span>.
          </p>

          {/* Cell examples */}
          <p className="text-[10px] font-display font-bold uppercase tracking-widest text-game-muted mb-3">Code couleur</p>
          <div className="flex flex-col gap-2.5 mb-6">
            {EXAMPLES.map(({ label, value, state, hint }) => (
              <div key={state} className="flex items-center gap-3">
                <div className={`${STATE_BG[state]} rounded-cell flex flex-col items-center justify-between w-[68px] h-[64px] py-1.5 px-1 shrink-0`}>
                  <span className={`text-[9px] font-display font-semibold uppercase tracking-widest ${STATE_TEXT[state]}`}>{label}</span>
                  <span className="font-display font-bold text-white text-xs">{value}</span>
                  <span className={`text-[10px] font-mono font-semibold ${STATE_TEXT[state]}`}>{STATE_ICON[state]}</span>
                </div>
                <p className="text-sm text-game-muted leading-snug">{hint}</p>
              </div>
            ))}
          </div>

          {/* Attributes list */}
          <p className="text-[10px] font-display font-bold uppercase tracking-widest text-game-muted mb-3">12 attributs comparés</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-5">
            {[
              'Genre (H/F)',
              'Continent',
              'Pays 🟧 si même continent',
              'Statut actif/retraité',
              'Discipline',
              'Main dominante',
              'Tranche d\'âge ↑↓',
              'Tranche de taille ↑↓',
              'Meilleur classement ↑↓',
              'Médaille olympique ↑↓',
              'Titres majeurs ↑↓',
              'Début professionnel ↑↓',
            ].map((attr) => (
              <p key={attr} className="text-xs text-game-muted flex items-start gap-1.5">
                <span className="text-game-border mt-0.5">·</span>
                {attr}
              </p>
            ))}
          </div>

          <p className="text-xs text-game-muted/70 border-t border-game-border pt-4">
            Nouveau joueur mystère chaque jour à minuit. Partie sauvegardée dans ton navigateur.
          </p>
        </div>
      </div>
    </div>
  );
}
