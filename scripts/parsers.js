const MONTH_MAP = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8,
    sep: 9, oct: 10, nov: 11, dec: 12,
};
/**
 * Parses a birth date from various Wikipedia formats.
 * Handles: "(1994-01-04)", "4 January 1994", "DD Month YYYY", ISO dates.
 */
export function parseBirthDate(value) {
    if (!value)
        return null;
    const cleaned = value.replace(/\(age\s+\d+\)/i, '').trim();
    // ISO-like: (YYYY-MM-DD) or YYYY-MM-DD
    const isoMatch = cleaned.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
        const d = new Date(Date.UTC(+isoMatch[1], +isoMatch[2] - 1, +isoMatch[3]));
        if (!isNaN(d.getTime()))
            return d;
    }
    // "D Month YYYY" or "Month D, YYYY"
    const textMatch = cleaned.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (textMatch) {
        const month = MONTH_MAP[textMatch[2].toLowerCase()];
        if (month) {
            const d = new Date(Date.UTC(+textMatch[3], month - 1, +textMatch[1]));
            if (!isNaN(d.getTime()))
                return d;
        }
    }
    // "Month D, YYYY"
    const textMatch2 = cleaned.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
    if (textMatch2) {
        const month = MONTH_MAP[textMatch2[1].toLowerCase()];
        if (month) {
            const d = new Date(Date.UTC(+textMatch2[3], month - 1, +textMatch2[2]));
            if (!isNaN(d.getTime()))
                return d;
        }
    }
    return null;
}
/**
 * Parses height from various formats.
 * Handles: "1.94 m", "194 cm", "6 ft 4 in", "1.80m".
 * Returns height in centimeters.
 */
export function parseHeight(value) {
    if (!value)
        return null;
    const cleaned = value.trim().toLowerCase();
    // Feet and inches: "6 ft 4 in" or "6'4""
    const ftInMatch = cleaned.match(/(\d+)\s*ft\s*(\d+)\s*in/) || cleaned.match(/(\d+)'(\d+)/);
    if (ftInMatch) {
        const cm = Math.round(+ftInMatch[1] * 30.48 + +ftInMatch[2] * 2.54);
        return cm;
    }
    // Feet only: "6 ft"
    const ftOnly = cleaned.match(/(\d+)\s*ft\b/);
    if (ftOnly) {
        return Math.round(+ftOnly[1] * 30.48);
    }
    // Meters with comma or dot: "1,94 m" or "1.94 m" or "1.80m"
    const mMatch = cleaned.match(/([\d][.,]\d{1,2})\s*m\b/);
    if (mMatch) {
        const meters = parseFloat(mMatch[1].replace(',', '.'));
        return Math.round(meters * 100);
    }
    // Centimeters: "194 cm" or "194cm"
    const cmMatch = cleaned.match(/(\d{2,3})\s*cm\b/);
    if (cmMatch) {
        return parseInt(cmMatch[1], 10);
    }
    return null;
}
/**
 * Parses handedness from Wikipedia infobox value.
 */
export function parseHandedness(value) {
    if (!value)
        return null;
    const lower = value.toLowerCase();
    if (lower.includes('left'))
        return 'Gaucher';
    if (lower.includes('right'))
        return 'Droitier';
    return null;
}
/**
 * Parses the highest world ranking number from text like "1", "No. 1", "World No. 3".
 */
export function parseHighestRanking(value) {
    if (!value)
        return null;
    const match = value.match(/(\d+)/);
    if (match) {
        const n = parseInt(match[1], 10);
        return isNaN(n) ? null : n;
    }
    return null;
}
/**
 * Parses and normalizes a country name, stripping flags, dates, and ref markers.
 */
export function parseCountry(value) {
    if (!value)
        return null;
    return value
        .replace(/\[\d+\]/g, '') // remove [1], [2] refs
        .replace(/\(.*?\)/g, '') // remove parenthetical dates
        .replace(/[🇦-🇿]{2}/gu, '') // remove flag emojis
        .replace(/\s{2,}/g, ' ')
        .trim() || null;
}
/**
 * Calculates age in full years from a birth date to today.
 */
export function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
    const m = today.getUTCMonth() - birthDate.getUTCMonth();
    if (m < 0 || (m === 0 && today.getUTCDate() < birthDate.getUTCDate())) {
        age--;
    }
    return age;
}
