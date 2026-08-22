import { describe, it, expect } from 'vitest';
import { t } from '../src/lib/i18n.ts';
import type { Language } from '../src/types/player.ts';

const NEW_KEYS = ['practice.button', 'practice.exit', 'practice.intro', 'practice.newGame'];
const LANGS: Language[] = ['fr', 'en'];

describe('i18n — practice mode keys', () => {
  for (const key of NEW_KEYS) {
    for (const lang of LANGS) {
      it(`has ${key} in ${lang}`, () => {
        const value = t(key, lang);
        expect(value).not.toBe(key); // falls back to the key itself when missing
        expect(value.length).toBeGreaterThan(0);
      });
    }
  }
});
