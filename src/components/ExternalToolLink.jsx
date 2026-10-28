import { useId } from 'react';
import ExternalBadge from './ExternalBadge.jsx';
import './ExternalToolLink.css';

/**
 * Links one word to a third-party learning tool (e.g. PlayPhrase.me), clearly
 * labelled as external and not made by Omniscient.
 * @param {{ tool: import('../lib/externalTools.js').ExternalTool, word: string }} props
 */
export default function ExternalToolLink({ tool, word }) {
  const titleId = useId();

  return (
    <aside className="external-tool" aria-labelledby={titleId}>
      <ExternalBadge />
      <h3 id={titleId} className="external-tool__title">
        {tool.action}: “{word}”
      </h3>
      <p className="external-tool__text">{tool.description}</p>
      <a
        className="button external-tool__link"
        href={tool.url(word)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open {tool.name}
        <span className="visually-hidden"> (external website, opens in a new tab)</span>
      </a>
      <p className="external-tool__disclaimer">
        {tool.name} is an independent website. It isn't made by or affiliated with the Omniscient team. We
        link to it because hearing a word in real movie and TV dialogue is a good way to learn it.
      </p>
    </aside>
  );
}
