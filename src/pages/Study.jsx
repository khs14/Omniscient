import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import Flashcard from '../components/Flashcard.jsx';
import RatingButtons from '../components/RatingButtons.jsx';
import { getDeck } from '../lib/decks.js';
import { buildStudyQueue, NEW_CARDS_PER_DAY, previewRatings } from '../lib/scheduler.js';
import { getCardState, getProgress } from '../lib/storage.js';
import { recordReview } from '../lib/study.js';
import NotFound from './NotFound.jsx';
import './Study.css';

export default function Study() {
  const { id } = useParams();
  const deck = getDeck(id);
  if (!deck) return <NotFound message="There is no deck with that address." />;
  // Keyed so switching decks starts a fresh session.
  return <StudySession key={deck.id} deck={deck} />;
}

/** Ignore shortcuts while the user is typing in a field. */
function isTypingTarget(target) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

function StudySession({ deck }) {
  // The queue is built once per session; later progress changes don't reshuffle it.
  const [session, setSession] = useState(() => ({
    queue: buildStudyQueue(deck, getProgress(), new Date()),
    reviewedIds: new Set(),
    answers: 0,
  }));
  const [flipped, setFlipped] = useState(false);
  const [preview, setPreview] = useState(null); // { now, options } computed when the card is flipped

  const current = session.queue[0];

  function flip() {
    if (!current || flipped) return;
    const now = new Date();
    setPreview({ now, options: previewRatings(getCardState(getProgress(), current.id), now) });
    setFlipped(true);
  }

  function rate(option) {
    if (!current || !flipped || !preview) return;
    const { requeue } = recordReview({ deck, card: current, option, now: preview.now });
    setSession((prev) => {
      const [, ...rest] = prev.queue;
      return {
        queue: requeue ? [...rest, current] : rest,
        reviewedIds: new Set(prev.reviewedIds).add(current.id),
        answers: prev.answers + 1,
      };
    });
    setFlipped(false);
    setPreview(null);
  }

  // Keyboard shortcuts: Space flips, 1–4 rate. The latest handlers live in a ref
  // so the listener is attached once.
  const handlers = useRef({ flip, rate, preview, flipped });
  useEffect(() => {
    handlers.current = { flip, rate, preview, flipped };
  });

  useEffect(() => {
    function onKeyDown(event) {
      if (event.defaultPrevented || event.repeat) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (isTypingTarget(event.target)) return;
      const { flip: doFlip, rate: doRate, preview: currentPreview, flipped: isFlipped } = handlers.current;

      if (event.key === ' ' && !isFlipped) {
        // Let a focused button or link handle Space itself (the "Show answer" button flips too).
        if (event.target instanceof HTMLElement && event.target.closest('button, a')) return;
        event.preventDefault();
        doFlip();
        return;
      }

      if (isFlipped && currentPreview) {
        const option = currentPreview.options.find((o) => o.key === event.key);
        if (option) {
          event.preventDefault();
          doRate(option);
        }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="page page--narrow study">
      <title>{`Study ${deck.title} · Omniscient`}</title>
      <header className="study__header">
        <Link className="study__back" to={`/deck/${deck.id}`}>
          {deck.title}
        </Link>
        {current && (
          <p className="study__remaining">
            {session.queue.length} {session.queue.length === 1 ? 'card' : 'cards'} left
          </p>
        )}
      </header>

      {current ? (
        <>
          <Flashcard
            key={`${current.id}-${session.answers}`}
            card={current}
            flipped={flipped}
            onFlip={flip}
          />
          {flipped && preview && (
            <div className="study__ratings">
              <RatingButtons options={preview.options} onRate={rate} />
              <p className="study__shortcut-hint" aria-hidden="true">
                Press <kbd>1</kbd>–<kbd>4</kbd> to answer
              </p>
            </div>
          )}
        </>
      ) : (
        <SessionEnd deck={deck} reviewed={session.reviewedIds.size} answers={session.answers} />
      )}
    </div>
  );
}

function SessionEnd({ deck, reviewed, answers }) {
  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const finished = reviewed > 0;

  return (
    <section className="study__end" aria-labelledby="study-end-title">
      <h1 id="study-end-title" ref={headingRef} tabIndex={-1} className="study__end-title">
        {finished ? 'Session complete' : 'Nothing to study right now'}
      </h1>
      {finished ? (
        <p className="study__end-text">
          You reviewed <strong>{reviewed}</strong> {reviewed === 1 ? 'card' : 'cards'}
          {answers > reviewed && ` (${answers} answers, counting repeats)`}. Your progress is saved.
        </p>
      ) : (
        <p className="study__end-text">
          You've reviewed everything due in {deck.title} and reached today's limit of {NEW_CARDS_PER_DAY} new
          cards. Come back tomorrow.
        </p>
      )}
      <div className="study__end-actions">
        <Link className="button button--primary" to={`/deck/${deck.id}`}>
          Back to {deck.title}
        </Link>
        <Link className="button" to="/">
          All decks
        </Link>
      </div>
    </section>
  );
}
