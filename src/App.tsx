import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Header } from './components/Header.tsx';
import { SearchInput } from './components/SearchInput.tsx';
import { GuessTable } from './components/GuessTable.tsx';
import { WinModal } from './components/WinModal.tsx';
import { StatsModal } from './components/StatsModal.tsx';
import { HowToPlay } from './components/HowToPlay.tsx';
import { getDailyPlayer } from './lib/dailyPlayer.ts';
import { useGameState } from './hooks/useGameState.ts';
import { useStats } from './hooks/useStats.ts';
import playersData from './data/players.json';
import type { Player } from './types/player.ts';

const ALL_PLAYERS = playersData as Player[];
const DAILY_PLAYER = getDailyPlayer(ALL_PLAYERS);

function GamePage() {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showWin, setShowWin] = useState(true);
  const { guesses, results, won, finished, submitGuess } = useGameState(DAILY_PLAYER, ALL_PLAYERS);
  const { stats, refresh } = useStats();

  const excluded = new Set(guesses.map(g => g.id));

  const handleSelect = (player: Player) => {
    submitGuess(player);
    if (player.id === DAILY_PLAYER.id) {
      refresh();
      setShowWin(true);
    }
  };

  return (
    <>
      <Header
        onHowToPlay={() => setShowHowToPlay(true)}
        onStats={() => { refresh(); setShowStats(true); }}
      />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center text-game-muted text-sm">
          Devine le joueur de badminton mystère parmi <span className="text-game-text font-semibold">50 légendes</span>
        </div>

        {!finished && (
          <SearchInput
            players={ALL_PLAYERS}
            excluded={excluded}
            onSelect={handleSelect}
            disabled={finished}
          />
        )}

        {guesses.length > 0 && (
          <GuessTable guesses={guesses} results={results} />
        )}

        {guesses.length === 0 && (
          <div className="text-center text-game-muted text-sm pt-4">
            Commence par chercher un joueur ci-dessus.
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-game-border py-3 text-center text-xs text-game-muted space-x-4">
        <Link to="/about" className="hover:text-game-text transition-colors">À propos</Link>
        <Link to="/legal" className="hover:text-game-text transition-colors">Mentions légales</Link>
      </footer>

      {showHowToPlay && <HowToPlay onClose={() => setShowHowToPlay(false)} />}
      {showStats && <StatsModal stats={stats} onClose={() => setShowStats(false)} />}
      {won && showWin && (
        <WinModal
          target={DAILY_PLAYER}
          allPlayers={ALL_PLAYERS}
          guessCount={guesses.length}
          results={results}
          onClose={() => setShowWin(false)}
          onStats={() => { setShowWin(false); refresh(); setShowStats(true); }}
        />
      )}
    </>
  );
}

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header onHowToPlay={() => {}} onStats={() => {}} />
      <main className="max-w-lg mx-auto px-4 py-10 space-y-4 text-game-muted text-sm">
        <h1 className="text-2xl font-bold text-game-text">À propos de Baddle</h1>
        <p>
          Baddle est un jeu quotidien inspiré de Wordle, dédié au badminton.
          Devine le joueur mystère parmi 50 légendes du circuit professionnel.
        </p>
        <p>
          Les données sont issues de{' '}
          <a href="https://en.wikipedia.org" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
            Wikipedia
          </a>{' '}
          et de la{' '}
          <a href="https://bwfbadminton.com" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
            BWF (Badminton World Federation)
          </a>.
        </p>
        <Link to="/" className="inline-block text-blue-400 hover:underline">← Retour au jeu</Link>
      </main>
    </div>
  );
}

function LegalPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header onHowToPlay={() => {}} onStats={() => {}} />
      <main className="max-w-lg mx-auto px-4 py-10 space-y-4 text-game-muted text-sm">
        <h1 className="text-2xl font-bold text-game-text">Mentions légales</h1>
        <p>Baddle est un projet personnel à but non commercial.</p>
        <p>
          Aucun cookie de traçage n'est utilisé. Les seules données stockées sont
          votre progression de jeu, en local sur votre appareil (localStorage).
        </p>
        <p>
          Les photos des joueurs proviennent de Wikimedia Commons sous licences
          libres (CC BY-SA et similaires).
        </p>
        <Link to="/" className="inline-block text-blue-400 hover:underline">← Retour au jeu</Link>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-game-bg">
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/legal" element={<LegalPage />} />
      </Routes>
    </div>
  );
}
