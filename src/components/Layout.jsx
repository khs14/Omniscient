import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { useIsPersistent } from '../lib/useProgress.js';
import './Layout.css';

const NAV_ITEMS = [
  { to: '/', label: 'Decks', end: true },
  { to: '/words', label: 'Words', end: false },
  { to: '/settings', label: 'Settings', end: false },
  { to: '/contact', label: 'Contact', end: false },
];

export default function Layout() {
  const { pathname } = useLocation();
  const persistent = useIsPersistent();

  // Start each page at the top, like a normal page load.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="layout">
      <a className="layout__skip" href="#main">
        Skip to content
      </a>
      <header className="layout__header">
        <div className="layout__bar">
          <Link className="layout__brand" to="/">
            Omniscient
          </Link>
          <nav className="layout__nav" aria-label="Main">
            <ul className="layout__nav-list">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? 'layout__nav-link layout__nav-link--active' : 'layout__nav-link'
                    }
                    to={item.to}
                    end={item.end}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {!persistent && (
        <p className="layout__notice" role="status">
          This browser is blocking storage, so your progress will be lost when you close the tab. Use Settings
          → Export progress to keep a copy.
        </p>
      )}

      <main id="main" className="layout__main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
