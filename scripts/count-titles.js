/**
 * Estimates major title count from intro text using numeric patterns.
 * "Major titles" = BWF World Championships + Olympic gold medals.
 */
export function countMajorTitles(introText) {
    const text = introText.toLowerCase();
    let count = 0;
    // Pattern: "two-time", "three-time", "five-time", etc.
    const wordNumbers = {
        once: 1, twice: 2, 'two-time': 2, 'three-time': 3, 'four-time': 4,
        'five-time': 5, 'six-time': 6, 'seven-time': 7, 'eight-time': 8,
        'nine-time': 9, 'ten-time': 10, 'eleven-time': 11, 'twelve-time': 12,
    };
    // Match "X-time world champion" or "X-time olympic champion"
    for (const [word, num] of Object.entries(wordNumbers)) {
        if (text.includes(word + ' world') || text.includes(word + ' olympic')) {
            count = Math.max(count, num);
        }
    }
    // Numeric patterns: "5 world championships" — only match small numbers (1-99) to avoid years
    const numericPatterns = [
        /\b([1-9]\d?)\s+world\s+(?:championship|title)/gi,
        /won\s+([1-9]\d?)\s+world/gi,
    ];
    for (const pattern of numericPatterns) {
        const matches = [...text.matchAll(pattern)];
        for (const m of matches) {
            const n = parseInt(m[1], 10);
            if (!isNaN(n) && n < 100)
                count = Math.max(count, n);
        }
    }
    // Super Series Finals / All England / BWF World Tour Finals
    // Count separately by scanning "title count" tables is too complex for intro;
    // we rely on the manual overrides for exact counts.
    return count;
}
