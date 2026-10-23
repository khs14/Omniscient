import './RatingButtons.css';

/**
 * Again / Hard / Good / Easy, each labelled with the interval ts-fsrs would
 * schedule, e.g. "Good · 3d". Keys 1–4 are handled by the Study page.
 * @param {{ options: { rating: number, label: string, key: string, interval: string }[], onRate: (option) => void }} props
 */
export default function RatingButtons({ options, onRate }) {
  return (
    <div className="rating-buttons" role="group" aria-label="How well did you know it?">
      {options.map((option) => (
        <button
          key={option.rating}
          type="button"
          className={`rating-buttons__button rating-buttons__button--${option.label.toLowerCase()}`}
          onClick={() => onRate(option)}
          aria-keyshortcuts={option.key}
        >
          <kbd className="rating-buttons__key" aria-hidden="true">
            {option.key}
          </kbd>
          <span className="rating-buttons__text">
            {option.label}
            <span className="rating-buttons__interval">
              <span aria-hidden="true"> · </span>
              <span className="visually-hidden">, next review in </span>
              {option.interval}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
