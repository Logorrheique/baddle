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

export const STORAGE_KEYS = {
  GAME: 'badmintondle:game',
  STATS: 'badmintondle:stats',
  SETTINGS: 'badmintondle:settings',
} as const;

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GAME);
    if (!raw) return null;
    const state = JSON.parse(raw) as GameState;
    if (state.date !== toDateString(new Date())) return null;
    return state;
  } catch {
    return null;
  }
}

export function saveGame(state: GameState): void {
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(state));
}

export function loadStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) return defaultStats();
    return JSON.parse(raw) as UserStats;
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats: UserStats): void {
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
}

function defaultStats(): UserStats {
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: {},
  };
}

export function recordResult(
  won: boolean,
  numGuesses: number
): UserStats {
  const stats = loadStats();
  stats.played += 1;
  if (won) {
    stats.wins += 1;
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.guessDistribution[numGuesses] =
      (stats.guessDistribution[numGuesses] ?? 0) + 1;
  } else {
    stats.currentStreak = 0;
  }
  saveStats(stats);
  return stats;
}
