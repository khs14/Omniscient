import './ExternalBadge.css';

/** Small "External tool" label marking anything that is not built by Omniscient. */
export default function ExternalBadge() {
  return (
    <span className="external-badge">
      <svg className="external-badge__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path
          d="M9 2h5v5M14 2 7.5 8.5M12 9.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      External tool
    </span>
  );
}
