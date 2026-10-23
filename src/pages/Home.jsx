import DeckCard from '../components/DeckCard.jsx';
import { decks, getDecksByCategory } from '../lib/decks.js';
import { getDeckStats } from '../lib/scheduler.js';
import { useNow, useProgress } from '../lib/useProgress.js';
import './Home.css';

const categoryId = (category) => `category-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
const listFormat = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

export default function Home() {
  const progress = useProgress();
  const now = useNow();
  const groups = getDecksByCategory();
  const wordCount = decks.reduce((sum, deck) => sum + deck.cards.length, 0);

  return (
    <div className="page home">
      <title>Omniscient · GRE words by topic</title>
      <header className="home__intro">
        <h1 className="home__title">Learn GRE words through topics you care about</h1>
        <p className="home__lead">
          Pick a topic you already enjoy
          {groups.length > 0 && <>, from {listFormat.format(groups.map((group) => group.category))}</>}. Every
          card puts a GRE word in a sentence about a real idea from that topic, with a source you can check,
          so new vocabulary sticks to things you already know.
        </p>
      </header>

      {decks.length === 0 ? (
        <p className="home__empty">
          No decks yet. Add a JSON file to <code>src/data/decks/</code> to create one.
        </p>
      ) : (
        <>
          <nav className="home__subjects" aria-label="Subjects">
            <p className="home__summary">
              {plural(decks.length, 'topic')} in {plural(groups.length, 'subject')},{' '}
              {plural(wordCount, 'card')} in all.
            </p>
            <ul className="home__subject-list">
              {groups.map((group) => (
                <li key={group.category}>
                  <a className="home__subject" href={`#${categoryId(group.category)}`}>
                    {group.category}
                    <span className="home__subject-count">{group.decks.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {groups.map((group) => {
            const headingId = categoryId(group.category);
            return (
              <section key={group.category} className="home__category" aria-labelledby={headingId}>
                <h2 id={headingId} className="home__category-title">
                  {group.category}
                  <span className="home__category-count">{plural(group.decks.length, 'topic')}</span>
                </h2>
                <div className="home__grid">
                  {group.decks.map((deck) => (
                    <DeckCard key={deck.id} deck={deck} stats={getDeckStats(deck, progress, now)} />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
