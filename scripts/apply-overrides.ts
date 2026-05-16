import { readFileSync, existsSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import type { Player } from '../src/types/player.js';

const OVERRIDES_FILE = new URL('./manual-overrides.yaml', import.meta.url).pathname;

type PartialPlayer = Partial<Omit<Player, 'id'>>;
type OverridesMap = Record<string, PartialPlayer>;

export function applyOverrides(player: Player): Player {
  if (!existsSync(OVERRIDES_FILE)) return player;

  try {
    const raw = readFileSync(OVERRIDES_FILE, 'utf-8');
    const overrides: OverridesMap = parseYaml(raw) ?? {};
    const patch = overrides[player.id];
    if (!patch) return player;
    return { ...player, ...patch };
  } catch {
    return player;
  }
}
