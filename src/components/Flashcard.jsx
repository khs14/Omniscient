import { useEffect, useRef } from 'react';
import CardDetails from './CardDetails.jsx';
import './Flashcard.css';

/**
 * A two-sided flashcard. Front: word and part of speech. Back: the full card.
 * The hidden side is `inert`, so its links and buttons can't be focused and
 * screen readers skip it.
 */
export default function Flashcard({ card, flipped, onFlip }) {
  const revealRef = useRef(null);
  const backRef = useRef(null);

  // A new card starts with focus on "Show answer"; after flipping, focus moves
  // to the answer so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (flipped) backRef.current?.focus({ preventScroll: true });
    else revealRef.current?.focus({ preventScroll: true });
  }, [flipped]);

  return (
    <section
      className={flipped ? 'flashcard flashcard--flipped' : 'flashcard'}
      aria-label={`Flashcard for ${card.word}`}
    >
      <div className="flashcard__inner">
        <div className="flashcard__face flashcard__front" inert={flipped}>
          <h2 className="flashcard__word">{card.word}</h2>
          <p className="flashcard__pos">{card.partOfSpeech}</p>
          <button
            ref={revealRef}
            type="button"
            className="button button--primary flashcard__reveal"
            onClick={onFlip}
          >
            Show answer
          </button>
          <p className="flashcard__hint" aria-hidden="true">
            or press <kbd>Space</kbd>
          </p>
        </div>

        <div
          ref={backRef}
          className="flashcard__face flashcard__back"
          inert={!flipped}
          tabIndex={-1}
          role="region"
          aria-label={`Answer: ${card.word}`}
        >
          <header className="flashcard__back-header">
            <h2 className="flashcard__back-word">{card.word}</h2>
            <p className="flashcard__pos">{card.partOfSpeech}</p>
          </header>
          <CardDetails card={card} />
        </div>
      </div>
    </section>
  );
}
