import { Link, useSearchParams } from 'react-router';
import { getWordIndex } from '../lib/decks.js';
import './Words.css';

const wordIndex = getWordIndex();

function matches(entry, query) {
  if (!query) return true;
  if (entry.key.includes(query)) return true;
  return entry.entries.some(
    ({ card, deck }) =>
      card.definition.toLowerCase().includes(query) || deck.title.toLowerCase().includes(query),
  );
}

export default function Words() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawQuery = searchParams.get('q') ?? '';
  const query = rawQuery.trim().toLowerCase();
  const results = wordIndex.filter((entry) => matches(entry, query));

  function onChange(event) {
    const value = event.target.value;
    setSearchParams(value ? { q: value } : {}, { replace: true });
  }

  return (
    <div className="page words">
      <title>Words · Omniscient</title>
      <header className="words__header">
        <h1>Words</h1>
        <p className="words__lead">Every word across all decks. Some words appear in more than one topic.</p>
      </header>

      <form className="words__search" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="words__label" htmlFor="word-search">
          Search words, definitions or topics
        </label>
        <input
          id="word-search"
          className="words__input"
          type="search"
          value={rawQuery}
          onChange={onChange}
          autoComplete="off"
          spellCheck="false"
          placeholder="e.g. ephemeral"
        />
      </form>

      <p className="words__count" role="status">
        {results.length === wordIndex.length
          ? `${wordIndex.length} words`
          : `${results.length} of ${wordIndex.length} words`}
      </p>

      {results.length === 0 ? (
        <p className="words__empty">
          No words match “{rawQuery.trim()}”. Try part of a word or a topic name.
        </p>
      ) : (
        <ul className="words__list">
          {results.map((entry) => {
            const topics = [...new Map(entry.entries.map(({ deck }) => [deck.id, deck])).values()];
            return (
              <li key={entry.key} className="words__item">
                <Link className="words__link" to={`/words/${encodeURIComponent(entry.key)}`}>
                  <span className="words__word">{entry.word}</span>
                  <span className="words__definition">{entry.entries[0].card.definition}</span>
                </Link>
                <ul className="words__topics" aria-label={`Topics for ${entry.word}`}>
                  {topics.map((deck) => (
                    <li key={deck.id}>
                      <Link className="words__topic" to={`/deck/${deck.id}`}>
                        {deck.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
