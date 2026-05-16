export const WIKI_BASE = 'https://en.wikipedia.org/wiki/';
export const SELECTORS = {
    infobox: 'table.infobox',
    infoboxRow: 'table.infobox tr',
    infoboxLabel: 'th',
    infoboxValue: 'td',
    infoboxImage: 'table.infobox img',
    introParas: '#mw-content-text .mw-parser-output > p',
    categories: '#mw-normal-catlinks li a',
    medalTable: 'table.wikitable',
    toc: '#toc',
};
// Known infobox field labels (lowercase) for each attribute
export const FIELD_LABELS = {
    born: ['born', 'date of birth', 'birth date'],
    country: ['country', 'nationality', 'represents', 'representing'],
    height: ['height'],
    hand: ['handedness', 'plays', 'dominant hand'],
    worldRanking: ['world ranking', 'highest ranking', 'best world ranking', 'career high ranking'],
    turned_pro: ['turned pro', 'professional since', 'pro since'],
};
