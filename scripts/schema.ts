import { z } from 'zod';

export const PlayerSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  imageUrl: z.string().nullable(), // local path (/players/x.jpg) or remote URL
  gender: z.enum(['H', 'F']),
  continent: z.enum(['Asie', 'Europe', 'Amériques', 'Océanie', 'Afrique']),
  country: z.string(),
  countryCode: z.string().length(2),
  status: z.enum(['Actif', 'Retraité']),
  discipline: z.enum(['Simple', 'Double', 'Double mixte']),
  hand: z.enum(['Droitier', 'Gaucher']),
  ageBracket: z.enum(['<25', '25-30', '30-35', '35-40', '>40']),
  heightBracket: z.enum(['<170', '170-175', '175-180', '180-185', '>185']),
  bestRanking: z.enum(['N°1', 'Top 3', 'Top 5', 'Top 10', 'Top 20']),
  bestOlympicMedal: z.enum(['Or', 'Argent', 'Bronze', 'Aucune']),
  majorTitles: z.enum(['0', '1-3', '4-9', '10-19', '20+']),
  proStartDecade: z.enum(['1990s', '2000s', '2010s', '2020s']),
});

export type PlayerSchemaType = z.infer<typeof PlayerSchema>;
