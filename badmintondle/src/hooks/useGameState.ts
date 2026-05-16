import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Player } from '../types/player';
import { comparePlayer, type CellResult } from '../lib/comparison';
import { getDailyPlayer, getDayNumber } from '../lib/dailyPlayer';
import { loadGame, saveGame, recordResult } from '../lib/storage';
import players from '../data/players.json';

export interface GuessEntry {
  player: Player;
  results: Record<string, CellResult>;
}

interface GameStateData {
  guesses: GuessEntry[];
  won: boolean;
  finished: boolean;
  target: Player;
  dayNumber: number;
}

const allPlayers = players as Player[];
const todayDate = new Date();
const todayStr = todayDate.toISOString().slice(0, 10);
const dailyTarget = getDailyPlayer(allPlayers, todayDate);
const dailyNumber = getDayNumber(todayDate);

export function useGameState() {
  const [state, setState] = useState<GameStateData>(() => {
    const saved = loadGame();
    if (saved) {
      const guessPlayers = saved.guesses
        .map((id) => allPlayers.find((p) => p.id === id))
        .filter(Boolean) as Player[];
      const guesses: GuessEntry[] = guessPlayers.map((p) => ({
        player: p,
        results: comparePlayer(p, dailyTarget),
      }));
      return {
        guesses,
        won: saved.won,
        finished: saved.finished,
        target: dailyTarget,
        dayNumber: dailyNumber,
      };
    }
    return { guesses: [], won: false, finished: false, target: dailyTarget, dayNumber: dailyNumber };
  });

  useEffect(() => {
    saveGame({
      date: todayStr,
      guesses: state.guesses.map((g) => g.player.id),
      won: state.won,
      finished: state.finished,
    });
  }, [state.guesses, state.won, state.finished]);

  const submitGuess = useCallback(
    (player: Player) => {
      if (state.finished) return;
      if (state.guesses.some((g) => g.player.id === player.id)) return;

      const results = comparePlayer(player, dailyTarget);
      const won = player.id === dailyTarget.id;
      const newGuesses = [...state.guesses, { player, results }];
      const finished = won;

      if (finished) {
        recordResult(won, newGuesses.length);
      }

      setState((prev) => ({ ...prev, guesses: newGuesses, won, finished }));
    },
    [state]
  );

  const guessedIds = useMemo(
    () => state.guesses.map((g) => g.player.id),
    [state.guesses]
  );

  return { ...state, allPlayers, submitGuess, guessedIds };
}
