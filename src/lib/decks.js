/**
 * Deck loading and validation.
 *
 * Every JSON file in src/data/decks/ is a deck. Files are picked up
 * automatically with import.meta.glob, so adding a deck needs no code changes.
 * Decks and cards are validated at load time: a malformed card is logged and
 * skipped, a malformed deck (bad id/title/etc.) is logged and skipped as a whole.
 */

/**
 * A source backing a card's sentence or explanation.
 * @typedef {Object} Citation
 * @property {string} title  Human-readable source title.
 * @property {string} url    Absolute http(s) URL. Opened in a new tab.
 */

/**
 * One flashcard: a GRE word used in a sentence about a real topic concept.
 * @typedef {Object} Card
 * @property {string} id            Globally unique, stable id (e.g. "security-ephemeral").
 *                                  Progress is stored against this id, so never rename it.
 * @property {string} word          The GRE word, e.g. "ephemeral".
 * @property {string} partOfSpeech  e.g. "adjective", "noun", "verb".
 * @property {string} definition    Short dictionary-style definition.
 * @property {string} sentence      Sentence about a topic concept that uses the word.
 * @property {string} explanation   Explains the concept and how the word fits it.
 * @property {Citation[]} citations At least one source.
 */

/**
 * A topic deck, loaded from one JSON file.
 * @typedef {Object} Deck
 * @property {string} id           Unique, URL-safe id (used in /deck/:id).
 * @property {string} title        Display title, e.g. "Security".
 * @property {string} category     Grouping on the home page, e.g. "Computer Science".
 * @property {string} description  One-sentence description.
 * @property {Card[]} cards        Valid cards only (malformed ones are dropped).
 */

const DECK_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

function isHttpUrl(value) {
  if (!isNonEmptyString(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Returns a list of problems with a card; an empty list means it is valid.
 * @param {unknown} card
 * @returns {string[]}
 */
export function validateCard(card) {
  if (!card || typeof card !== 'object' || Array.isArray(card)) return ['card is not an object'];
  const errors = [];
  for (const field of ['id', 'word', 'partOfSpeech', 'definition', 'sentence', 'explanation']) {
    if (!isNonEmptyString(card[field])) errors.push(`"${field}" must be a non-empty string`);
  }
  if (!Array.isArray(card.citations) || card.citations.length === 0) {
    errors.push('"citations" must be a non-empty array');
  } else {
    card.citations.forEach((citation, i) => {
      if (!citation || !isNonEmptyString(citation.title)) {
        errors.push(`citations[${i}].title must be a non-empty string`);
      }
      if (!citation || !isHttpUrl(citation.url)) {
        errors.push(`citations[${i}].url must be an http(s) URL`);
      }
    });
  }
  return errors;
}

/**
 * Returns a list of problems with a deck's own fields (not its cards).
 * @param {unknown} deck
 * @returns {string[]}
 */
export function validateDeckFields(deck) {
  if (!deck || typeof deck !== 'object' || Array.isArray(deck)) return ['deck is not an object'];
  const errors = [];
  if (!isNonEmptyString(deck.id) || !DECK_ID_PATTERN.test(deck.id)) {
    errors.push('"id" must be lowercase letters, digits and dashes');
  }
  for (const field of ['title', 'category', 'description']) {
    if (!isNonEmptyString(deck[field])) errors.push(`"${field}" must be a non-empty string`);
  }
  if (!Array.isArray(deck.cards)) errors.push('"cards" must be an array');
  return errors;
}

const trimCard = (card) => ({
  id: card.id.trim(),
  word: card.word.trim(),
  partOfSpeech: card.partOfSpeech.trim(),
  definition: card.definition.trim(),
  sentence: card.sentence.trim(),
  explanation: card.explanation.trim(),
  citations: card.citations.map((c) => ({ title: c.title.trim(), url: c.url.trim() })),
});

/**
 * Validates raw deck modules. Malformed decks and cards are logged and skipped.
 * Exported separately from the glob so it can be tested with plain objects.
 * @param {Record<string, unknown>} modules  Map of file path -> parsed JSON.
 * @returns {Deck[]}
 */
export function buildDecks(modules) {
  const decks = [];
  const deckIds = new Set();
  const cardIds = new Set();

  for (const [path, raw] of Object.entries(modules).sort(([a], [b]) => a.localeCompare(b))) {
    const deckErrors = validateDeckFields(raw);
    if (deckErrors.length > 0) {
      console.error(`[decks] Skipping ${path}: ${deckErrors.join('; ')}`);
      continue;
    }
    if (deckIds.has(raw.id)) {
      console.error(`[decks] Skipping ${path}: duplicate deck id "${raw.id}"`);
      continue;
    }
    deckIds.add(raw.id);

    const cards = [];
    raw.cards.forEach((card, index) => {
      const errors = validateCard(card);
      if (errors.length === 0 && cardIds.has(card.id.trim())) {
        errors.push(`duplicate card id "${card.id}"`);
      }
      if (errors.length > 0) {
        const label = card && isNonEmptyString(card.id) ? `"${card.id}"` : `#${index}`;
        console.warn(`[decks] Skipping card ${label} in ${path}: ${errors.join('; ')}`);
        return;
      }
      cardIds.add(card.id.trim());
      cards.push(trimCard(card));
    });

    decks.push({
      id: raw.id,
      title: raw.title.trim(),
      category: raw.category.trim(),
      description: raw.description.trim(),
      cards,
    });
  }
  return decks;
}

const modules = import.meta.glob('../data/decks/*.json', { eager: true, import: 'default' });

/** All valid decks, sorted by title. @type {Deck[]} */
export const decks = buildDecks(modules).sort((a, b) => a.title.localeCompare(b.title));

const decksById = new Map(decks.map((deck) => [deck.id, deck]));

/**
 * @param {string} id
 * @returns {Deck | undefined}
 */
export function getDeck(id) {
  return decksById.get(id);
}

/**
 * Decks grouped by category, categories sorted alphabetically.
 * @returns {{ category: string, decks: Deck[] }[]}
 */
export function getDecksByCategory() {
  const groups = new Map();
  for (const deck of decks) {
    if (!groups.has(deck.category)) groups.set(deck.category, []);
    groups.get(deck.category).push(deck);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, list]) => ({ category, decks: list }));
}

/**
 * Normalises a word for grouping and URLs ("Ephemeral " -> "ephemeral").
 * @param {string} word
 */
export const wordKey = (word) => word.trim().toLowerCase();

/**
 * Every distinct word across all decks, with the cards (and their decks) that use it.
 * @returns {{ key: string, word: string, entries: { card: Card, deck: Deck }[] }[]}
 */
export function getWordIndex() {
  const index = new Map();
  for (const deck of decks) {
    for (const card of deck.cards) {
      const key = wordKey(card.word);
      if (!index.has(key)) index.set(key, { key, word: card.word, entries: [] });
      index.get(key).entries.push({ card, deck });
    }
  }
  return [...index.values()].sort((a, b) => a.key.localeCompare(b.key));
}
