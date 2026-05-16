import { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchInput from './components/SearchInput';
import GuessTable from './components/GuessTable';
import WinModal from './components/WinModal';
import StatsModal from './components/StatsModal';
import HowToPlay from './components/HowToPlay';
import { useGameState } from './hooks/useGameState';
import { loadStats } from './lib/storage';

function ShuttlecockBig() {
  return (
    <svg viewBox="0 0 64 68" fill="none" className="w-20 h-20 animate-float opacity-60" aria-hidden="true">
      <circle cx="32" cy="54" r="12" fill="#166534" />
      <circle cx="32" cy="54" r="7"  fill="#15803d" />
      {([-12,-7,0,7,12] as const).map((dx, i) => (
        <line
          key={i}
          x1={32} y1={42}
          x2={32 + dx} y2={6}
          stroke="#1a2a45" strokeWidth="2.5" strokeLinecap="round"
        />
      ))}
      <path d="M20 6 Q32 14 44 6" stroke="#1a2a45" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M20 6 Q32 11 44 6" stroke="#1c3a4a" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeDasharray="3 2"/>
    </svg>
  );
}

export default function App() {
  const { guesses, won, finished, target, dayNumber, allPlayers, submitGuess, guessedIds } =
    useGameState();

  const [showWin,   setShowWin]   = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    if (won) {
      const t = setTimeout(() => setShowWin(true), guesses.length * 100 + 700);
      return () => clearTimeout(t);
    }
  }, [won, guesses.length]);

  const stats = loadStats();

  return (
    <div className="min-h-screen bg-game-bg court-grid relative overflow-x-hidden">
      {/* Spotlight glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% 4%, rgba(34,197,94,0.05) 0%, transparent 65%)',
        }}
      />

      <Header
        onStats={() => setShowStats(true)}
        onHowToPlay={() => setShowHowTo(true)}
        dayNumber={dayNumber}
      />

      <main className="relative pt-[73px] pb-36 px-4 min-h-screen">
        <div className="max-w-[860px] mx-auto">

          {/* Day header */}
          <div className="flex items-center justify-between py-4 border-b border-game-border mb-2">
            <div className="flex items-center gap-3">
              <div className="h-5 w-[3px] rounded-full bg-game-correct" />
              <p className="font-display font-semibold uppercase tracking-widest text-xs text-game-muted">
                Partie du jour
              </p>
            </div>
            <p className="font-mono text-xs text-game-muted">
              {guesses.length} tentative{guesses.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Guess table */}
          <GuessTable guesses={guesses} />

          {/* Empty state */}
          {guesses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <ShuttlecockBig />
              <div>
                <p className="font-display font-bold text-2xl uppercase tracking-wide text-game-text">
                  Devine le joueur mystère
                </p>
                <p className="text-sm text-game-muted mt-1.5 max-w-xs">
                  Tape un nom dans le champ ci-dessous pour commencer.
                  Les indices se révèlent à chaque tentative.
                </p>
              </div>
              <button
                onClick={() => setShowHowTo(true)}
                className="text-xs font-display font-semibold uppercase tracking-widest text-game-accent hover:text-blue-300 transition-colors border-b border-game-accent/30 pb-0.5"
              >
                Comment jouer ?
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Sticky search bar */}
      {!finished && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div
            className="border-t border-game-border px-4 py-3"
            style={{ background: 'linear-gradient(to top, #06091a 80%, rgba(6,9,26,0.9) 100%)' }}
          >
            <div className="max-w-[860px] mx-auto">
              <SearchInput
                players={allPlayers}
                excludedIds={guessedIds}
                onSelect={submitGuess}
                disabled={finished}
              />
            </div>
          </div>
        </div>
      )}

      {/* Game over (lost) bar */}
      {finished && !won && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-game-border px-4 py-4"
          style={{ background: 'linear-gradient(to top, #06091a 80%, rgba(6,9,26,0.9) 100%)' }}>
          <p className="text-center text-sm text-game-muted max-w-[860px] mx-auto">
            Le joueur mystère était{' '}
            <span className="font-display font-bold text-game-text">{target.name}</span>
            {' '}— Reviens demain !
          </p>
        </div>
      )}

      {/* Modals */}
      {showWin && (
        <WinModal
          player={target}
          guessCount={guesses.length}
          dayNumber={dayNumber}
          guessResults={guesses.map((g) => g.results)}
          onStats={() => { setShowWin(false); setShowStats(true); }}
          onClose={() => setShowWin(false)}
        />
      )}

      {showStats && (
        <StatsModal stats={stats} onClose={() => setShowStats(false)} />
      )}

      {showHowTo && (
        <HowToPlay onClose={() => setShowHowTo(false)} />
      )}
    </div>
  );
}
