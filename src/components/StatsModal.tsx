import type { UserStats } from '../lib/storage.ts';

interface StatsModalProps {
  stats: UserStats;
  onClose: () => void;
}

export function StatsModal({ stats, onClose }: StatsModalProps) {
  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const maxDist = Math.max(1, ...Object.values(stats.guessDistribution));

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-game-card rounded-card p-6 max-w-sm w-full shadow-2xl border border-game-border"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-game-text text-center mb-4">Statistiques</h2>

        <div className="grid grid-cols-4 gap-3 mb-6 text-center">
          {[
            { label: 'Parties', value: stats.played },
            { label: 'Victoires', value: `${winRate}%` },
            { label: 'Série', value: stats.currentStreak },
            { label: 'Record', value: stats.maxStreak },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-2xl font-bold font-mono text-game-text">{value}</div>
              <div className="text-[10px] text-game-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {Object.keys(stats.guessDistribution).length > 0 && (
          <>
            <h3 className="text-xs font-semibold text-game-muted uppercase tracking-wider mb-3">
              Distribution
            </h3>
            <div className="space-y-1.5 mb-6">
              {[1, 2, 3, 4, 5, 6].map(n => {
                const count = stats.guessDistribution[n] ?? 0;
                const width = Math.max(4, Math.round((count / maxDist) * 100));
                return (
                  <div key={n} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-game-muted w-3">{n}</span>
                    <div
                      className="bg-game-correct h-5 rounded-sm flex items-center justify-end pr-1.5 transition-all"
                      style={{ width: `${width}%` }}
                    >
                      <span className="text-[10px] font-bold text-white">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 rounded-card border border-game-border text-game-muted hover:text-game-text hover:border-game-text transition-colors text-sm"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
