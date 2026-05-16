import { useState, useEffect } from 'react';
import type { GuessResult } from '../lib/comparison.ts';
import type { Player } from '../types/player.ts';
import { buildShareText } from '../lib/share.ts';
import { getPuzzleNumber } from '../lib/dailyPlayer.ts';

interface WinModalProps {
  target: Player;
  allPlayers: Player[];
  guessCount: number;
  results: GuessResult[];
  onClose: () => void;
  onStats: () => void;
}

function useCountdown() {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    function update() {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return remaining;
}

export function WinModal({ target, allPlayers, guessCount, results, onClose, onStats }: WinModalProps) {
  const countdown = useCountdown();
  const [copied, setCopied] = useState(false);
  const puzzleNumber = getPuzzleNumber(allPlayers);
  const shareText = buildShareText(puzzleNumber, results);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-game-card rounded-card p-6 max-w-sm w-full text-center shadow-2xl border border-game-border"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-4xl mb-3">🏸</div>
        <h2 className="text-xl font-bold text-game-text mb-1">Bravo !</h2>
        <p className="text-game-muted text-sm mb-4">
          Tu as trouvé <span className="text-game-text font-semibold">{target.name}</span> en{' '}
          <span className="text-game-correct font-bold font-mono">{guessCount}</span> essai{guessCount > 1 ? 's' : ''}.
        </p>

        {target.imageUrl && (
          <img
            src={target.imageUrl}
            alt={target.name}
            className="w-20 h-20 rounded-full object-cover object-top mx-auto mb-4 border-2 border-game-correct"
          />
        )}

        <div className="text-game-muted text-sm mb-4">
          Prochain joueur dans <span className="font-mono text-game-text">{countdown}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onStats}
            className="flex-1 py-2 rounded-card border border-game-border text-game-muted hover:text-game-text hover:border-game-text transition-colors text-sm"
          >
            Stats
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-2 rounded-card bg-game-correct text-white font-semibold hover:opacity-90 transition-opacity text-sm"
          >
            {copied ? 'Copié !' : 'Partager'}
          </button>
        </div>
      </div>
    </div>
  );
}
