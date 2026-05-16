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
  id: string;
  name: string;
  imageUrl: string | null;
  gender: Gender;
  continent: Continent;
  country: string;
  countryCode: string;
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
