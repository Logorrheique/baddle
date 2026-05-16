import axios from 'axios';
import * as cheerio from 'cheerio';
import chalk from 'chalk';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import pLimit from 'p-limit';

import { PLAYERS_TO_SCRAPE, type PlayerEntry } from './players-list.js';
import { getCached, setCached } from './cache.js';
import { rateLimit, USER_AGENT } from './ethics.js';
import { extractInfobox, getField } from './extract-infobox.js';
import { parseBirthDate, parseHeight, parseHandedness, parseHighestRanking, parseCountry, calculateAge } from './parsers.js';
import { ageToBracket, heightToBracket, rankingToTier, titlesToTier, COUNTRY_TO_CONTINENT, COUNTRY_TO_CODE, COUNTRY_EN_TO_FR } from './transforms.js';
import { detectDiscipline, detectRetired } from './detect-discipline.js';
import { extractOlympicMedal } from './olympic-medals.js';
import { countMajorTitles } from './count-titles.js';
import { applyOverrides } from './apply-overrides.js';
import { downloadAndResizeImage } from './download-image.js';
import { PlayerSchema } from './schema.js';
import { WIKI_BASE, FIELD_LABELS } from './wikipedia-selectors.js';
import type { Player, Decade, Hand, AgeBracket, HeightBracket, RankingTier, OlympicMedal, TitlesTier } from '../src/types/player.js';

const isDryRun = process.argv.includes('--dry-run');
const DRY_RUN_SLUGS = ['viktor-axelsen', 'an-seyoung', 'lin-dan'];

interface ScrapeResult {
  player: Player | null;
  slug: string;
  errors: string[];
  warnings: string[];
}

async function fetchWikipedia(wikiSlug: string): Promise<string> {
  const url = WIKI_BASE + wikiSlug;
  const cached = getCached(url);
  if (cached) return cached;

  await rateLimit('wikipedia');
  const res = await axios.get(url, {
    headers: { 'User-Agent': USER_AGENT },
    timeout: 15000,
  });
  setCached(url, res.data as string);
  return res.data as string;
}

/**
 * Fetches the proper thumbnail URL from the Wikipedia Action API.
 * Wikimedia only serves thumbnails at specific sizes; this gets a valid one.
 */
