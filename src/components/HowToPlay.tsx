import type { Language } from '../types/player.ts';
import { useEscapeKey } from '../hooks/useEscapeKey.ts';
import { t } from '../lib/i18n.ts';

interface HowToPlayProps {
  onClose: () => void;
  lang: Language;
}

export function HowToPlay({ onClose, lang }: HowToPlayProps) {
  useEscapeKey(onClose);
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="howto-title">
      <div
        className="bg-court-dark rounded-card p-6 max-w-sm w-full shadow-2xl border border-court-line max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="howto-title" className="text-lg font-bold text-shuttle-white text-center uppercase tracking-widest mb-4">
          {t('how.title', lang)}
        </h2>
        <div className="space-y-3 text-sm text-shuttle-feather mb-5">
          <p>{t('how.intro', lang, t('how.player', lang))}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-cell bg-ace-green inline-flex items-center justify-center text-white text-xs flex-shrink-0 font-bold">✓</span>
              <span>{t('how.green', lang)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-cell bg-racket-orange inline-flex items-center justify-center text-white text-xs flex-shrink-0 font-bold">~</span>
              <span>{t('how.orange', lang)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-cell bg-miss-grey inline-flex items-center justify-center text-white text-xs flex-shrink-0 font-bold">✗</span>
              <span>{t('how.grey', lang)}</span>
            </div>
          </div>
          <p>{t('how.arrows', lang)}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-card bg-shuttle-white text-court-dark font-bold uppercase tracking-wider hover:opacity-90 transition-opacity text-sm"
        >
          {t('how.cta', lang)}
        </button>
      </div>
    </div>
  );
}
