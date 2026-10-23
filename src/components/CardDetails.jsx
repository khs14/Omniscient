import { splitOnWord } from '../lib/text.js';
import './CardDetails.css';

/**
 * The "answer" content of a card: definition, topic sentence with the word
 * highlighted, explanation and sources. Used on the back of the flashcard and
 * on the word page.
 */
export default function CardDetails({ card }) {
  const parts = splitOnWord(card.sentence, card.word);

  return (
    <div className="card-details">
      <p className="card-details__definition">{card.definition}</p>

      <blockquote className="card-details__sentence">
        <p>
          {parts.map((part, i) =>
            part.match ? (
              <mark key={i} className="card-details__mark">
                {part.text}
              </mark>
            ) : (
              <span key={i}>{part.text}</span>
            ),
          )}
        </p>
      </blockquote>

      <p className="card-details__explanation">{card.explanation}</p>

      <section className="card-details__sources" aria-label="Sources">
        <h3 className="card-details__sources-title">Sources</h3>
        <ul className="card-details__sources-list">
          {card.citations.map((citation) => (
            <li key={citation.url}>
              <a href={citation.url} target="_blank" rel="noopener noreferrer">
                {citation.title}
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
