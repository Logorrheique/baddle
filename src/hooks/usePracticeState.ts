import { useCallback, useState } from 'react';
import type { Player } from '../types/player.ts';
import type { GuessResult } from '../lib/comparison.ts';
import { compareGuess } from '../lib/comparison.ts';

export interface PracticeStateHook {
  target: Player | null;
  guesses: Player[];
  results: GuessResult[];
  won: boolean;
  finished: boolean;
  submitGuess: (player: Player) => boolean;
  newGame: () => void;
}

function pickRandomPlayer(players: Player[]): Player {
  return players[Math.floor(Math.random() * players.length)];
}

export function usePracticeState(allPlayers: Player[]): PracticeStateHook {
  const [target, setTarget] = useState<Player | null>(null);
  const [guesses, setGuesses] = useState<Player[]>([]);
  const [results, setResults] = useState<GuessResult[]>([]);
  const [won, setWon] = useState(false);

  const newGame = useCallback(() => {
    if (allPlayers.length === 0) return;
    let next = pickRandomPlayer(allPlayers);
    // Avoid repeating the same player twice in a row when possible
    if (target && allPlayers.length > 1 && next.id === target.id) {
      next = pickRandomPlayer(allPlayers.filter(p => p.id !== target.id));
    }
    setTarget(next);
    setGuesses([]);
    setResults([]);
    setWon(false);
  }, [allPlayers, target]);

  const submitGuess = useCallback((player: Player): boolean => {
    if (!target || won || guesses.some(g => g.id === player.id)) return false;
    setGuesses(prev => [...prev, player]);
    setResults(prev => [...prev, compareGuess(player, target)]);
    const isWin = player.id === target.id;
    if (isWin) setWon(true);
    return isWin;
  }, [target, won, guesses]);

  return {
    target,
    guesses,
    results,
    won,
    finished: won,
    submitGuess,
    newGame,
  };
}
