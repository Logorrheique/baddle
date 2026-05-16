import { readFileSync, existsSync } from 'fs';
import { parse as parseYaml } from 'yaml';
const OVERRIDES_FILE = new URL('./manual-overrides.yaml', import.meta.url).pathname;
export function applyOverrides(player) {
    if (!existsSync(OVERRIDES_FILE))
        return player;
    try {
        const raw = readFileSync(OVERRIDES_FILE, 'utf-8');
        const overrides = parseYaml(raw) ?? {};
        const patch = overrides[player.id];
        if (!patch)
            return player;
        return { ...player, ...patch };
    }
    catch {
        return player;
    }
}
