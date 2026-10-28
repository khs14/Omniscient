import { getExternalTool } from '../lib/externalTools.js';
import { splitOnWord } from '../lib/text.js';
import ExternalToolLink from './ExternalToolLink.jsx';
import './CardDetails.css';

/**
 * The "answer" content of a card: definition, topic sentence with the word
 * highlighted, explanation and sources. Cards from external-tool decks (e.g.
 * Cinephile) show the definition plus a clearly labelled link to that tool;
 * any optional fields they do have are shown too. Used on the back of the
 * flashcard and on the word page.
 */
export default function CardDetails({ card }) {
  const tool = getExternalTool(card.externalTool);
  const parts = card.sentence ? splitOnWord(card.sentence, card.word) : [];

  return (
    <div className="card-details">
      <p className="card-details__definition">{card.definition}</p>

      {card.sentence && (
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
      )}

      {card.explanation && <p className="card-details__explanation">{card.explanation}</p>}

      {tool && <ExternalToolLink tool={tool} word={card.word} />}

      {card.citations.length > 0 && (
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
      )}
    </div>
  );
}
