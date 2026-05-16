const STORAGE_KEYS = {
  GAME: 'baddle:game',
  STATS: 'baddle:stats',
} as const;

export interface GameState {
  date: string;
  guesses: string[];
  won: boolean;
  finished: boolean;
}

export interface UserStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>;
}

const DEFAULT_STATS: UserStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: {},
};

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GAME);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(state));
}

export function loadStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) return { ...DEFAULT_STATS };
    return { ...DEFAULT_STATS, ...JSON.parse(raw) as UserStats };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveStats(stats: UserStats): void {
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
}

export function updateStatsOnWin(stats: UserStats, guessCount: number, prevDate: string, todayStr: string): UserStats {
  const yesterday = new Date(todayStr);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const streakContinues = prevDate === yesterdayStr;

  const newStreak = streakContinues ? stats.currentStreak + 1 : 1;
  return {
    played: stats.played + 1,
    wins: stats.wins + 1,
    currentStreak: newStreak,
    maxStreak: Math.max(stats.maxStreak, newStreak),
    guessDistribution: {
      ...stats.guessDistribution,
      [guessCount]: (stats.guessDistribution[guessCount] ?? 0) + 1,
    },
  };
}

export function updateStatsOnLoss(stats: UserStats): UserStats {
  return {
    ...stats,
    played: stats.played + 1,
    currentStreak: 0,
  };
}
