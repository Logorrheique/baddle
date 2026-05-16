/**
 * Extracts the best Olympic medal from the Wikipedia page.
 * Checks: Medal record table, categories, intro text.
 */
export function extractOlympicMedal($, introText, categories) {
    // Check medal record table for Olympic rows
    let bestMedal = 'Aucune';
    // Look for medal record section
    $('table').each((_i, table) => {
        const tableText = $(table).text().toLowerCase();
        if (!tableText.includes('olympic'))
            return;
        $(table).find('tr').each((_j, row) => {
            const rowText = $(row).text().toLowerCase();
            if (!rowText.includes('olympic'))
                return;
            const cells = $(row).find('td');
            cells.each((_k, cell) => {
                const cellText = $(cell).text().toLowerCase().trim();
                const bgClass = $(cell).attr('class') ?? '';
                const bgStyle = $(cell).attr('style') ?? '';
                if (cellText === 'gold' ||
                    bgClass.includes('gold') ||
                    bgStyle.includes('gold') ||
                    $(cell).find('[style*="gold"], .gold-medal').length > 0) {
                    bestMedal = 'Or';
                }
                else if (bestMedal !== 'Or' &&
                    (cellText === 'silver' || bgClass.includes('silver') || bgStyle.includes('silver'))) {
                    bestMedal = 'Argent';
                }
                else if (bestMedal === 'Aucune' &&
                    (cellText === 'bronze' || bgClass.includes('bronze') || bgStyle.includes('bronze'))) {
                    bestMedal = 'Bronze';
                }
            });
        });
    });
    if (bestMedal !== 'Aucune')
        return bestMedal;
    // Check categories
    const catString = categories.join(' ');
    if (catString.includes('olympic gold'))
        return 'Or';
    if (catString.includes('olympic silver'))
        return 'Argent';
    if (catString.includes('olympic bronze'))
        return 'Bronze';
    // Check intro text
    const intro = introText.toLowerCase();
    if (intro.includes('olympic gold') || intro.includes('olympic champion'))
        return 'Or';
    if (intro.includes('olympic silver'))
        return 'Argent';
    if (intro.includes('olympic bronze'))
        return 'Bronze';
    return 'Aucune';
}
