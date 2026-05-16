import type { GameMode, Language } from '../types/player.ts';

const STORAGE_PREFIX = 'baddle';

function gameKey(mode: GameMode): string { return `${STORAGE_PREFIX}:game:${mode}`; }
function statsKey(mode: GameMode): string { return `${STORAGE_PREFIX}:stats:${mode}`; }

export const MODE_STORAGE_KEY = `${STORAGE_PREFIX}:mode`;
export const LANG_STORAGE_KEY = `${STORAGE_PREFIX}:lang`;

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

export function loadGameState(mode: GameMode): GameState | null {
  try {
    const raw = localStorage.getItem(gameKey(mode));
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState, mode: GameMode): void {
  localStorage.setItem(gameKey(mode), JSON.stringify(state));
}

export function loadStats(mode: GameMode): UserStats {
  try {
    const raw = localStorage.getItem(statsKey(mode));
    if (!raw) return { ...DEFAULT_STATS };
    return { ...DEFAULT_STATS, ...JSON.parse(raw) as UserStats };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveStats(stats: UserStats, mode: GameMode): void {
  localStorage.setItem(statsKey(mode), JSON.stringify(stats));
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

export function loadMode(): GameMode {
  try {
    const raw = localStorage.getItem(MODE_STORAGE_KEY);
    return raw === 'fr' ? 'fr' : 'intl';
  } catch {
    return 'intl';
  }
}

export function saveMode(mode: GameMode): void {
  localStorage.setItem(MODE_STORAGE_KEY, mode);
}

export function loadLanguage(): Language {
  try {
    const raw = localStorage.getItem(LANG_STORAGE_KEY);
    return raw === 'en' ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
}

export function saveLanguage(lang: Language): void {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
}
