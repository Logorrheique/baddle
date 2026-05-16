import { describe, it, expect } from 'vitest';
import { getDayNumber, getDailyPlayer } from '../src/lib/dailyPlayer';
import type { Player } from '../src/types/player';

const mockPlayers: Player[] = [
  { id: 'p1', name: 'Player 1', imageUrl: null, gender: 'H', continent: 'Europe', country: 'France', countryCode: 'FR', status: 'Actif', discipline: 'Simple', hand: 'Droitier', ageBracket: '25-30', heightBracket: '175-180', bestRanking: 'Top 10', bestOlympicMedal: 'Aucune', majorTitles: '1-3', proStartDecade: '2010s' },
  { id: 'p2', name: 'Player 2', imageUrl: null, gender: 'F', continent: 'Asie', country: 'Chine', countryCode: 'CN', status: 'Retraité', discipline: 'Double', hand: 'Droitier', ageBracket: '35-40', heightBracket: '165-170', bestRanking: 'N°1', bestOlympicMedal: 'Or', majorTitles: '20+', proStartDecade: '2000s' },
  { id: 'p3', name: 'Player 3', imageUrl: null, gender: 'H', continent: 'Amériques', country: 'Canada', countryCode: 'CA', status: 'Actif', discipline: 'Double mixte', hand: 'Gaucher', ageBracket: '<25', heightBracket: '180-185', bestRanking: 'Top 20', bestOlympicMedal: 'Bronze', majorTitles: '0', proStartDecade: '2020s' },
  { id: 'p4', name: 'Player 4', imageUrl: null, gender: 'F', continent: 'Europe', country: 'Danemark', countryCode: 'DK', status: 'Actif', discipline: 'Simple', hand: 'Droitier', ageBracket: '30-35', heightBracket: '170-175', bestRanking: 'Top 5', bestOlympicMedal: 'Argent', majorTitles: '4-9', proStartDecade: '2010s' },
  { id: 'p5', name: 'Player 5', imageUrl: null, gender: 'H', continent: 'Asie', country: 'Japon', countryCode: 'JP', status: 'Actif', discipline: 'Simple', hand: 'Droitier', ageBracket: '25-30', heightBracket: '175-180', bestRanking: 'Top 3', bestOlympicMedal: 'Or', majorTitles: '10-19', proStartDecade: '2010s' },
];

describe('getDayNumber', () => {
  it('retourne 0 pour le 1er janvier 2026', () => {
    expect(getDayNumber(new Date('2026-01-01'))).toBe(0);
  });

  it('retourne 1 pour le 2 janvier 2026', () => {
    expect(getDayNumber(new Date('2026-01-02'))).toBe(1);
  });

  it('retourne 365 pour le 1er janvier 2027', () => {
    expect(getDayNumber(new Date('2027-01-01'))).toBe(365);
  });

  it('gère les dates antérieures à l\'epoch (valeur négative)', () => {
    const n = getDayNumber(new Date('2025-12-31'));
    expect(n).toBe(-1);
  });
});

describe('getDailyPlayer', () => {
  it('retourne toujours un joueur valide', () => {
    const player = getDailyPlayer(mockPlayers, new Date('2026-01-01'));
    expect(mockPlayers.some((p) => p.id === player.id)).toBe(true);
  });

  it('retourne le même joueur pour la même date', () => {
    const date = new Date('2026-05-16');
    const p1 = getDailyPlayer(mockPlayers, date);
    const p2 = getDailyPlayer(mockPlayers, date);
    expect(p1.id).toBe(p2.id);
  });

  it('retourne des joueurs différents pour des dates différentes (au moins certaines)', () => {
    const dates = Array.from({ length: 5 }, (_, i) => {
      const d = new Date('2026-01-01');
      d.setDate(d.getDate() + i);
      return d;
    });
    const players = dates.map((d) => getDailyPlayer(mockPlayers, d));
    const ids = new Set(players.map((p) => p.id));
    expect(ids.size).toBeGreaterThan(1);
  });

  it('cycle complet : les 5 joueurs apparaissent en 5 jours', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const d = new Date('2026-01-01');
      d.setDate(d.getDate() + i);
      ids.add(getDailyPlayer(mockPlayers, d).id);
    }
    expect(ids.size).toBe(5);
  });
});
