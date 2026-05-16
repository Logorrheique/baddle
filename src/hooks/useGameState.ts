import { useState, useEffect, useCallback } from 'react';
import type { Player } from '../types/player.ts';
import { compareGuess, type GuessResult } from '../lib/comparison.ts';
import { loadGameState, saveGameState, loadStats, saveStats, updateStatsOnWin } from '../lib/storage.ts';
import { todayString } from '../lib/dailyPlayer.ts';

export interface GameStateHook {
  guesses: Player[];
  results: GuessResult[];
  won: boolean;
  finished: boolean;
  submitGuess: (player: Player) => void;
}

export function useGameState(target: Player, allPlayers: Player[]): GameStateHook {
  const today = todayString();

  const [guesses, setGuesses] = useState<Player[]>([]);
  const [results, setResults] = useState<GuessResult[]>([]);
  const [won, setWon] = useState(false);
  const [finished, setFinished] = useState(false);

  // Restore saved game state on mount
  useEffect(() => {
    const saved = loadGameState();
    if (!saved || saved.date !== today) return;

    const restoredGuesses = saved.guesses
      .map(id => allPlayers.find(p => p.id === id))
      .filter((p): p is Player => p !== undefined);

    const restoredResults = restoredGuesses.map(g => compareGuess(g, target));
    setGuesses(restoredGuesses);
    setResults(restoredResults);
    setWon(saved.won);
    setFinished(saved.finished);
  }, [target, allPlayers, today]);

  const submitGuess = useCallback((player: Player) => {
    if (finished) return;
    if (guesses.some(g => g.id === player.id)) return;

    const result = compareGuess(player, target);
    const isWin = player.id === target.id;

    const newGuesses = [...guesses, player];
    const newResults = [...results, result];
    const newWon = won || isWin;
    const newFinished = newWon; // no max guesses — game only ends on win

    setGuesses(newGuesses);
    setResults(newResults);
    setWon(newWon);
    setFinished(newFinished);

    saveGameState({
      date: today,
      guesses: newGuesses.map(g => g.id),
      won: newWon,
      finished: newFinished,
    });

    if (isWin) {
      const stats = loadStats();
      const prevState = loadGameState();
      const prevDate = prevState?.date ?? '';
      saveStats(updateStatsOnWin(stats, newGuesses.length, prevDate, today));
    }
  }, [guesses, results, won, finished, target, today]);


  return { guesses, results, won, finished, submitGuess };
}
