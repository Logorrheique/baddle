import type { Language, Player } from '../types/player.ts';

type Messages = Record<string, string>;

const fr: Messages = {
  'app.title':            'Le Wordle du Badminton',
  'app.intro':            'Devine le joueur mystère parmi',
  'app.intro.players':    'légendes',
  'app.intro.frSuffix':   'du badminton français',
  'app.intro.empty':      'Commence par chercher un joueur ci-dessus.',
  'app.about':            'À propos',
  'app.legal':            'Mentions légales',
  'header.howToPlay':     'Comment jouer',
  'header.stats':         'Statistiques',
  'mode.intl':            'International',
  'mode.fr':              'France',
  'practice.button':      'Entraînement',
  'practice.exit':        'Quitter l’entraînement',
  'practice.intro':       'Mode entraînement — autant de parties que tu veux, les stats du jour ne sont pas affectées.',
  'practice.newGame':     'Nouvelle partie',
  'search.placeholder':   'Rechercher un joueur…',
  'search.disabled':      'Partie terminée !',
  'col.gender':           'Genre',
  'col.gender.short':     'Genre',
  'col.country':          'Pays',
  'col.country.short':    'Pays',
  'col.status':           'Statut',
  'col.status.short':     'Statut',
  'col.discipline':       'Discipline',
  'col.discipline.short': 'Disc.',
  'col.hand':             'Main',
  'col.hand.short':       'Main',
  'col.age':              'Âge',
  'col.age.short':        'Âge',
  'col.height':           'Taille',
  'col.height.short':     'Taille',
  'col.ranking':          'Classement',
  'col.ranking.short':    'Clas.',
  'how.title':            'Comment jouer',
  'how.intro':            'Devine le {0} mystère parmi les légendes du badminton.',
  'how.player':           'joueur ou la joueuse',
  'how.green':            'Attribut identique',
  'how.orange':           'Proche (palier adjacent)',
  'how.grey':             'Incorrect',
  'how.arrows':           '↑ ↓ indiquent si la valeur cible est plus grande ou plus petite.',
  'how.cta':              'Jouer',
  'win.title':            'Bravo',
  'win.found':            'Trouvé en {0} essai{1} —',
  'win.next':             'Prochain joueur dans',
  'win.stats':            'Stats',
  'win.share':            'Partager',
  'win.copied':           'Copié',
  'stats.title':          'Statistiques',
  'stats.played':         'Parties',
  'stats.wins':           'Victoires',
  'stats.streak':         'Série',
  'stats.maxStreak':      'Record',
  'stats.distribution':   'Distribution',
  'stats.close':          'Fermer',
  'about.title':          'À propos de Baddle',
  'about.body1':          'Jeu quotidien inspiré de Wordle, dédié au badminton. Devine le joueur mystère parmi les légendes du circuit.',
  'about.body2':          'Deux modes : International (~100 joueurs) ou France (~30 joueurs).',
  'about.data':           'Données :',
  'about.back':           '← Retour',
  'legal.title':          'Mentions légales',
  'legal.body1':          'Projet personnel à but non commercial.',
  'legal.body2':          'Aucun cookie de traçage. Progression stockée localement (localStorage).',
  'legal.body3':          'Photos : Wikimedia Commons (CC BY-SA).',
};

