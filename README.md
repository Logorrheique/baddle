# Baddle 🏸

Jeu quotidien type Wordle pour les fans de badminton. Devine le joueur ou la joueuse mystère parmi 100 légendes du circuit professionnel.

## Stack

- **React 18** + **TypeScript** + **Vite**
- **TailwindCSS** (palette Wordle-like, dark mode warm stone)
- **Vitest** pour les tests unitaires
- Scraping Wikipedia via **axios** + **cheerio** + **sharp** (resize images)

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

Les données des joueurs sont dans `src/data/players.json` (généré). Pour les régénérer :

```bash
npm run scrape:dry      # Dry-run (3 joueurs test, sans téléchargement images)
npm run scrape          # Scraping complet (~100 joueurs + images)
npm run validate-data   # Vérifie l'intégrité du JSON
```

Le rapport de scraping est écrit dans `scripts/logs/scraping-report.md` (succès/échecs/warnings/distribution).

## Ajouter un joueur

1. Ajouter une entrée dans `scripts/players-list.ts` :
   ```typescript
   { slug: 'nom-joueur', wikiSlug: 'Nom_Wikipedia', gender: 'H' | 'F' }
   ```
   Le `gender` est optionnel mais recommandé (sinon détection heuristique sur le texte de l'intro).
2. Relancer `npm run scrape`
3. Si nécessaire, corriger des champs dans `scripts/manual-overrides.yaml` (ex. : status retraité, titres, médailles)
4. Relancer `npm run validate-data`

## Direction artistique

Palette Wordle officielle, fond stone-900 warm :

| Token | Valeur | Usage |
|-------|--------|-------|
| `court-dark` | `#1c1917` | Fond principal |
| `court-mid` | `#292524` | Cards / inputs |
| `court-surface` | `#3a3431` | Hover, surface élevée |
| `court-line` | `#44403c` | Bordures |
| `shuttle-white` | `#fafaf9` | Texte primaire |
| `shuttle-feather` | `#a8a29e` | Texte secondaire |
| `ace-green` | `#6aaa64` | Correct (Wordle green) |
| `racket-orange` | `#c9b458` | Partial (Wordle yellow) |
| `miss-grey` | `#78716c` | Incorrect |

Cellules carrées (aspect-square) avec bordures 2px et animation flip à la révélation, proportions inspirées de [onepiecedle.net](https://onepiecedle.net/classic).

## Déploiement

### Railway (production)

Le projet est configuré pour Railway via `railway.json` + `serve` (statique SPA).

```bash
# Première fois (CLI)
railway login
railway link              # lier au projet existant ou en créer un
railway up                # déploie depuis la branche locale
```

Configuration appliquée :
- **Build** : `npm ci && npm run build` (Nixpacks auto-detect Node ≥20)
- **Start** : `npm start` → `serve -s dist -l $PORT` (SPA fallback inclus)
- **Healthcheck** : `GET /` doit répondre 200 sous 60s
- **Restart policy** : 3 retries en cas d'échec

Variables d'environnement : aucune requise (`PORT` injecté par Railway).

### Vercel (alternative)

```bash
vercel --prod
```

Config : `vercel.json` (framework Vite + rewrites SPA).

## Sources des données

- Fiches joueurs : [Wikipedia](https://en.wikipedia.org) (CC BY-SA)
- Photos : [Wikimedia Commons](https://commons.wikimedia.org) (licences libres)
- Classements et titres : agrégés depuis l'intro Wikipedia + overrides manuels

## Structure

```
src/
  components/     # React components (Header, SearchInput, GuessRow, AttributeCell, modals)
  lib/            # Logique métier (comparison, dailyPlayer, storage, share)
  hooks/          # useGameState, useStats, useEscapeKey
  data/           # players.json (généré par le scraper)
  types/          # TypeScript types (Player, Gender, Continent, etc.)
scripts/
  scrape-players.ts     # Pipeline principal de scraping
  players-list.ts       # Liste des ~100 joueurs (slug + wikiSlug + gender)
  parsers.ts            # Parsing Wikipedia (date, taille, classement, etc.)
  transforms.ts         # Conversions valeurs exactes → brackets/tiers
  detect-discipline.ts  # Détection Simple/Double/Double mixte + status retraité
  olympic-medals.ts     # Extraction médailles olympiques
  count-titles.ts       # Compte des titres majeurs (BWF World Tour Finals, All England, etc.)
  apply-overrides.ts    # Applique manual-overrides.yaml par-dessus le scrape
  manual-overrides.yaml # Corrections manuelles (status, titles, medals)
  schema.ts             # Zod schema validateur post-overrides
  logs/                 # Rapport de scraping généré
public/
  players/        # Photos 400x400 JPG (resized par sharp)
```

## Crédits

Données Wikipedia sous licence [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
Inspiré par [Wordle](https://www.nytimes.com/games/wordle/index.html), [Poeltl](https://poeltl.dunk.town/) et [Onepiecedle](https://onepiecedle.net/).
