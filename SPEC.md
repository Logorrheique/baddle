1. Vue d'ensemble du projet
Nom du projet : Badmintondle
Type : Jeu de devinette quotidien type Wordle/Loldle
Objectif : Deviner un joueur/joueuse de badminton mystère parmi 50 légendes, via des indices de comparaison
Public cible : Fans de badminton, joueurs amateurs et compétiteurs
Langue : Français (avec possibilité d'i18n EN plus tard)
2. Stack technique imposée
yamlFrontend:
  - Framework: React 18 + Vite
  - Language: TypeScript
  - Styling: Tailwind CSS v3
  - State: React useState/useContext (pas de Redux nécessaire)
  - Routing: React Router v6 (si plusieurs pages)
  
Données:
  - Format: JSON statique (src/data/players.json)
  - Pas de backend ni de base de données
  
Stockage local:
  - localStorage pour: partie du jour, historique, stats utilisateur
  
Build & Deploy:
  - Build: Vite
  - Hébergement: Vercel (config: vercel.json à inclure)
  
Tests:
  - Vitest pour la logique de comparaison
  - Pas de tests UI obligatoires en v1
3. Structure de fichiers attendue
badmintondle/
├── public/
│   ├── favicon.svg
│   └── players/              # Images des 50 joueurs (silhouettes en v2)
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── SearchInput.tsx       # Champ avec autocomplétion
│   │   ├── GuessRow.tsx          # Ligne de tentative avec les 12 cellules
│   │   ├── GuessTable.tsx        # Tableau des tentatives
│   │   ├── AttributeCell.tsx     # Cellule colorée (vert/orange/rouge)
│   │   ├── WinModal.tsx          # Modal de victoire avec partage
│   │   ├── StatsModal.tsx        # Stats personnelles
│   │   └── HowToPlay.tsx         # Modal règles
│   ├── data/
│   │   └── players.json          # Les 50 joueurs (rempli plus tard)
│   ├── lib/
│   │   ├── comparison.ts         # Logique de comparaison des attributs
│   │   ├── dailyPlayer.ts        # Sélection du joueur du jour (seed = date)
│   │   ├── storage.ts            # localStorage helpers
│   │   └── share.ts              # Génération du texte de partage
│   ├── types/
│   │   └── player.ts             # Interfaces TypeScript
│   ├── hooks/
│   │   ├── useGameState.ts
│   │   └── useStats.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   ├── comparison.test.ts
│   └── dailyPlayer.test.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
├── vercel.json
└── README.md
4. Modèle de données — Player
typescript// src/types/player.ts

export type Gender = 'H' | 'F';
export type Continent = 'Asie' | 'Europe' | 'Amériques' | 'Océanie' | 'Afrique';
export type Status = 'Actif' | 'Retraité';
export type Discipline = 'Simple' | 'Double' | 'Double mixte';
export type Hand = 'Droitier' | 'Gaucher';
export type AgeBracket = '<25' | '25-30' | '30-35' | '35-40' | '>40';
export type HeightBracket = '<170' | '170-175' | '175-180' | '180-185' | '>185';
export type RankingTier = 'N°1' | 'Top 3' | 'Top 5' | 'Top 10' | 'Top 20';
export type OlympicMedal = 'Or' | 'Argent' | 'Bronze' | 'Aucune';
export type TitlesTier = '0' | '1-3' | '4-9' | '10-19' | '20+';
export type Decade = '1990s' | '2000s' | '2010s' | '2020s';

export interface Player {
  id: string;                    // slug: "viktor-axelsen"
  name: string;                  // "Viktor Axelsen"
  imageUrl: string | null;       // URL ou null si pas d'image fiable
  gender: Gender;
  continent: Continent;
  country: string;               // "Danemark"
  countryCode: string;           // "DK" (ISO 3166-1 alpha-2, pour drapeaux)
  status: Status;
  discipline: Discipline;
  hand: Hand;
  ageBracket: AgeBracket;
  heightBracket: HeightBracket;
  bestRanking: RankingTier;
  bestOlympicMedal: OlympicMedal;
  majorTitles: TitlesTier;
  proStartDecade: Decade;
}
5. Logique de comparaison (cœur du jeu)
typescript// src/lib/comparison.ts

export type CellState = 'correct' | 'partial' | 'incorrect';
export type Arrow = 'up' | 'down' | null;

export interface CellResult {
  state: CellState;
  arrow: Arrow;
  value: string;
}

/**
 * Règles de comparaison par type d'attribut :
 * 
 * ATTRIBUTS PUREMENT CATÉGORIELS (vert ou rouge uniquement) :
 *   - gender, status, discipline, hand
 *   → 'correct' si identique, sinon 'incorrect'
 * 
 * ATTRIBUT PAYS (avec orange pour même continent) :
 *   - country
 *   → 'correct' si même pays
 *   → 'partial' si pays différents mais même continent
 *   → 'incorrect' sinon
 * 
 * ATTRIBUT CONTINENT pur (vert ou rouge) :
 *   - continent
 *   → 'correct' si identique, sinon 'incorrect'
 * 
 * ATTRIBUTS ORDONNÉS (avec orange + flèche) :
 *   - ageBracket, heightBracket, bestRanking, majorTitles, proStartDecade
 *   → 'correct' si même tranche
 *   → 'partial' si tranche adjacente (index ±1 dans l'ordre)
 *   → 'incorrect' sinon
 *   → flèche 'up' si la cible est dans une tranche supérieure, 'down' sinon
 * 
 * ATTRIBUT MÉDAILLE OLYMPIQUE :
 *   - bestOlympicMedal
 *   → ordre : Or > Argent > Bronze > Aucune
 *   → 'correct' si identique
 *   → 'partial' si médaille adjacente (ex: Or vs Argent)
 *   → 'incorrect' sinon
 *   → flèche selon ordre ci-dessus
 */

export function comparePlayer(
  guess: Player,
  target: Player
): Record<keyof Player, CellResult>;
Ordres ordinaux à respecter pour les flèches :
typescriptconst ORDERS = {
  ageBracket: ['<25', '25-30', '30-35', '35-40', '>40'],
  heightBracket: ['<170', '170-175', '175-180', '180-185', '>185'],
  bestRanking: ['Top 20', 'Top 10', 'Top 5', 'Top 3', 'N°1'], // du moins bon au meilleur
  majorTitles: ['0', '1-3', '4-9', '10-19', '20+'],
  proStartDecade: ['1990s', '2000s', '2010s', '2020s'],
  bestOlympicMedal: ['Aucune', 'Bronze', 'Argent', 'Or'],
};
6. Sélection du joueur du jour
typescript// src/lib/dailyPlayer.ts

/**
 * Le joueur du jour est déterministe et identique pour tous les utilisateurs.
 * Basé sur le nombre de jours depuis le 1er janvier 2026.
 * 
 * Algorithme :
 *   1. Calculer N = nombre de jours depuis EPOCH_DATE
 *   2. index = N % 50
 *   3. Le joueur est players[index] (après mélange déterministe avec seed fixe)
 * 
 * Pour éviter que ce soit le même ordre que players.json :
 *   - Mélanger la liste avec un seeded shuffle (seed constant)
 */

const EPOCH_DATE = new Date('2026-01-01T00:00:00Z');
const SHUFFLE_SEED = 42;

export function getDailyPlayer(players: Player[], date: Date = new Date()): Player;
export function getDayNumber(date: Date = new Date()): number;
7. État du jeu et persistance
typescript// localStorage keys

interface GameState {
  date: string;                  // "2026-05-16"
  guesses: string[];             // ids des joueurs proposés
  won: boolean;
  finished: boolean;
}

interface UserStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>;  // {1: 0, 2: 1, 3: 5, ...}
}