const en: Messages = {
  'app.title':            'The Badminton Wordle',
  'app.intro':            'Guess the mystery player among',
  'app.intro.players':    'legends',
  'app.intro.frSuffix':   'of French badminton',
  'app.intro.empty':      'Start by searching for a player above.',
  'app.about':            'About',
  'app.legal':            'Legal',
  'header.howToPlay':     'How to play',
  'header.stats':         'Statistics',
  'mode.intl':            'International',
  'mode.fr':              'France',
  'practice.button':      'Practice',
  'practice.exit':        'Exit practice',
  'practice.intro':       'Practice mode — as many games as you want, daily stats are unaffected.',
  'practice.newGame':     'New game',
  'search.placeholder':   'Search a player…',
  'search.disabled':      'Game over!',
  'col.gender':           'Gender',
  'col.gender.short':     'Gen.',
  'col.country':          'Country',
  'col.country.short':    'Country',
  'col.status':           'Status',
  'col.status.short':     'Status',
  'col.discipline':       'Discipline',
  'col.discipline.short': 'Disc.',
  'col.hand':             'Hand',
  'col.hand.short':       'Hand',
  'col.age':              'Age',
  'col.age.short':        'Age',
  'col.height':           'Height',
  'col.height.short':     'Height',
  'col.ranking':          'Ranking',
  'col.ranking.short':    'Rank.',
  'how.title':            'How to play',
  'how.intro':            'Guess the mystery {0} among the badminton legends.',
  'how.player':           'player',
  'how.green':            'Matching attribute',
  'how.orange':           'Close (adjacent tier)',
  'how.grey':             'Incorrect',
  'how.arrows':           '↑ ↓ indicate if the target value is higher or lower.',
  'how.cta':              'Play',
  'win.title':            'Well played',
  'win.found':            'Found in {0} guess{1} —',
  'win.next':             'Next player in',
  'win.stats':            'Stats',
  'win.share':            'Share',
  'win.copied':           'Copied',
  'stats.title':          'Statistics',
  'stats.played':         'Played',
  'stats.wins':           'Wins',
  'stats.streak':         'Streak',
  'stats.maxStreak':      'Max streak',
  'stats.distribution':   'Distribution',
  'stats.close':          'Close',
  'about.title':          'About Baddle',
  'about.body1':          'Daily game inspired by Wordle, dedicated to badminton. Guess the mystery player among the circuit legends.',
  'about.body2':          'Two modes: International (~100 players) or France (~30 players).',
  'about.data':           'Data:',
  'about.back':           '← Back',
  'legal.title':          'Legal notice',
  'legal.body1':          'Personal non-commercial project.',
  'legal.body2':          'No tracking cookies. Progress stored locally (localStorage).',
  'legal.body3':          'Photos: Wikimedia Commons (CC BY-SA).',
};

const DICTS: Record<Language, Messages> = { fr, en };

export function t(key: string, lang: Language, ...args: string[]): string {
  const dict = DICTS[lang] ?? fr;
  let raw = dict[key] ?? fr[key] ?? key;
  args.forEach((v, i) => { raw = raw.replace(`{${i}}`, v); });
  return raw;
}

// ── Display value translations (player data) ────────────────

const DISCIPLINE_EN: Record<string, string> = {
  'Simple': 'Singles', 'Double': 'Doubles', 'Double mixte': 'Mixed Doubles',
};

const STATUS_EN: Record<string, string> = {
  'Actif': 'Active', 'Retraité': 'Retired',
};

const COUNTRY_FR_TO_EN: Record<string, string> = {
  'Chine': 'China', 'Japon': 'Japan', 'Corée du Sud': 'South Korea',
  'Indonésie': 'Indonesia', 'Malaisie': 'Malaysia', 'Inde': 'India',
  'Thaïlande': 'Thailand', 'Taïwan': 'Taiwan', 'Singapour': 'Singapore',
  'Hong Kong': 'Hong Kong', 'Danemark': 'Denmark', 'Angleterre': 'England',
  'France': 'France', 'Allemagne': 'Germany', 'Espagne': 'Spain',
  'Pays-Bas': 'Netherlands', 'Royaume-Uni': 'United Kingdom',
  'États-Unis': 'United States', 'Bulgarie': 'Bulgaria',
};

/**
 * Translates the displayed cell value based on attribute key, language, and player gender.
 * For 'hand' returns 'Droitière'/'Gauchère' in FR for women.
 */
export function displayCellValue(
  attribute: 'gender' | 'country' | 'status' | 'discipline' | 'hand' | 'ageBracket' | 'heightBracket' | 'bestRanking',
  rawValue: string,
  player: Pick<Player, 'gender'>,
  lang: Language,
): string {
  if (attribute === 'gender') {
    return rawValue; // 'H' or 'F'
  }
  if (lang === 'en') {
    if (attribute === 'country')    return COUNTRY_FR_TO_EN[rawValue] ?? rawValue;
    if (attribute === 'discipline') return DISCIPLINE_EN[rawValue] ?? rawValue;
    if (attribute === 'status')     return STATUS_EN[rawValue]     ?? rawValue;
    if (attribute === 'hand')       return rawValue === 'Gaucher' ? 'Left' : 'Right';
    return rawValue; // brackets, ranking tiers identical
  }
  // FR
  if (attribute === 'hand' && player.gender === 'F') {
    if (rawValue === 'Droitier') return 'Droitière';
    if (rawValue === 'Gaucher')  return 'Gauchère';
  }
  return rawValue;
}
