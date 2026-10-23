/**
 * Progress storage.
 *
 * All user progress lives in one versioned localStorage key. The rest of the app
 * only talks to the functions exported here, so this module can later be swapped
 * for a Supabase-backed implementation with the same interface.
 *
 * If localStorage is unavailable (private mode, blocked cookies, quota errors),
 * progress is kept in memory for the current visit and `isPersistent()` is false.
 */

export const STORAGE_KEY = 'gre-vocab:v1';
const VERSION = 1;

/**
 * FSRS card state as produced by ts-fsrs. Dates are real Date objects in memory
 * and ISO strings in storage.
 * @typedef {Object} CardState
 * @property {Date} due
 * @property {number} stability
 * @property {number} difficulty
 * @property {number} elapsed_days
 * @property {number} scheduled_days
 * @property {number} learning_steps
 * @property {number} reps
 * @property {number} lapses
 * @property {number} state            0 New, 1 Learning, 2 Review, 3 Relearning
 * @property {Date} [last_review]
 */

/**
 * @typedef {Object} Progress
 * @property {number} version
 * @property {Record<string, CardState>} cards   Keyed by card id.
 * @property {Record<string, { date: string, count: number }>} newCards
 *           New cards introduced per deck on a given local day (YYYY-MM-DD).
 */

/** @returns {Progress} */
const emptyProgress = () => ({ version: VERSION, cards: {}, newCards: {} });

const NUMBER_FIELDS = [
  'stability',
  'difficulty',
  'elapsed_days',
  'scheduled_days',
  'learning_steps',
  'reps',
  'lapses',
];

function toDate(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * Turns a stored card state back into the shape ts-fsrs expects, converting
 * date strings into Date objects. Returns null if it is not usable.
 * @param {unknown} raw
 * @returns {CardState | null}
 */
export function reviveCardState(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const due = toDate(raw.due);
  if (!due) return null;
  if (!Number.isInteger(raw.state) || raw.state < 0 || raw.state > 3) return null;

  const card = { due, state: raw.state };
  for (const field of NUMBER_FIELDS) {
    const value = raw[field] ?? 0; // learning_steps is missing in older ts-fsrs exports
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
    card[field] = value;
  }
  const lastReview = toDate(raw.last_review);
  if (lastReview) card.last_review = lastReview;
  return card;
}

/**
 * Validates and revives a whole progress object (from storage or an import file).
 * Bad card entries are dropped and counted rather than failing the whole load.
 * @param {unknown} raw
 * @returns {{ progress: Progress, skipped: number }}
 */
export function reviveProgress(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('This file is not a progress export.');
  }
  if (raw.version !== VERSION) {
    throw new Error(`Unsupported progress version: ${String(raw.version)}.`);
  }
  if (!raw.cards || typeof raw.cards !== 'object' || Array.isArray(raw.cards)) {
    throw new Error('The progress file has no "cards" section.');
  }

  const progress = emptyProgress();
  let skipped = 0;
  for (const [id, value] of Object.entries(raw.cards)) {
    const card = reviveCardState(value);
    if (card) progress.cards[id] = card;
    else skipped += 1;
  }
  if (raw.newCards && typeof raw.newCards === 'object') {
    for (const [deckId, entry] of Object.entries(raw.newCards)) {
      if (
        entry &&
        typeof entry.date === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(entry.date) &&
        Number.isInteger(entry.count) &&
        entry.count >= 0
      ) {
        progress.newCards[deckId] = { date: entry.date, count: entry.count };
      }
    }
  }
  return { progress, skipped };
}

// ---------------------------------------------------------------------------
// localStorage access, all wrapped so failures never reach the UI.

function getLocalStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const probe = `${STORAGE_KEY}:probe`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

let backend = getLocalStorage();

function readFromStorage() {
  if (!backend) return emptyProgress();
  try {
    const text = backend.getItem(STORAGE_KEY);
    if (!text) return emptyProgress();
    const { progress, skipped } = reviveProgress(JSON.parse(text));
    if (skipped > 0) console.warn(`[storage] Dropped ${skipped} unreadable card states.`);
    return progress;
  } catch (error) {
    console.error('[storage] Could not read saved progress; starting fresh in memory.', error);
    return emptyProgress();
  }
}

function writeToStorage(progress) {
  if (!backend) return;
  try {
    backend.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('[storage] Could not save progress; keeping it in memory only.', error);
    backend = null;
  }
}

// ---------------------------------------------------------------------------
// In-memory snapshot + subscriptions (works with React's useSyncExternalStore).

let current = readFromStorage();
const listeners = new Set();

function emit() {
  for (const listener of listeners) listener();
}

function commit(next) {
  current = next;
  writeToStorage(next);
  emit();
}

if (typeof window !== 'undefined') {
  // Keep several open tabs in sync.
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    current = readFromStorage();
    emit();
  });
}

/** @param {() => void} listener @returns {() => void} unsubscribe */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Current progress snapshot. The object is replaced (never mutated) on change. */
export const getProgress = () => current;

/** True when progress is being saved to localStorage. */
export const isPersistent = () => backend !== null;

/**
 * @param {Progress} progress
 * @param {string} cardId
 * @returns {CardState | undefined}
 */
export const getCardState = (progress, cardId) => progress.cards[cardId];

/**
 * How many new cards were introduced in a deck on the given local day.
 * @param {Progress} progress
 * @param {string} deckId
 * @param {string} dayKey  YYYY-MM-DD
 */
export function getNewCardCount(progress, deckId, dayKey) {
  const entry = progress.newCards[deckId];
  return entry && entry.date === dayKey ? entry.count : 0;
}

/**
 * Saves the result of one review.
 * @param {Object} review
 * @param {string} review.cardId
 * @param {CardState} review.card       New FSRS state.
 * @param {string} review.deckId
 * @param {string} review.dayKey        Local day of the review (YYYY-MM-DD).
 * @param {boolean} review.wasNew       True the first time a card is studied.
 */
export function saveReview({ cardId, card, deckId, dayKey, wasNew }) {
  const next = {
    ...current,
    cards: { ...current.cards, [cardId]: card },
  };
  if (wasNew) {
    next.newCards = {
      ...current.newCards,
      [deckId]: { date: dayKey, count: getNewCardCount(current, deckId, dayKey) + 1 },
    };
  }
  commit(next);
}

/** Progress as a pretty-printed JSON string for download. */
export const exportProgress = () => JSON.stringify(current, null, 2);

/**
 * Parses and validates an export file without applying it, so the UI can ask
 * for confirmation first.
 * @param {string} text  File contents.
 * @returns {{ progress: Progress, skipped: number }}
 * @throws {Error} with a user-readable message if the file is not usable.
 */
export function parseProgressFile(text) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  return reviveProgress(raw);
}

/**
 * Replaces all progress with an already-parsed import.
 * @param {Progress} progress  From parseProgressFile().
 */
export function importProgress(progress) {
  commit(progress);
}

/** Number of cards that have been studied at least once. */
export const countStudiedCards = (progress) => Object.keys(progress.cards).length;

/** Deletes all progress. */
export function resetProgress() {
  commit(emptyProgress());
}
