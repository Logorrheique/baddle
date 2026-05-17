import type {
  AgeBracket, HeightBracket, RankingTier, TitlesTier,
} from '../src/types/player.js';

export function ageToBracket(age: number): AgeBracket {
  if (age < 25) return '<25';
  if (age < 30) return '25-30';
  if (age < 35) return '30-35';
  if (age < 40) return '35-40';
  return '>40';
}

export function heightToBracket(cm: number): HeightBracket {
  if (cm < 170) return '<170';
  if (cm < 175) return '170-175';
  if (cm < 180) return '175-180';
  if (cm < 185) return '180-185';
  return '>185';
}

export function rankingToTier(rank: number): RankingTier {
  if (rank === 1) return 'N°1';
  if (rank === 2) return 'Top 2';
  if (rank === 3) return 'Top 3';
  if (rank === 4) return 'Top 4';
  if (rank === 5) return 'Top 5';
  if (rank <= 10) return 'Top 10';
  if (rank <= 20) return 'Top 20';
  return 'Top 50';
}

export function titlesToTier(count: number): TitlesTier {
  if (count === 0) return '0';
  if (count <= 3) return '1-3';
  if (count <= 9) return '4-9';
  if (count <= 19) return '10-19';
  return '20+';
}

// Country name (English) → ISO 3166-1 alpha-2
export const COUNTRY_TO_CODE: Record<string, string> = {
  China: 'CN', Japan: 'JP', 'South Korea': 'KR', Indonesia: 'ID',
  Malaysia: 'MY', India: 'IN', Thailand: 'TH', Taiwan: 'TW',
  Singapore: 'SG', 'Hong Kong': 'HK', Vietnam: 'VN',
  'Chinese Taipei': 'TW', 'Sri Lanka': 'LK', Bangladesh: 'BD',
  Philippines: 'PH', Myanmar: 'MM', Cambodia: 'KH', Pakistan: 'PK',
  Denmark: 'DK', England: 'GB', Scotland: 'GB', 'Great Britain': 'GB',
  France: 'FR', Germany: 'DE', Spain: 'ES', Netherlands: 'NL',
  Sweden: 'SE', Norway: 'NO', Finland: 'FI', Switzerland: 'CH',
  Russia: 'RU', Ukraine: 'UA', Poland: 'PL', Belgium: 'BE',
  'United Kingdom': 'GB', Bulgaria: 'BG', Romania: 'RO',
  'United States': 'US', Canada: 'CA', Brazil: 'BR', Mexico: 'MX',
  Peru: 'PE', Colombia: 'CO', Guatemala: 'GT', Argentina: 'AR', Chile: 'CL',
  Australia: 'AU', 'New Zealand': 'NZ',
  'South Africa': 'ZA', Egypt: 'EG', Nigeria: 'NG', Kenya: 'KE',
  Morocco: 'MA', Algeria: 'DZ',
};

// Country name (English) → French
export const COUNTRY_EN_TO_FR: Record<string, string> = {
  China: 'Chine', Japan: 'Japon', 'South Korea': 'Corée du Sud',
  Indonesia: 'Indonésie', Malaysia: 'Malaisie', India: 'Inde',
  Thailand: 'Thaïlande', Taiwan: 'Taïwan', Singapore: 'Singapour',
  'Hong Kong': 'Hong Kong', Vietnam: 'Vietnam', 'Chinese Taipei': 'Taïpei chinois',
  'Sri Lanka': 'Sri Lanka', Bangladesh: 'Bangladesh', Philippines: 'Philippines',
  Myanmar: 'Myanmar', Cambodia: 'Cambodge', Pakistan: 'Pakistan',
  Denmark: 'Danemark', England: 'Angleterre', Scotland: 'Écosse',
  'Great Britain': 'Grande-Bretagne', France: 'France', Germany: 'Allemagne',
  Spain: 'Espagne', Netherlands: 'Pays-Bas', Sweden: 'Suède', Norway: 'Norvège',
  Finland: 'Finlande', Switzerland: 'Suisse', Russia: 'Russie',
  Ukraine: 'Ukraine', Poland: 'Pologne', Belgium: 'Belgique',
  'United Kingdom': 'Royaume-Uni', Bulgaria: 'Bulgarie', Romania: 'Roumanie',
  'United States': 'États-Unis', Canada: 'Canada', Brazil: 'Brésil',
  Mexico: 'Mexique', Peru: 'Pérou', Colombia: 'Colombie',
  Guatemala: 'Guatemala', Argentina: 'Argentine', Chile: 'Chili',
  Australia: 'Australie', 'New Zealand': 'Nouvelle-Zélande',
  'South Africa': 'Afrique du Sud', Egypt: 'Égypte', Nigeria: 'Nigéria',
  Kenya: 'Kenya', Morocco: 'Maroc', Algeria: 'Algérie',
};
