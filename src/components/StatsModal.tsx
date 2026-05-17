import type { UserStats } from '../lib/storage.ts';
import type { Language } from '../types/player.ts';
import { useEscapeKey } from '../hooks/useEscapeKey.ts';
import { t } from '../lib/i18n.ts';

interface StatsModalProps {
  stats: UserStats;
  onClose: () => void;
  lang: Language;
}

export function StatsModal({ stats, onClose, lang }: StatsModalProps) {
  useEscapeKey(onClose);
  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const maxDist = Math.max(1, ...Object.values(stats.guessDistribution));

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="stats-title">
      <div
        className="bg-court-dark rounded-card p-6 max-w-sm w-full shadow-2xl border border-court-line max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="stats-title" className="text-lg font-bold text-shuttle-white text-center uppercase tracking-widest mb-4">
          {t('stats.title', lang)}
        </h2>

        <div className="grid grid-cols-4 gap-3 mb-6 text-center">
          {[
            { labelKey: 'stats.played',    value: stats.played },
            { labelKey: 'stats.wins',      value: `${winRate}%` },
            { labelKey: 'stats.streak',    value: stats.currentStreak },
            { labelKey: 'stats.maxStreak', value: stats.maxStreak },
          ].map(({ labelKey, value }) => (
            <div key={labelKey}>
              <div className="text-3xl font-bold text-shuttle-white">{value}</div>
              <div className="text-[10px] text-shuttle-feather mt-0.5 uppercase tracking-wide">{t(labelKey, lang)}</div>
            </div>
          ))}
        </div>

        {Object.keys(stats.guessDistribution).length > 0 && (
          <>
            <p className="text-[10px] text-shuttle-feather uppercase tracking-widest mb-2">{t('stats.distribution', lang)}</p>
            <div className="space-y-1.5 mb-6">
              {[1, 2, 3, 4, 5, 6].map(n => {
                const count = stats.guessDistribution[n] ?? 0;
                const width = Math.max(4, Math.round((count / maxDist) * 100));
                return (
                  <div key={n} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-shuttle-feather w-3">{n}</span>
                    <div className="flex-1 bg-court-surface rounded-sm overflow-hidden">
                      <div
                        className="bg-ace-green h-5 rounded-sm flex items-center justify-end pr-1.5"
                        style={{ width: `${width}%` }}
                      >
                        <span className="text-[10px] font-bold text-white">{count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-card border border-court-line text-shuttle-feather hover:text-shuttle-white hover:border-shuttle-feather transition-colors text-sm font-medium uppercase tracking-wider"
        >
          {t('stats.close', lang)}
        </button>
      </div>
    </div>
  );
}