const STORAGE_KEYS = {
  GAME: 'badmintondle:game',
  STATS: 'badmintondle:stats',
  SETTINGS: 'badmintondle:settings',
};
Comportement :

Au chargement : vérifier si une partie du jour existe en localStorage
Si oui : restaurer l'état (tentatives, statut won/finished)
Si non : nouvelle partie
À chaque tentative : sauvegarder l'état
À la fin : mettre à jour les stats

8. Interface utilisateur
8.1 Layout général

Header fixe en haut : logo, titre, boutons (Stats, How to play, Settings)
Zone principale centrée, max-width 800px
Champ de recherche en bas (sticky sur mobile)
Le tableau des tentatives se remplit du bas vers le haut OU du haut vers le bas (au choix, mais cohérent)

8.2 SearchInput

Champ input avec autocomplétion
Affiche jusqu'à 6 suggestions filtrées
Filtre fuzzy sur le nom (lib suggérée : fuse.js ou implémentation maison simple)
Exclut les joueurs déjà proposés
Affiche l'image (ou initiales si pas d'image) + nom + drapeau du pays
Validation par clic ou touche Entrée

8.3 GuessRow

1 ligne par tentative
Header de ligne : photo + nom du joueur proposé
12 cellules pour les 12 attributs, dans l'ordre suivant :

Genre
Continent
Pays (avec drapeau)
Statut
Discipline
Main
Âge
Taille
Meilleur classement
Médaille olympique
Titres majeurs
Décennie début pro



8.4 AttributeCell

Fond coloré selon état : bg-green-500, bg-orange-400, bg-red-500
Texte centré, blanc, font-medium
Si attribut ordonné et état ≠ correct : afficher flèche ⬆️ ou ⬇️
Animation de retournement (CSS flip) au moment de l'apparition, séquentielle (delay de 100ms entre chaque cellule)

8.5 Responsive

