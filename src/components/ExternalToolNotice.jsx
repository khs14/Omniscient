import ExternalBadge from './ExternalBadge.jsx';
import './ExternalToolNotice.css';

/**
 * Deck-level note explaining that the deck's cards link to a third-party tool.
 * @param {{ tool: import('../lib/externalTools.js').ExternalTool }} props
 */
export default function ExternalToolNotice({ tool }) {
  return (
    <aside className="external-notice" aria-label={`About ${tool.name}`}>
      <ExternalBadge />
      <p className="external-notice__text">
        Every card in this deck links to{' '}
        <a href={tool.homepage} target="_blank" rel="noopener noreferrer">
          {tool.name}
          <span className="visually-hidden"> (external website, opens in a new tab)</span>
        </a>
        , where you can hear the word in movie and TV clips. {tool.name} is an external tool, not created by
        the Omniscient team, but we think it's a good way to learn.
      </p>
    </aside>
  );
}
