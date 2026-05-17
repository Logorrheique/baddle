import type { Language } from '../types/player.ts';

interface LangSwitcherProps {
  lang: Language;
  onChange: (lang: Language) => void;
}

export function LangSwitcher({ lang, onChange }: LangSwitcherProps) {
  const next: Language = lang === 'fr' ? 'en' : 'fr';
  return (
    <button
      type="button"
      onClick={() => onChange(next)}
      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-shuttle-feather hover:text-shuttle-white hover:bg-court-mid transition-colors text-xs font-bold uppercase tracking-wider"
      aria-label={`Switch to ${next === 'en' ? 'English' : 'Français'}`}
    >
      {lang.toUpperCase()}
    </button>
  );
}
