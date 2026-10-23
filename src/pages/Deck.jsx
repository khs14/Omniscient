import { Link, useParams } from 'react-router';
import { getDeck, wordKey } from '../lib/decks.js';
import { formatInterval, getDeckStats, isDueToday, isLearning, isNew } from '../lib/scheduler.js';
import { getCardState } from '../lib/storage.js';
import { useNow, useProgress } from '../lib/useProgress.js';
import NotFound from './NotFound.jsx';
import './Deck.css';

function cardStatus(state, now) {
  if (isNew(state)) return { label: 'New', modifier: 'new' };
  if (isDueToday(state, now)) return { label: 'Due today', modifier: 'due' };
  if (isLearning(state)) return { label: 'Learning', modifier: 'learning' };
  return { label: `In ${formatInterval(state.due.getTime() - now.getTime())}`, modifier: 'later' };
}

export default function Deck() {
  const { id } = useParams();
  const deck = getDeck(id);
  const progress = useProgress();
  const now = useNow();

  if (!deck) return <NotFound message="There is no deck with that address." />;

  const stats = getDeckStats(deck, progress, now);
  const toStudy = stats.dueToday + stats.newToday;

  return (
    <div className="page deck">
      <title>{`${deck.title} · Omniscient`}</title>
      <Link className="back-link" to="/">
        All decks
      </Link>

      <header className="deck__header">
        <p className="deck__category">{deck.category}</p>
        <h1>{deck.title}</h1>
        <p className="deck__description">{deck.description}</p>
      </header>

      <section className="deck__overview" aria-label="Progress">
        <dl className="deck__stats">
          <div className="deck__stat">
            <dt>New</dt>
            <dd>{stats.new}</dd>
          </div>
          <div className="deck__stat">
            <dt>Learning</dt>
            <dd>{stats.learning}</dd>
          </div>
          <div className="deck__stat deck__stat--due">
            <dt>Due</dt>
            <dd>{stats.review}</dd>
          </div>
        </dl>

        <div className="deck__actions">
          {toStudy > 0 ? (
            <Link className="button button--primary deck__study" to={`/deck/${deck.id}/study`}>
              Study {toStudy} {toStudy === 1 ? 'card' : 'cards'}
            </Link>
          ) : (
            <>
              <button type="button" className="button button--primary deck__study" disabled>
                Study
              </button>
              <p className="deck__caught-up">You're done for today. Come back tomorrow for more.</p>
            </>
          )}
        </div>
      </section>

      <section className="deck__words" aria-labelledby="deck-words-title">
        <h2 id="deck-words-title" className="deck__words-title">
          Words in this deck <span className="deck__words-count">({deck.cards.length})</span>
        </h2>
        <ul className="deck__list">
          {deck.cards.map((card) => {
            const status = cardStatus(getCardState(progress, card.id), now);
            return (
              <li key={card.id} className="deck__item">
                <div className="deck__item-main">
                  <Link className="deck__item-word" to={`/words/${encodeURIComponent(wordKey(card.word))}`}>
                    {card.word}
                  </Link>
                  <span className="deck__item-pos">{card.partOfSpeech}</span>
                  <p className="deck__item-definition">{card.definition}</p>
                </div>
                <span className={`deck__badge deck__badge--${status.modifier}`}>{status.label}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
