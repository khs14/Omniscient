/**
 * Glue between the scheduler and storage for a study session, so the Study page
 * never touches FSRS or persistence directly.
 */
import { isNew, localDayKey, shouldRequeue } from './scheduler.js';
import { getCardState, getProgress, saveReview } from './storage.js';

/**
 * Saves one answer and reports whether the card should be shown again this session.
 * @param {Object} args
 * @param {import('./decks.js').Deck} args.deck
 * @param {import('./decks.js').Card} args.card
 * @param {{ card: import('./storage.js').CardState }} args.option  The chosen entry from previewRatings().
 * @param {Date} args.now  The same time used for previewRatings().
 * @returns {{ requeue: boolean }}
 */
export function recordReview({ deck, card, option, now }) {
  const wasNew = isNew(getCardState(getProgress(), card.id));
  saveReview({
    cardId: card.id,
    card: option.card,
    deckId: deck.id,
    dayKey: localDayKey(now),
    wasNew,
  });
  return { requeue: shouldRequeue(option.card, now) };
}
