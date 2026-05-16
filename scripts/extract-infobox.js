/**
 * Extracts all key-value pairs from the Wikipedia biography infobox.
 */
export function extractInfobox($) {
    const fields = {};
    // Look for the infobox table (biographical or sports)
    const infobox = $('table.infobox').first();
    infobox.find('tr').each((_i, row) => {
        const $row = $(row);
        const label = $row.find('th').text().trim();
        const value = $row.find('td').text().trim();
        if (label && value) {
            fields[label.toLowerCase()] = value;
        }
    });
    // Get image URL from infobox
    let imageUrl = null;
    const imgSrc = infobox.find('img').first().attr('src');
    if (imgSrc) {
        // Keep the original size — do not try to request non-existent thumbnail sizes
        const base = imgSrc.startsWith('//') ? 'https:' + imgSrc : imgSrc;
        imageUrl = base.split('?')[0]; // strip UTM tracking params
    }
    // Extract intro text (first paragraph before TOC)
    const introText = $('#mw-content-text .mw-parser-output > p')
        .filter((_i, el) => {
        const text = $(el).text().trim();
        return text.length > 50;
    })
        .first()
        .text()
        .trim();
    // Extract page categories
    const categories = [];
    $('#mw-normal-catlinks li a').each((_i, el) => {
        categories.push($(el).text().trim().toLowerCase());
    });
    return { fields, introText, categories, imageUrl };
}
/**
 * Looks up a field in the infobox with multiple possible label variants.
 */
export function getField(fields, ...labels) {
    for (const label of labels) {
        const key = label.toLowerCase();
        if (fields[key])
            return fields[key];
        // Partial match
        const found = Object.keys(fields).find(k => k.includes(key));
        if (found)
            return fields[found];
    }
    return null;
}
