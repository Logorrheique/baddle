import { readFileSync } from 'fs';
import chalk from 'chalk';
import { PlayerSchema } from './schema.js';
const DATA_PATH = new URL('../src/data/players.json', import.meta.url).pathname;
function validate(players) {
    const issues = [];
    const seenIds = new Set();
    for (const player of players) {
        // Schema validation
        const result = PlayerSchema.safeParse(player);
        if (!result.success) {
            result.error.issues.forEach(i => {
                issues.push({ slug: player.id, type: 'error', message: `schema: ${i.path.join('.')}: ${i.message}` });
            });
        }
        // Duplicate ID check
        if (seenIds.has(player.id)) {
            issues.push({ slug: player.id, type: 'error', message: 'duplicate ID' });
        }
        seenIds.add(player.id);
        if (!player.country || player.country === 'Inconnu') {
            issues.push({ slug: player.id, type: 'error', message: 'missing country' });
        }
        if (!player.continent) {
            issues.push({ slug: player.id, type: 'error', message: 'missing continent' });
        }
        // Warning: retired player with age bracket <25
        if (player.status === 'Retraité' && player.ageBracket === '<25') {
            issues.push({ slug: player.id, type: 'warning', message: 'retired but age bracket <25' });
        }
        // Warning: missing image
        if (!player.imageUrl) {
            issues.push({ slug: player.id, type: 'warning', message: 'imageUrl is null' });
        }
    }
    // Warning: more than 40 players from same continent
    const continentCounts = {};
    players.forEach(p => { continentCounts[p.continent] = (continentCounts[p.continent] ?? 0) + 1; });
    Object.entries(continentCounts).forEach(([c, n]) => {
        if (n > 40) {
            issues.push({ slug: '__dataset__', type: 'warning', message: `${n} joueurs du continent ${c} (> 40)` });
        }
    });
    return issues;
}
function main() {
    console.log(chalk.bold.cyan('\n🏸 Baddle — Validation des données\n'));
    let players;
    try {
        players = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
    }
    catch {
        console.error(chalk.red('✗ Impossible de lire src/data/players.json'));
        process.exit(1);
    }
    console.log(`${players.length} joueurs chargés.\n`);
    const issues = validate(players);
    const errors = issues.filter(i => i.type === 'error');
    const warnings = issues.filter(i => i.type === 'warning');
    if (errors.length > 0) {
        console.log(chalk.red(`✗ ${errors.length} erreur(s) bloquante(s) :`));
        errors.forEach(e => console.log(chalk.red(`  [${e.slug}] ${e.message}`)));
    }
    else {
        console.log(chalk.green('✓ Aucune erreur bloquante'));
    }
    if (warnings.length > 0) {
        console.log(chalk.yellow(`\n⚠ ${warnings.length} avertissement(s) :`));
        warnings.forEach(w => console.log(chalk.yellow(`  [${w.slug}] ${w.message}`)));
    }
    else {
        console.log(chalk.green('✓ Aucun avertissement'));
    }
    if (errors.length > 0)
        process.exit(1);
}
main();