async function fetchImageUrl(wikiSlug: string): Promise<string | null> {
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${wikiSlug}&prop=pageimages&format=json&pithumbsize=400`;
  const cacheKey = `img:${wikiSlug}`;
  const cached = getCached(cacheKey);
  if (cached) return cached === 'null' ? null : cached;

  await rateLimit('wikipedia');
  try {
    const res = await axios.get(apiUrl, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 10000,
    });
    const pages = (res.data as { query: { pages: Record<string, { thumbnail?: { source: string } }> } }).query.pages;
    const page = Object.values(pages)[0];
    const src = page?.thumbnail?.source ?? null;
    setCached(cacheKey, src ?? 'null');
    return src;
  } catch {
    setCached(cacheKey, 'null');
    return null;
  }
}

function detectProStartDecade(introText: string, fields: Record<string, string>, birthYear: number | null): Decade {
  for (const label of FIELD_LABELS.turned_pro) {
    const val = getField(fields, label);
    if (val) {
      const match = val.match(/(\d{4})/);
      if (match) {
        const year = parseInt(match[1], 10);
        if (year >= 1990 && year < 2030) return yearToDecade(year);
      }
    }
  }

  const proMatch = introText.match(/turned\s+(?:professional|pro)\s+in\s+(\d{4})/i);
  if (proMatch) return yearToDecade(parseInt(proMatch[1], 10));

  if (birthYear) return yearToDecade(birthYear + 18);
  return '2010s';
}

function yearToDecade(year: number): Decade {
  if (year < 2000) return '1990s';
  if (year < 2010) return '2000s';
  if (year < 2020) return '2010s';
  return '2020s';
}

function detectGender(introText: string, categories: string[]): 'H' | 'F' | null {
  const combined = (introText + ' ' + categories.join(' ')).toLowerCase();

  const femaleSignals = ["women's", 'female badminton', ' she ', ' her badminton', 'female player'];
  if (femaleSignals.some(s => combined.includes(s))) return 'F';

  const maleSignals = ["men's", ' he ', ' his badminton', 'male player'];
  if (maleSignals.some(s => combined.includes(s))) return 'H';

  return null;
}

async function scrapePlayer(entry: PlayerEntry): Promise<ScrapeResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    console.log(chalk.blue(`  Scraping ${entry.slug}...`));
    const html = await fetchWikipedia(entry.wikiSlug);
    const $ = cheerio.load(html);
    const { fields, introText, categories, imageUrl: rawImageUrl } = extractInfobox($);

    // Birth date & age
    const bornRaw = getField(fields, ...FIELD_LABELS.born);
    const birthDate = bornRaw ? parseBirthDate(bornRaw) : null;
    const age = birthDate ? calculateAge(birthDate) : null;
    const birthYear = birthDate ? birthDate.getUTCFullYear() : null;

    if (!birthDate) warnings.push('birth date missing or unparseable');
    if (age !== null && (age < 15 || age > 80)) warnings.push(`suspicious age: ${age}`);

    // Country
    const countryRaw = getField(fields, ...FIELD_LABELS.country);
    const countryEn = countryRaw ? parseCountry(countryRaw) : null;
    const continent = countryEn ? (COUNTRY_TO_CONTINENT[countryEn] ?? null) : null;
    const countryCode = countryEn ? (COUNTRY_TO_CODE[countryEn] ?? null) : null;
    const countryFr = countryEn ? (COUNTRY_EN_TO_FR[countryEn] ?? countryEn) : null;

    if (!continent) warnings.push(`unknown continent for country: "${countryEn}"`);
    if (!countryCode) warnings.push(`unknown country code for: "${countryEn}"`);

    // Height
    const heightRaw = getField(fields, ...FIELD_LABELS.height);
    const heightCm = heightRaw ? parseHeight(heightRaw) : null;
    if (!heightCm) warnings.push('height missing or unparseable');

    // Handedness
    const handRaw = getField(fields, ...FIELD_LABELS.hand);
    let hand: Hand = 'Droitier';
    if (handRaw) {
      const parsed = parseHandedness(handRaw);
      if (parsed) hand = parsed;
      else warnings.push(`unparseable handedness: "${handRaw}"`);
    } else {
      warnings.push('handedness not found, defaulting to Droitier');
    }

    // Best world ranking
    const rankingRaw = getField(fields, ...FIELD_LABELS.worldRanking);
    const rankingNum = rankingRaw ? parseHighestRanking(rankingRaw) : null;
    if (!rankingNum) warnings.push('best ranking missing');

    const gender = entry.gender ?? detectGender(introText, categories) ?? 'H';
    if (!entry.gender && !detectGender(introText, categories)) {
      warnings.push('gender not detected, defaulting to H');
    }
    const discipline = detectDiscipline(introText, categories);
    const isRetired = detectRetired(introText, categories);
    const olympicMedal = extractOlympicMedal($, introText, categories);
    const titlesCount = countMajorTitles(introText);
    const proStartDecade = detectProStartDecade(introText, fields, birthYear);

    const ageBracket: AgeBracket = age !== null ? ageToBracket(age) : '30-35';
    const heightBracket: HeightBracket = heightCm !== null ? heightToBracket(heightCm) : '175-180';
    const bestRanking: RankingTier = rankingNum !== null ? rankingToTier(rankingNum) : 'Top 50';
    const majorTitles: TitlesTier = titlesToTier(titlesCount);
    const bestOlympicMedal: OlympicMedal = olympicMedal;

    // Download image (skip in dry-run)
    let imageUrl: string | null = rawImageUrl;
    if (!isDryRun) {
      // Primary: Wikipedia pageimages API (returns free-licensed thumbnails)
      const apiImageUrl = await fetchImageUrl(entry.wikiSlug);
      const sourceUrl = apiImageUrl ?? rawImageUrl; // fallback to infobox img src

      if (sourceUrl) {
        imageUrl = await downloadAndResizeImage(entry.slug, sourceUrl);
        if (!imageUrl) warnings.push('image download failed, imageUrl set to null');
      } else {
        imageUrl = null;
        warnings.push('no image found');
      }
    }

    const raw: Player = {
      id: entry.slug,
      name: $('h1#firstHeading').text().trim() || entry.slug,
      imageUrl,
      gender,
      continent: continent ?? 'Asie',
      country: countryFr ?? countryEn ?? 'Inconnu',
      countryCode: countryCode ?? 'XX',
      status: isRetired ? 'Retraité' : 'Actif',
      discipline,
      hand,
      ageBracket,
      heightBracket,
      bestRanking,
      bestOlympicMedal,
      majorTitles,
      proStartDecade,
    };

    const withOverrides = applyOverrides(raw);

    const validated = PlayerSchema.safeParse(withOverrides);
    if (!validated.success) {
      const issues = validated.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
      errors.push(...issues);
      // Return partial player even on validation error so we can report it
      return { player: null, slug: entry.slug, errors, warnings };
    }

    console.log(chalk.green(`  ✓ ${entry.slug}`));
    return { player: validated.data as Player, slug: entry.slug, errors, warnings };

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`fatal: ${msg}`);
    console.log(chalk.red(`  ✗ ${entry.slug} — ${msg}`));
    return { player: null, slug: entry.slug, errors, warnings };
  }
}

function generateReport(results: ScrapeResult[], players: Player[]): string {
  const succeeded = results.filter(r => r.player !== null);
  const failed = results.filter(r => r.player === null);

  const continentCounts: Record<string, number> = {};
  const genderCounts: Record<string, number> = { H: 0, F: 0 };
  const disciplineCounts: Record<string, number> = {};
  players.forEach(p => {
    continentCounts[p.continent] = (continentCounts[p.continent] ?? 0) + 1;
    genderCounts[p.gender]++;
    disciplineCounts[p.discipline] = (disciplineCounts[p.discipline] ?? 0) + 1;
  });

  const nullImages = players.filter(p => !p.imageUrl).map(p => p.id);

  const lines: string[] = [
    '# Baddle — Scraping Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Synthèse',
    '',
    `- **Succès** : ${succeeded.length}/${results.length}`,
    `- **Échecs** : ${failed.length}`,
    `- **Images manquantes** : ${nullImages.length}`,
    '',
    '## Distribution',
    '',
    '### Genre',
    ...Object.entries(genderCounts).map(([g, n]) => `- ${g === 'H' ? 'Hommes' : 'Femmes'} : ${n}`),
    '',
    '### Continents',
    ...Object.entries(continentCounts).sort((a, b) => b[1] - a[1]).map(([c, n]) => `- ${c} : ${n}`),
    '',
    '### Disciplines',
    ...Object.entries(disciplineCounts).map(([d, n]) => `- ${d} : ${n}`),
    '',
  ];

  if (failed.length > 0) {
    lines.push('## Joueurs en échec');
    lines.push('');
    failed.forEach(r => {
      lines.push(`### ${r.slug}`);
      r.errors.forEach(e => lines.push(`- ❌ ${e}`));
      r.warnings.forEach(w => lines.push(`- ⚠️ ${w}`));
      lines.push('');
    });
  }

  const withWarnings = results.filter(r => r.warnings.length > 0 && r.player !== null);
  if (withWarnings.length > 0) {
    lines.push('## Joueurs avec avertissements');
    lines.push('');
    withWarnings.forEach(r => {
      lines.push(`### ${r.slug}`);
      r.warnings.forEach(w => lines.push(`- ⚠️ ${w}`));
      lines.push('');
    });
  }

  if (nullImages.length > 0) {
    lines.push('## Actions manuelles requises');
    lines.push('');
    lines.push('### Images manquantes');
    nullImages.forEach(id => lines.push(`- ${id} : ajouter manuellement dans public/players/${id}.jpg`));
    lines.push('');
  }

  return lines.join('\n');
}

