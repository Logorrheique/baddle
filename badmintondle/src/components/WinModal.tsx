import { useState, useEffect } from 'react';
import type { Player } from '../types/player';
import type { CellResult } from '../lib/comparison';
import { generateShareText, copyToClipboard } from '../lib/share';

interface WinModalProps {
  player: Player;
  guessCount: number;
  dayNumber: number;
  guessResults: Record<string, CellResult>[];
  onStats: () => void;
  onClose: () => void;
}

function Countdown() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    function tick() {
      const now = new Date();
      const next = new Date(now);
      next.setDate(next.getDate() + 1);
      next.setHours(0, 0, 0, 0);
      const diff = next.getTime() - now.getTime();
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="text-center">
      <p className="text-[11px] font-display font-semibold uppercase tracking-widest text-game-muted mb-1.5">
        Prochain joueur dans
      </p>
      <div className="flex items-center justify-center gap-1 font-mono">
        {[time.h, time.m, time.s].map((v, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="bg-game-card2 border border-game-border rounded px-2.5 py-1.5 text-xl font-bold text-game-text tabular-nums">
              {pad(v)}
            </span>
            {i < 2 && <span className="text-game-muted font-bold text-lg">:</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function WinModal({
  player,
  guessCount,
  dayNumber,
  guessResults,
  onStats,
  onClose,
}: WinModalProps) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  async function handleShare() {
    const text = generateShareText(dayNumber, guessResults);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Victoire"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(6,9,26,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`bg-game-card border border-game-border rounded-card w-full max-w-sm overflow-hidden shadow-card-float transition-all duration-300 ${visible ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}`}
      >
        {/* Top accent */}
        <div className="h-[3px] bg-gradient-to-r from-game-correct via-green-400 to-transparent" />

        <div className="p-6">
          {/* Win heading */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-game-correct/10 border border-game-correct/30 mb-3">
              <span className="font-display font-bold text-3xl text-game-correct">{guessCount}</span>
            </div>
            <h2 className="font-display font-bold text-2xl uppercase tracking-wide text-game-text">Bravo !</h2>
            <p className="text-game-muted text-sm mt-1">
              Trouvé en <span className="text-game-correct font-semibold">{guessCount}</span> tentative{guessCount > 1 ? 's' : ''}
            </p>
          </div>

          {/* Player card */}
          <div className="flex items-center gap-4 bg-game-bg rounded-cell p-4 mb-6 border border-game-border">
            {player.imageUrl ? (
              <img
                src={player.imageUrl}
                alt={player.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-game-correct/50 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-game-card2 ring-2 ring-game-correct/50 flex items-center justify-center font-display font-bold text-xl text-game-correct shrink-0">
                {player.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-display font-bold text-lg text-game-text leading-tight">{player.name}</p>
              <p className="text-xs text-game-muted mt-0.5">{player.country} · {player.discipline}</p>
              <p className="text-xs text-game-muted">{player.status} · {player.bestRanking}</p>
            </div>
          </div>

          {/* Countdown */}
          <Countdown />

          {/* Actions */}
          <div className="flex flex-col gap-2.5 mt-5">
            <button
              onClick={handleShare}
              aria-label="Partager mon résultat"
              className="w-full py-3 rounded-cell font-display font-bold uppercase tracking-wide text-sm transition-all bg-game-correct/10 border border-game-correct/40 text-game-correct hover:bg-game-correct/20 hover:shadow-glow-sm-green"
            >
              {copied ? '✓  Copié dans le presse-papier !' : '  Partager mon résultat'}
            </button>
            <button
              onClick={onStats}
              aria-label="Voir mes statistiques"
              className="w-full py-3 rounded-cell font-display font-semibold uppercase tracking-wide text-sm text-game-muted border border-game-border hover:border-game-card2 hover:text-game-text transition-all"
            >
              Voir mes stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
