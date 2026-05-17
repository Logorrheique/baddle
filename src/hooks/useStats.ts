import { useState, useCallback, useEffect } from 'react';
import type { GameMode } from '../types/player.ts';
import { loadStats, type UserStats } from '../lib/storage.ts';

export function useStats(mode: GameMode) {
  const [stats, setStats] = useState<UserStats>(() => loadStats(mode));

  useEffect(() => {
    setStats(loadStats(mode));
  }, [mode]);

  const refresh = useCallback(() => {
    setStats(loadStats(mode));
  }, [mode]);

  return { stats, refresh };
}