async function main() {
  console.log(chalk.bold.cyan('\n🏸 Baddle Scraper\n'));

  const targets = isDryRun
    ? PLAYERS_TO_SCRAPE.filter(p => DRY_RUN_SLUGS.includes(p.slug))
    : PLAYERS_TO_SCRAPE;

  if (isDryRun) {
    console.log(chalk.yellow(`Mode dry-run — ${targets.length} joueurs : ${targets.map(t => t.slug).join(', ')}\n`));
  } else {
    console.log(chalk.yellow(`Scraping ${targets.length} joueurs...\n`));
  }

  const limit = pLimit(1);
  const results = await Promise.all(targets.map(entry => limit(() => scrapePlayer(entry))));

  const succeeded = results.filter(r => r.player !== null);
  const failed = results.filter(r => r.player === null);
  const players = succeeded.map(r => r.player!);

  console.log(chalk.bold('\n--- Résultats ---'));
  console.log(chalk.green(`✓ ${succeeded.length} joueurs scrapés avec succès`));
  if (failed.length > 0) {
    console.log(chalk.red(`✗ ${failed.length} échecs :`));
    failed.forEach(r => console.log(chalk.red(`  - ${r.slug}: ${r.errors.join('; ')}`)));
  }

  const withWarnings = results.filter(r => r.warnings.length > 0);
  if (withWarnings.length > 0) {
    console.log(chalk.yellow('\n--- Avertissements ---'));
    withWarnings.forEach(r => {
      r.warnings.forEach(w => console.log(chalk.yellow(`  [${r.slug}] ${w}`)));
    });
  }

  if (isDryRun) {
    console.log(chalk.bold.cyan('\n--- JSON produit ---\n'));
    console.log(JSON.stringify(players, null, 2));
  } else {
    const outDir = new URL('../src/data/', import.meta.url).pathname;
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
    const outPath = join(outDir, 'players.json');
    writeFileSync(outPath, JSON.stringify(players, null, 2), 'utf-8');
    console.log(chalk.green(`\n✓ Données écrites dans src/data/players.json (${players.length} joueurs)`));

    // Generate scraping report
    const logsDir = new URL('./logs/', import.meta.url).pathname;
    if (!existsSync(logsDir)) mkdirSync(logsDir, { recursive: true });
    const reportPath = join(logsDir, 'scraping-report.md');
    writeFileSync(reportPath, generateReport(results, players), 'utf-8');
    console.log(chalk.green(`✓ Rapport écrit dans scripts/logs/scraping-report.md`));
  }

  console.log(chalk.bold('\n--- Champs nuls ou suspects ---'));
  const suspectPlayers = players.filter(p => !p.imageUrl || p.countryCode === 'XX' || p.country === 'Inconnu');
  if (suspectPlayers.length === 0) {
    console.log(chalk.green('  Aucun'));
  } else {
    suspectPlayers.forEach(p => {
      const nullFields: string[] = [];
      if (!p.imageUrl) nullFields.push('imageUrl');
      if (p.countryCode === 'XX') nullFields.push('countryCode');
      if (p.country === 'Inconnu') nullFields.push('country');
      console.log(chalk.yellow(`  [${p.id}] ${nullFields.join(', ')}`));
    });
  }
}

main().catch(err => {
  console.error(chalk.red('Erreur fatale:'), err);
  process.exit(1);
});
