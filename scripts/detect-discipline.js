const SINGLES_KEYWORDS = [
    'singles', "men's singles", "women's singles", 'single player', 'solo',
];
const DOUBLES_KEYWORDS = [
    "men's doubles", "women's doubles", "doubles player",
];
const MIXED_KEYWORDS = [
    'mixed doubles',
];
/**
 * Detects the primary discipline from intro text and categories.
 * Priority: mixed > doubles > singles. Falls back to 'Simple'.
 */
export function detectDiscipline(introText, categories) {
    const combined = (introText + ' ' + categories.join(' ')).toLowerCase();
    const hasMixed = MIXED_KEYWORDS.some(kw => combined.includes(kw));
    const hasDoubles = DOUBLES_KEYWORDS.some(kw => combined.includes(kw));
    const hasSingles = SINGLES_KEYWORDS.some(kw => combined.includes(kw));
    if (hasMixed && !hasSingles)
        return 'Double mixte';
    if (hasDoubles && !hasSingles && !hasMixed)
        return 'Double';
    // If both singles and doubles mentioned, pick the first mentioned in intro
    if (hasSingles && hasMixed) {
        const singlesIdx = combined.indexOf('singles');
        const mixedIdx = combined.indexOf('mixed');
        return mixedIdx < singlesIdx ? 'Double mixte' : 'Simple';
    }
    if (hasSingles && hasDoubles) {
        const singlesIdx = combined.indexOf('singles');
        const doublesIdx = combined.indexOf('doubles');
        return doublesIdx < singlesIdx ? 'Double' : 'Simple';
    }
    if (hasMixed)
        return 'Double mixte';
    if (hasDoubles)
        return 'Double';
    return 'Simple';
}
/**
 * Detects if the player is retired based on intro text keywords.
 * "former world no. 1" does NOT mean retired — must check for actual retirement signals.
 */
export function detectRetired(introText, categories) {
    const lowerIntro = introText.toLowerCase();
    const lowerCats = categories.join(' ').toLowerCase();
    // Strong retirement signals in categories
    if (lowerCats.includes('retired badminton') || lowerCats.includes('retired sportspeople')) {
        return true;
    }
    // Specific retirement phrases in intro (not just "former world champion")
    const retiredPhrases = [
        'retired from badminton',
        'retired professional',
        'is a retired',
        'was a professional',
        'formerly a professional',
        'announced his retirement',
        'announced her retirement',
        'retired in ',
    ];
    return retiredPhrases.some(p => lowerIntro.includes(p));
}