Desktop : tableau full-width, toutes les colonnes visibles
Tablette : tableau scrollable horizontalement, première colonne (joueur) sticky
Mobile : idem tablette, cellules plus compactes

8.6 WinModal

S'affiche après victoire
Affiche : "Bravo ! Trouvé en X tentatives"
Photo et fiche du joueur trouvé
Bouton "Partager" : copie dans le presse-papier un texte type Wordle :

  Badmintondle #137 — 4/∞
  🟥🟧🟩🟩
  🟩🟥🟧🟩
  🟩🟧🟩🟧
  🟩🟩🟩🟩
  https://badmintondle.com

Compte à rebours jusqu'au prochain joueur (minuit local)
Bouton "Voir mes stats"

8.7 StatsModal

Parties jouées, % victoires, série actuelle, série max
Histogramme du nombre de tentatives par victoire

9. Design / Charte graphique
yamlCouleurs:
  Background: "#0f172a" (slate-900)
  Card: "#1e293b" (slate-800)
  Text primary: "#f8fafc" (slate-50)
  Text secondary: "#94a3b8" (slate-400)
  Accent: "#22c55e" (green-500) — couleur "correct"
  Partial: "#f97316" (orange-500)
  Incorrect: "#64748b" (slate-500) — gris foncé plutôt que rouge vif
  Border: "#334155" (slate-700)

Typo:
  Headings: "Inter", sans-serif, font-bold
  Body: "Inter", sans-serif, font-medium
  Numbers: "JetBrains Mono", monospace (pour les stats)

Spacing:
  Padding cellule: 8px (mobile), 12px (desktop)
  Gap entre cellules: 4px
  
Radius:
  Cellules: 6px
  Cards/modals: 12px

Logo/icone:
  Volant de badminton stylisé en SVG
10. Données : les 50 joueurs (À REMPLIR)
À faire séparément : Le fichier src/data/players.json doit contenir 50 entrées suivant exactement le schéma Player. La liste sera fournie dans un second temps après collecte des données.
Critères de sélection des 50 joueurs :

Mix hommes/femmes (objectif 25/25)
Mix actifs/retraités (objectif ~30 actifs / ~20 légendes retraitées)
Diversité géographique (pas uniquement Asie)
Diversité des disciplines (simple, double, double mixte)
Tous doivent être notoires : médaillés JO, champions du monde, ou N°1 mondial à un moment de leur carrière
Pour les images : utiliser uniquement des photos officielles BWF ou laisser imageUrl: null (cohérence visuelle obligatoire)

11. Pages / écrans

Page principale (/) : le jeu
Modal "How to play" : règles et code couleur
Modal "Stats" : statistiques personnelles
Page "À propos" (/about) : crédits, source des données, lien BWF
Page "Mentions légales" (/legal) : RGPD minimal (pas de cookies, juste localStorage)

12. Fonctionnalités v1 vs v2
v1 (MVP, à livrer en premier) :

✅ Tableau de comparaison 12 attributs
✅ Champ recherche avec autocomplétion
✅ Joueur du jour déterministe
✅ Sauvegarde locale de la partie et des stats
✅ Modal de victoire + partage
✅ Modal "How to play"
✅ Responsive mobile/desktop

v2 (post-MVP) :

🔄 Mode "Silhouette" : deviner à partir d'une silhouette qui se révèle
🔄 Mode "Citation" : deviner à partir d'une citation
🔄 Mode "Palmarès" : deviner à partir d'une liste de titres
🔄 Mode "Free play" : jouer en illimité avec joueurs aléatoires
🔄 i18n EN/FR
🔄 Dark/light mode

13. Accessibilité

Tous les éléments interactifs avec aria-labels
Navigation clavier complète (Tab, Entrée, Échap)
Contraste AA minimum
Ne PAS se reposer uniquement sur la couleur pour les états (utiliser aussi des icônes ✓ ✗ et les flèches)

14. SEO & meta
html<title>Badmintondle — Devine le joueur de badminton du jour</title>
<meta name="description" content="Un jeu quotidien pour les fans de badminton. Devine le joueur ou la joueuse mystère parmi 50 légendes." />
<meta property="og:image" content="/og-image.png" />
15. README à générer
Le README doit contenir :

Description du projet
Stack technique
Instructions d'installation locale (npm install, npm run dev)
Instructions de build et déploiement
Structure du projet
Comment ajouter un joueur (format JSON attendu)
Crédits (données BWF)

16. Critères d'acceptation (à valider par Claude Code)

 Le projet build sans erreur (npm run build)
 TypeScript strict mode activé, aucun any
 Lint passe (npm run lint)
 Tests de la logique de comparaison passent
 Le jeu est jouable de bout en bout avec 5 joueurs de test dans players.json
 La sélection quotidienne change bien à minuit
 Le partage copie bien dans le presse-papier
 L'app est responsive mobile (testée à 375px de large)
 localStorage persiste correctement entre rechargements
