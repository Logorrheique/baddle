# Baddle 🏸

Jeu quotidien type Wordle pour les fans de badminton. Devine le joueur ou la joueuse mystère parmi 50 légendes du circuit professionnel.

## Démo

[https://baddle.app](https://baddle.app)

## Installation & développement

```bash
npm install
npm run dev       # Serveur de développement http://localhost:5173
npm run build     # Build de production dans dist/
npm run preview   # Prévisualiser le build
```

## Tests

```bash
npm test          # Tous les tests (parsers, transforms, comparison, dailyPlayer)
npm run test:watch
```

## Scraping des données

Les données des joueurs sont dans `src/data/players.json`. Pour les régénérer :

```bash
# Dry-run (3 joueurs test)
npm run scrape:dry

# Scraping complet (51 joueurs + images)
npm run scrape

# Validation
npm run validate-data
```

Les overrides manuels sont dans `scripts/manual-overrides.yaml`.

## Ajouter un joueur

1. Ajouter une entrée dans `scripts/players-list.ts` :
   ```typescript
   { slug: 'nom-joueur', wikiSlug: 'Nom_Wikipedia' }
   ```
2. Relancer `npm run scrape`
3. Si nécessaire, corriger des champs dans `scripts/manual-overrides.yaml`
4. Relancer `npm run validate-data`

## Déploiement (Vercel)

```bash
vercel --prod
```

La configuration est dans `vercel.json`. Le projet se déploie automatiquement depuis la branche `main`.

## Sources des données

- Fiches joueurs : [Wikipedia](https://en.wikipedia.org) (CC BY-SA)
- Photos : [Wikimedia Commons](https://commons.wikimedia.org) (licences libres)
- Classements et titres : [BWF Badminton World Federation](https://bwfbadminton.com)

## Structure

```
src/
  components/     # React components (Header, SearchInput, GuessRow, etc.)
  lib/            # Logique métier (comparison, dailyPlayer, storage, share)
  hooks/          # useGameState, useStats
  data/           # players.json (généré par le scraper)
  types/          # TypeScript types (Player, etc.)
scripts/
  scrape-players.ts     # Pipeline principal
  players-list.ts       # Liste des 51 joueurs
  parsers.ts            # Parsing Wikipedia
  transforms.ts         # Conversions → brackets
  manual-overrides.yaml # Corrections manuelles
  logs/                 # Rapport de scraping
public/
  players/        # Photos 400x400 JPG
```

## Crédits

Données Wikipedia sont sous licence [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).  
Inspiré par [Wordle](https://www.nytimes.com/games/wordle/index.html) et [Poeltl](https://poeltl.dunk.town/).
