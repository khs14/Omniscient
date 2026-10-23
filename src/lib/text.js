const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Splits a sentence into parts so the GRE word (including simple inflections
 * like "obfuscates" or "obfuscating") can be highlighted.
 * @param {string} sentence
 * @param {string} word
 * @returns {{ text: string, match: boolean }[]}
 */
export function splitOnWord(sentence, word) {
  const base = word.trim();
  if (!base) return [{ text: sentence, match: false }];

  // Drop a trailing e/y so "obfuscate" also matches "obfuscating" and "pacify" matches "pacified".
  const stem = base.length > 4 && /[ey]$/i.test(base) ? base.slice(0, -1) : base;
  const pattern = new RegExp(`\\b${escapeRegExp(stem)}\\p{L}*`, 'giu');

  const parts = [];
  let last = 0;
  for (const found of sentence.matchAll(pattern)) {
    if (found.index > last) parts.push({ text: sentence.slice(last, found.index), match: false });
    parts.push({ text: found[0], match: true });
    last = found.index + found[0].length;
  }
  if (last < sentence.length) parts.push({ text: sentence.slice(last), match: false });
  return parts;
}
