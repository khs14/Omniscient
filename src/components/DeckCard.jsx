import { Link } from 'react-router';
import './DeckCard.css';

/**
 * Summary tile for a deck on the home page. The whole tile is clickable via
 * the title link (stretched over the card), keeping a single tab stop.
 */
export default function DeckCard({ deck, stats }) {
  const cardLabel = stats.total === 1 ? '1 card' : `${stats.total} cards`;

  return (
    <article className="deck-card">
      <h3 className="deck-card__title">
        <Link className="deck-card__link" to={`/deck/${deck.id}`}>
          {deck.title}
        </Link>
      </h3>
      <p className="deck-card__description">{deck.description}</p>
      <ul className="deck-card__stats">
        <li className="deck-card__stat">{cardLabel}</li>
        <li className={stats.dueToday > 0 ? 'deck-card__stat deck-card__stat--due' : 'deck-card__stat'}>
          {stats.dueToday} due today
        </li>
        {stats.newToday > 0 && <li className="deck-card__stat">{stats.newToday} new</li>}
      </ul>
    </article>
  );
}
