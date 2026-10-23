import { Link } from 'react-router';
import './NotFound.css';

export default function NotFound({ message = 'This page does not exist.' }) {
  return (
    <div className="page page--narrow not-found">
      <title>Not found · Omniscient</title>
      <h1>Not found</h1>
      <p className="not-found__text">
        {message} <Link to="/">Go to all decks</Link>.
      </p>
    </div>
  );
}
