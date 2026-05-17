import { useState, useEffect, useCallback } from 'react';
import type { Player, GameMode } from '../types/player.ts';
import type { GuessResult } from '../lib/comparison.ts';
import { loadGameState, saveGameState, loadStats, saveStats, updateStatsOnWin } from '../lib/storage.ts';
import { todayString } from '../lib/dailyPlayer.ts';

export interface GameStateHook {
  guesses: Player[];
  results: GuessResult[];
  won: boolean;
  finished: boolean;
  target: Player | null;
  submitGuess: (player: Player) => Promise<boolean>;
}

interface GuessApiResponse {
  result: GuessResult;
  isWin: boolean;
  target?: Player;
}

export function useGameState(allPlayers: Player[], mode: GameMode): GameStateHook {
  const today = todayString();

  const [guesses, setGuesses] = useState<Player[]>([]);
  const [results, setResults] = useState<GuessResult[]>([]);
  const [won, setWon] = useState(false);
  const [finished, setFinished] = useState(false);
  const [target, setTarget] = useState<Player | null>(null);

  // Restore saved game state on mount or mode switch
  useEffect(() => {
    const saved = loadGameState(mode);
    if (!saved || saved.date !== today) {
      setGuesses([]); setResults([]); setWon(false); setFinished(false); setTarget(null);
      return;
    }
    const restoredGuesses = saved.guesses
      .map(id => allPlayers.find(p => p.id === id))
      .filter((p): p is Player => p !== undefined);
    setGuesses(restoredGuesses);
    setResults(saved.results as GuessResult[]);
    setWon(saved.won);
    setFinished(saved.finished);
    setTarget(saved.targetId ? allPlayers.find(p => p.id === saved.targetId) ?? null : null);
  }, [allPlayers, today, mode]);

  const submitGuess = useCallback(async (player: Player): Promise<boolean> => {
    if (finished) return false;
    if (guesses.some(g => g.id === player.id)) return false;

    const res = await fetch('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, playerId: player.id }),
    });
    if (!res.ok) return false;
    const data: GuessApiResponse = await res.json();

    const newGuesses = [...guesses, player];
    const newResults = [...results, data.result];
    const newWon = won || data.isWin;
    const newFinished = newWon;
    const newTarget = data.target ?? target;

    setGuesses(newGuesses);
    setResults(newResults);
    setWon(newWon);
    setFinished(newFinished);
    if (newTarget) setTarget(newTarget);

    saveGameState({
      date: today,
      guesses: newGuesses.map(g => g.id),
      results: newResults,
      won: newWon,
      finished: newFinished,
      targetId: newTarget?.id,
    }, mode);

    if (data.isWin) {
      const stats = loadStats(mode);
      const prevState = loadGameState(mode);
      const prevDate = prevState?.date ?? '';
      saveStats(updateStatsOnWin(stats, newGuesses.length, prevDate, today), mode);
    }
    return data.isWin;
  }, [guesses, results, won, finished, target, today, mode]);

  return { guesses, results, won, finished, target, submitGuess };
}
