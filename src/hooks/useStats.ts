import { useState, useCallback } from 'react';
import { loadStats, type UserStats } from '../lib/storage.ts';

export function useStats() {
  const [stats, setStats] = useState<UserStats>(() => loadStats());

  const refresh = useCallback(() => {
    setStats(loadStats());
  }, []);

  return { stats, refresh };
}
