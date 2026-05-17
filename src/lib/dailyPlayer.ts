export const EPOCH_DATE = new Date('2026-01-01T00:00:00Z');

/**
 * Returns number of full days since EPOCH_DATE in the user's local timezone.
 */
export function daysSinceEpoch(date: Date = new Date()): number {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const epoch = new Date(
    EPOCH_DATE.getUTCFullYear(),
    EPOCH_DATE.getUTCMonth(),
    EPOCH_DATE.getUTCDate(),
  );
  return Math.floor((local.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Returns today's date string in "YYYY-MM-DD" format (local time).
 */
export function todayString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns the puzzle number (1-indexed) for a given date.
 */
export function getPuzzleNumber(date: Date = new Date()): number {
  return daysSinceEpoch(date) + 1;
}
