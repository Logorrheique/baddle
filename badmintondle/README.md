# Badmintondle

Jeu de devinette quotidien pour les fans de badminton. Devine le joueur ou la joueuse mystère parmi 50 légendes via des indices de comparaison — inspiré de Wordle et Loldle.

## Stack technique

- **React 18 + Vite** — UI et bundler
- **TypeScript** — typage strict
- **Tailwind CSS v3** — styles utilitaires
- **Fuse.js** — recherche fuzzy pour l'autocomplétion
- **Vitest** — tests unitaires de la logique

## Installation locale

```bash
cd badmintondle
npm install
npm run dev
```

L'app est accessible sur [http://localhost:5173](http://localhost:5173).

## Build et déploiement

```bash
npm run build     # Compile TypeScript + bundle Vite → dist/
npm run preview   # Prévisualise le build localement
```

Déploiement sur Vercel : le fichier `vercel.json` est inclus avec les rewrites SPA. Il suffit d'importer le repo sur [vercel.com](https://vercel.com).

## Tests

```bash
npm run test          # Exécute tous les tests Vitest
npm run test:watch    # Mode watch
```

## Structure du projet

```
badmintondle/
├── public/
│   ├── favicon.svg
│   └── players/          # Images des joueurs (optionnel)
├── src/
│   ├── components/       # Header, SearchInput, GuessRow, GuessTable,
│   │                     # AttributeCell, WinModal, StatsModal, HowToPlay
│   ├── data/
│   │   └── players.json  # Les 50 joueurs
│   ├── hooks/
│   │   ├── useGameState.ts
│   │   └── useStats.ts
│   ├── lib/
│   │   ├── comparison.ts    # Logique de comparaison des attributs
│   │   ├── dailyPlayer.ts   # Sélection déterministe du joueur du jour
│   │   ├── storage.ts       # Helpers localStorage
│   │   └── share.ts         # Génération du texte de partage
│   └── types/
│       └── player.ts        # Interfaces TypeScript
└── tests/                # Tests Vitest
```

## Ajouter un joueur

Ajoute une entrée dans `src/data/players.json` en respectant exactement ce schéma :

```json
{
  "id": "prenom-nom",
  "name": "Prénom Nom",
  "imageUrl": null,
  "gender": "H",
  "continent": "Europe",
  "country": "Danemark",
  "countryCode": "DK",
  "status": "Actif",
  "discipline": "Simple",
  "hand": "Droitier",
  "ageBracket": "30-35",
  "heightBracket": ">185",
  "bestRanking": "N°1",
  "bestOlympicMedal": "Or",
  "majorTitles": "20+",
  "proStartDecade": "2010s"
}
```

Valeurs autorisées :

| Champ | Valeurs |
|---|---|
| `gender` | `H`, `F` |
| `continent` | `Asie`, `Europe`, `Amériques`, `Océanie`, `Afrique` |
| `status` | `Actif`, `Retraité` |
| `discipline` | `Simple`, `Double`, `Double mixte` |
| `hand` | `Droitier`, `Gaucher` |
| `ageBracket` | `<25`, `25-30`, `30-35`, `35-40`, `>40` |
| `heightBracket` | `<170`, `170-175`, `175-180`, `180-185`, `>185` |
| `bestRanking` | `N°1`, `Top 3`, `Top 5`, `Top 10`, `Top 20` |
| `bestOlympicMedal` | `Or`, `Argent`, `Bronze`, `Aucune` |
| `majorTitles` | `0`, `1-3`, `4-9`, `10-19`, `20+` |
| `proStartDecade` | `1990s`, `2000s`, `2010s`, `2020s` |

## Crédits

Données issues de la [Badminton World Federation (BWF)](https://bwfbadminton.com). Ce projet n'est pas affilié à la BWF.
