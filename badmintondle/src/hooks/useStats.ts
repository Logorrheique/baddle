import { useState, useCallback } from 'react';
import { loadStats, saveStats, type UserStats } from '../lib/storage';

export function useStats() {
  const [stats, setStats] = useState<UserStats>(loadStats);

  const refresh = useCallback(() => {
    setStats(loadStats());
  }, []);

  const update = useCallback((next: UserStats) => {
    saveStats(next);
    setStats(next);
  }, []);

  return { stats, refresh, update };
}
