import type { GameMode, Language } from '../types/player.ts';
import { t } from '../lib/i18n.ts';

interface ModeSwitcherProps {
  mode: GameMode;
  lang: Language;
  onChange: (mode: GameMode) => void;
}

const MODES: { id: GameMode; flag: string; labelKey: string }[] = [
  { id: 'intl', flag: '🌍', labelKey: 'mode.intl' },
  { id: 'fr',   flag: '🇫🇷', labelKey: 'mode.fr' },
];

export function ModeSwitcher({ mode, lang, onChange }: ModeSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label={t('mode.intl', lang) + ' / ' + t('mode.fr', lang)}
      className="inline-flex bg-court-mid border border-court-line rounded-full p-1 gap-1"
    >
      {MODES.map(m => {
        const active = m.id === mode;
        return (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors min-h-[36px] ${
              active
                ? 'bg-shuttle-white text-court-dark'
                : 'text-shuttle-feather hover:text-shuttle-white'
            }`}
          >
            <span aria-hidden>{m.flag}</span>
            <span>{t(m.labelKey, lang)}</span>
          </button>
        );
      })}
    </div>
  );
}
