import type { Language } from '../types/player.ts';
import { t } from '../lib/i18n.ts';
import { LangSwitcher } from './LangSwitcher.tsx';

interface HeaderProps {
  lang: Language;
  onLangChange: (lang: Language) => void;
  onHowToPlay: () => void;
  onStats: () => void;
}

export function Header({ lang, onLangChange, onHowToPlay, onStats }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-court-line bg-court-dark/90 backdrop-blur supports-[backdrop-filter]:bg-court-dark/75 shadow-[0_1px_0_0_rgba(0,0,0,0.4)]">
      <div className="w-[90%] max-w-3xl mx-auto h-16 sm:h-20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onHowToPlay}
            className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full text-shuttle-feather hover:text-shuttle-white hover:bg-court-mid transition-colors text-xl font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-shuttle-feather"
            aria-label={t('header.howToPlay', lang)}
          >
            ?
          </button>
        </div>

        <h1 className="flex items-baseline gap-1.5 font-bold text-3xl sm:text-4xl tracking-[0.18em] text-shuttle-white select-none uppercase leading-none">
          <span className="text-2xl sm:text-3xl" aria-hidden>🏸</span>
          Baddle
        </h1>

        <div className="flex items-center gap-1">
          <LangSwitcher lang={lang} onChange={onLangChange} />
          <button
            type="button"
            onClick={onStats}
            className="w-11 h-11 -mr-2 flex items-center justify-center rounded-full text-shuttle-feather hover:text-shuttle-white hover:bg-court-mid transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-shuttle-feather"
            aria-label={t('header.stats', lang)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="18" y="3" width="4" height="18" rx="1" />
              <rect x="10" y="8" width="4" height="13" rx="1" />
              <rect x="2" y="13" width="4" height="8" rx="1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
