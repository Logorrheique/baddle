import { useState, useEffect } from 'react';
import type { GuessResult } from '../lib/comparison.ts';
import type { Player, Language } from '../types/player.ts';
import { buildShareText } from '../lib/share.ts';
import { getPuzzleNumber } from '../lib/dailyPlayer.ts';
import { useEscapeKey } from '../hooks/useEscapeKey.ts';
import { t } from '../lib/i18n.ts';

interface WinModalProps {
  target: Player;
  guessCount: number;
  results: GuessResult[];
  onClose: () => void;
  onStats: () => void;
  lang: Language;
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

// Decorative confetti particles
function ConfettiBurst() {
  const colors = ['#6aaa64', '#f97316', '#fafaf9', '#3a3431'];
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    left: `${(i / 24) * 100}%`,
    delay: `${Math.random() * 0.4}s`,
    color: colors[i % colors.length],
    rotation: `${Math.random() * 360}deg`,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block w-2 h-3 animate-confetti"
          style={{
            left: p.left,
            animationDelay: p.delay,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation})`,
          }}
        />
      ))}
    </div>
  );
}

export function WinModal({ target, guessCount, results, onClose, onStats, lang }: WinModalProps) {
  useEscapeKey(onClose);
  const countdown = useCountdown();
  const [copied, setCopied] = useState(false);
  const puzzleNumber = getPuzzleNumber();
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
    <>
      <ConfettiBurst />
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="win-title">
        <div
          className="bg-court-dark rounded-card p-6 max-w-sm w-full text-center shadow-2xl border border-court-line max-h-[90vh] overflow-y-auto animate-pop-in"
          onClick={e => e.stopPropagation()}
        >
          <h2 id="win-title" className="text-2xl font-bold text-shuttle-white uppercase tracking-widest mb-1">
            {t('win.title', lang)} 🏸
          </h2>
          <p className="text-shuttle-feather text-sm mb-4">
            {t('win.found', lang, String(guessCount), guessCount > 1 ? (lang === 'fr' ? 's' : 'es') : '')}{' '}
            <span className="font-medium text-shuttle-white">{target.name}</span>
          </p>

          {target.imageUrl && (
            <img
              src={target.imageUrl}
              alt={target.name}
              className="w-24 h-24 rounded-full object-cover object-top mx-auto mb-4 border-2 border-ace-green animate-celebrate"
            />
          )}

          <p className="text-shuttle-feather text-sm mb-4">
            {t('win.next', lang)} <span className="font-mono text-shuttle-white">{countdown}</span>
          </p>

          <div className="flex gap-2">
            <button
              onClick={onStats}
              className="flex-1 py-2.5 rounded-card border border-court-line text-shuttle-feather hover:text-shuttle-white hover:border-shuttle-feather transition-colors text-sm font-medium uppercase tracking-wider"
            >
              {t('win.stats', lang)}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-2.5 rounded-card bg-ace-green text-white font-bold uppercase tracking-wider hover:opacity-90 transition-opacity text-sm"
            >
              {copied ? t('win.copied', lang) : t('win.share', lang)}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
