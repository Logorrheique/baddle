import { useEffect, useState } from 'react';
import type { UserStats } from '../lib/storage';

interface StatsModalProps {
  stats: UserStats;
  onClose: () => void;
}

export default function StatsModal({ stats, onClose }: StatsModalProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t); }, []);

  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const distEntries = Object.entries(stats.guessDistribution)
    .map(([k, v]) => ({ n: Number(k), count: v }))
    .sort((a, b) => a.n - b.n);
  const maxCount = Math.max(1, ...distEntries.map((e) => e.count));

  const summaryItems = [
    { label: 'Joué',      value: stats.played     },
    { label: 'Victoires', value: `${winRate}%`    },
    { label: 'Série',     value: stats.currentStreak },
    { label: 'Record',    value: stats.maxStreak  },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Statistiques"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(6,9,26,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`bg-game-card border border-game-border rounded-card w-full max-w-sm shadow-card-float transition-all duration-300 overflow-hidden ${visible ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}`}
      >
        {/* Top accent */}
        <div className="h-[3px] bg-gradient-to-r from-game-accent via-blue-400 to-transparent" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-xl uppercase tracking-wide text-game-text">
              Statistiques
            </h2>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="w-8 h-8 rounded-full flex items-center justify-center text-game-muted hover:text-game-text hover:bg-game-border transition-all"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
              </svg>
            </button>
          </div>

          {/* Summary grid */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {summaryItems.map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center bg-game-bg border border-game-border rounded-cell py-3 px-1">
                <span className="font-mono font-bold text-2xl text-game-text leading-none">{value}</span>
                <span className="text-[9px] font-display font-semibold uppercase tracking-widest text-game-muted text-center mt-1.5 leading-tight">{label}</span>
              </div>
            ))}
          </div>

          {/* Distribution */}
          <p className="text-[10px] font-display font-bold uppercase tracking-widest text-game-muted mb-3">
            Distribution des victoires
          </p>

          {distEntries.length === 0 ? (
            <p className="text-game-muted text-sm text-center py-4">Aucune victoire pour l'instant.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {distEntries.map(({ n, count }) => (
                <div key={n} className="flex items-center gap-2">
                  <span className="font-mono text-sm text-game-muted w-4 text-right shrink-0">{n}</span>
                  <div className="flex-1 h-7 bg-game-bg rounded overflow-hidden border border-game-border/50">
                    <div
                      className="h-full rounded flex items-center justify-end pr-2 transition-all duration-700"
                      style={{
                        width: `${Math.max(12, Math.round((count / maxCount) * 100))}%`,
                        background: 'linear-gradient(90deg, #166534 0%, #22c55e 100%)',
                      }}
                    >
                      <span className="font-mono text-xs text-white font-bold">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
