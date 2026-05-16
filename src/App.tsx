import { useMemo, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Header } from './components/Header.tsx';
import { ModeSwitcher } from './components/ModeSwitcher.tsx';
import { SearchInput } from './components/SearchInput.tsx';
import { GuessTable } from './components/GuessTable.tsx';
import { WinModal } from './components/WinModal.tsx';
import { StatsModal } from './components/StatsModal.tsx';
import { HowToPlay } from './components/HowToPlay.tsx';
import { getDailyPlayer, getPuzzleNumber } from './lib/dailyPlayer.ts';
import { loadMode, saveMode, loadLanguage, saveLanguage } from './lib/storage.ts';
import { t } from './lib/i18n.ts';
import { useGameState } from './hooks/useGameState.ts';
import { useStats } from './hooks/useStats.ts';
import playersData from './data/players.json';
import type { Player, GameMode, Language } from './types/player.ts';

const ALL_PLAYERS = playersData as Player[];
const FR_PLAYERS  = ALL_PLAYERS.filter(p => p.country === 'France');

const SEEDS: Record<GameMode, number> = { intl: 42, fr: 1042 };

function playersFor(mode: GameMode): Player[] {
  return mode === 'fr' ? FR_PLAYERS : ALL_PLAYERS;
}

/**
 * Compute today's daily player for the active mode while guaranteeing
 * the two modes never share the same answer on the same day.
 */
function dailyPlayerForMode(mode: GameMode): Player {
  const frPick = getDailyPlayer(FR_PLAYERS, undefined, SEEDS.fr);
  if (mode === 'fr') return frPick;

  let pick = getDailyPlayer(ALL_PLAYERS, undefined, SEEDS.intl);
  if (pick.id === frPick.id) {
    // collision: re-shuffle with a different seed and pick the same index
    pick = getDailyPlayer(ALL_PLAYERS, undefined, SEEDS.intl + 7919);
  }
  return pick;
}

function useGlobalUI() {
  const [lang, setLang] = useState<Language>(() => loadLanguage());
  const handleLangChange = (l: Language) => { saveLanguage(l); setLang(l); };
  return { lang, handleLangChange };
}

function GamePage({ lang, handleLangChange }: { lang: Language; handleLangChange: (l: Language) => void }) {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [mode, setMode] = useState<GameMode>(() => loadMode());

  const players = useMemo(() => playersFor(mode), [mode]);
  const dailyPlayer = useMemo(() => dailyPlayerForMode(mode), [mode]);

  const { guesses, results, won, finished, submitGuess } = useGameState(dailyPlayer, players, mode);
  const { stats, refresh } = useStats(mode);

  const excluded = new Set(guesses.map(g => g.id));

  const handleSelect = (player: Player) => {
    submitGuess(player);
    if (player.id === dailyPlayer.id) {
      refresh();
      setShowWin(true);  // only show on fresh win, not on restored state
    }
  };

  const handleModeChange = (next: GameMode) => {
    if (next === mode) return;
    saveMode(next);
    setMode(next);
    setShowWin(false);
  };

  const winningId = won ? dailyPlayer.id : undefined;

  return (
    <>
      <Header
        lang={lang}
        onLangChange={handleLangChange}
        onHowToPlay={() => setShowHowToPlay(true)}
        onStats={() => { refresh(); setShowStats(true); }}
      />

      <main className="w-[90%] max-w-3xl mx-auto py-6 space-y-5 flex-1">
        <div className="flex justify-center">
          <ModeSwitcher mode={mode} lang={lang} onChange={handleModeChange} />
        </div>

        <p className="text-center text-shuttle-feather text-sm">
          {t('app.intro', lang)}{' '}
          <span className="text-shuttle-white font-medium">{players.length} {t('app.intro.players', lang)}</span>
          {mode === 'fr' && <span className="text-shuttle-feather"> {t('app.intro.frSuffix', lang)}</span>}
        </p>

        <SearchInput
          players={players}
          excluded={excluded}
          onSelect={handleSelect}
          disabled={finished}
          lang={lang}
        />

        <GuessTable guesses={guesses} results={results} lang={lang} winningId={winningId} />
        {guesses.length === 0 && (
          <p className="text-center text-shuttle-feather text-sm pt-2">
            {t('app.intro.empty', lang)}
          </p>
        )}
      </main>

      <footer className="border-t border-court-line py-3 text-center text-xs text-shuttle-feather space-x-4 mt-auto">
        <span>🏸 #{getPuzzleNumber()}</span>
        <Link to="/about" className="hover:text-shuttle-white transition-colors">{t('app.about', lang)}</Link>
        <Link to="/legal" className="hover:text-shuttle-white transition-colors">{t('app.legal', lang)}</Link>
      </footer>

      {showHowToPlay && <HowToPlay lang={lang} onClose={() => setShowHowToPlay(false)} />}
      {showStats && <StatsModal lang={lang} stats={stats} onClose={() => setShowStats(false)} />}
      {won && showWin && (
        <WinModal
          target={dailyPlayer}
          guessCount={guesses.length}
          results={results}
          lang={lang}
          onClose={() => setShowWin(false)}
          onStats={() => { setShowWin(false); refresh(); setShowStats(true); }}
        />
      )}
    </>
  );
}

function AboutPage({ lang, handleLangChange }: { lang: Language; handleLangChange: (l: Language) => void }) {
  return (
    <>
      <Header lang={lang} onLangChange={handleLangChange} onHowToPlay={() => {}} onStats={() => {}} />
      <main className="max-w-lg mx-auto px-4 py-10 space-y-4 text-shuttle-feather text-sm flex-1">
        <h1 className="text-xl font-bold text-shuttle-white uppercase tracking-widest">{t('about.title', lang)}</h1>
        <p>{t('about.body1', lang)}</p>
        <p>{t('about.body2', lang)}</p>
        <p>{t('about.data', lang)} <a href="https://en.wikipedia.org" className="text-shuttle-white hover:underline" target="_blank" rel="noopener noreferrer">Wikipedia</a> · <a href="https://bwfbadminton.com" className="text-shuttle-white hover:underline" target="_blank" rel="noopener noreferrer">BWF</a></p>
        <Link to="/" className="inline-block text-shuttle-white hover:underline">{t('about.back', lang)}</Link>
      </main>
    </>
  );
}

function LegalPage({ lang, handleLangChange }: { lang: Language; handleLangChange: (l: Language) => void }) {
  return (
    <>
      <Header lang={lang} onLangChange={handleLangChange} onHowToPlay={() => {}} onStats={() => {}} />
      <main className="max-w-lg mx-auto px-4 py-10 space-y-4 text-shuttle-feather text-sm flex-1">
        <h1 className="text-xl font-bold text-shuttle-white uppercase tracking-widest">{t('legal.title', lang)}</h1>
        <p>{t('legal.body1', lang)}</p>
        <p>{t('legal.body2', lang)}</p>
        <p>{t('legal.body3', lang)}</p>
        <Link to="/" className="inline-block text-shuttle-white hover:underline">{t('about.back', lang)}</Link>
      </main>
    </>
  );
}

export default function App() {
  const { lang, handleLangChange } = useGlobalUI();
  return (
    <div className="min-h-screen flex flex-col bg-court-dark">
      <Routes>
        <Route path="/"      element={<GamePage  lang={lang} handleLangChange={handleLangChange} />} />
        <Route path="/about" element={<AboutPage lang={lang} handleLangChange={handleLangChange} />} />
        <Route path="/legal" element={<LegalPage lang={lang} handleLangChange={handleLangChange} />} />
      </Routes>
    </div>
  );
}
