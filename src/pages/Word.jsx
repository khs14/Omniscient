import { Link, useParams } from 'react-router';
import CardDetails from '../components/CardDetails.jsx';
import { getWordIndex, wordKey } from '../lib/decks.js';
import NotFound from './NotFound.jsx';
import './Word.css';

/** All cards for one word, across every topic it appears in. */
export default function Word() {
  const { word } = useParams();
  const key = wordKey(word ?? '');
  const entry = getWordIndex().find((item) => item.key === key);

  if (!entry) return <NotFound message="That word isn't in any deck." />;

  const partsOfSpeech = [...new Set(entry.entries.map(({ card }) => card.partOfSpeech).filter(Boolean))];
  const topicCount = new Set(entry.entries.map(({ deck }) => deck.id)).size;

  return (
    <div className="page page--narrow word">
      <title>{`${entry.word} · Omniscient`}</title>
      <Link className="back-link" to="/words">
        All words
      </Link>
      <header className="word__header">
        <h1 className="word__title">{entry.word}</h1>
        {partsOfSpeech.length > 0 && <p className="word__pos">{partsOfSpeech.join(', ')}</p>}
      </header>
      <p className="word__summary">
        {entry.entries.length === 1 ? '1 card' : `${entry.entries.length} cards`} in{' '}
        {topicCount === 1 ? '1 topic' : `${topicCount} topics`}
      </p>

      <ul className="word__cards">
        {entry.entries.map(({ card, deck }, index) => (
          <li key={card.id} className="word__card">
            <article aria-labelledby={`word-card-${index}`}>
              <h2 id={`word-card-${index}`} className="word__deck">
                <Link to={`/deck/${deck.id}`}>{deck.title}</Link>
              </h2>
              <CardDetails card={card} />
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
