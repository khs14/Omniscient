/**
 * Spaced-repetition scheduling (FSRS via ts-fsrs) and study-queue rules.
 * Pure functions only: callers pass in progress and the current time, and
 * persist the results through storage.js.
 */
import { createEmptyCard, fsrs, generatorParameters, Rating, State } from 'ts-fsrs';
import { getCardState, getNewCardCount } from './storage.js';

/** Max new cards introduced per deck per local day. */
export const NEW_CARDS_PER_DAY = 10;

const scheduler = fsrs(generatorParameters({ enable_fuzz: true, enable_short_term: true }));

/** The four answer buttons, in display order. */
export const RATINGS = [
  { rating: Rating.Again, label: 'Again', key: '1' },
  { rating: Rating.Hard, label: 'Hard', key: '2' },
  { rating: Rating.Good, label: 'Good', key: '3' },
  { rating: Rating.Easy, label: 'Easy', key: '4' },
];

// ---------------------------------------------------------------------------
// Dates

/** Local calendar day as YYYY-MM-DD (used for the daily new-card limit). */
export function localDayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Last millisecond of the local day containing `date`. */
export function endOfDay(date) {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Short human label for a duration, e.g. "10m", "3d", "2mo".
 * @param {number} ms
 */
export function formatInterval(ms) {
  const minutes = Math.max(0, ms) / 60000;
  if (minutes < 1) return '<1m';
  // Compare rounded values so 59.6 minutes reads "1h", not "60m".
  if (Math.round(minutes) < 60) return `${Math.round(minutes)}m`;
  const hours = minutes / 60;
  if (Math.round(hours) < 24) return `${Math.round(hours)}h`;
  const days = hours / 24;
  if (Math.round(days) < 30) return `${Math.round(days)}d`;
  if (Math.round(days / 30) < 12) return `${Math.round(days / 30)}mo`;
  const years = days / 365;
  return `${years < 10 ? years.toFixed(1).replace(/\.0$/, '') : Math.round(years)}y`;
}

// ---------------------------------------------------------------------------
// Card state

/** @param {import('./storage.js').CardState | undefined} state */
export const isNew = (state) => !state || state.state === State.New;

/** @param {import('./storage.js').CardState | undefined} state */
export const isLearning = (state) =>
  !!state && (state.state === State.Learning || state.state === State.Relearning);

/** Studied before and due by the end of today. */
export function isDueToday(state, now) {
  return !isNew(state) && state.due.getTime() <= endOfDay(now).getTime();
}

/**
 * Previews the outcome of each rating for a card. The rating buttons show the
 * interval from this preview, and the chosen option's `card` is what gets
 * saved, so the label always matches the actual schedule (fuzz included).
 * @param {import('./storage.js').CardState | undefined} state  undefined = never studied
 * @param {Date} now
 */
export function previewRatings(state, now) {
  const card = state ?? createEmptyCard(now);
  const preview = scheduler.repeat(card, now);
  return RATINGS.map(({ rating, label, key }) => {
    const next = preview[rating].card;
    return {
      rating,
      label,
      key,
      card: next,
      interval: formatInterval(next.due.getTime() - now.getTime()),
    };
  });
}

// ---------------------------------------------------------------------------
// Deck statistics and study queue

/**
 * Counts for a deck.
 * - new:        never studied
 * - learning:   in (re)learning steps
 * - review:     graduated cards due by the end of today
 * - dueToday:   all studied cards due by the end of today (learning + review)
 * - newToday:   new cards still allowed today under the daily limit
 */
export function getDeckStats(deck, progress, now) {
  const stats = { total: deck.cards.length, new: 0, learning: 0, review: 0, dueToday: 0, newToday: 0 };
  for (const card of deck.cards) {
    const state = getCardState(progress, card.id);
    if (isNew(state)) {
      stats.new += 1;
      continue;
    }
    if (isLearning(state)) stats.learning += 1;
    if (isDueToday(state, now)) {
      stats.dueToday += 1;
      if (state.state === State.Review) stats.review += 1;
    }
  }
  const remaining = Math.max(0, NEW_CARDS_PER_DAY - getNewCardCount(progress, deck.id, localDayKey(now)));
  stats.newToday = Math.min(stats.new, remaining);
  return stats;
}

/**
 * Builds a study session: cards due today first (most overdue first), then
 * new cards in deck order up to today's remaining allowance.
 * @returns {import('./decks.js').Card[]}
 */
export function buildStudyQueue(deck, progress, now) {
  const due = [];
  const fresh = [];
  for (const card of deck.cards) {
    const state = getCardState(progress, card.id);
    if (isNew(state)) fresh.push(card);
    else if (isDueToday(state, now)) due.push({ card, at: state.due.getTime() });
  }
  due.sort((a, b) => a.at - b.at);
  const { newToday } = getDeckStats(deck, progress, now);
  return [...due.map((entry) => entry.card), ...fresh.slice(0, newToday)];
}

/**
 * Whether a just-rated card should come back later in the same session
 * (it is still in learning steps and due again today).
 * @param {import('./storage.js').CardState} nextState
 * @param {Date} now
 */
export function shouldRequeue(nextState, now) {
  return isLearning(nextState) && nextState.due.getTime() <= endOfDay(now).getTime();
}
