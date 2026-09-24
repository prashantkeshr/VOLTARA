import { Compass, Heart, History, House, LayoutGrid, Menu, Search, Settings, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { categories } from '../data/categories';
import { useLocalState } from '../hooks/useLocalState';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';

const PRIMARY = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/categories', label: 'Categories', icon: LayoutGrid },
];

export function Header() {
  const [drawer, setDrawer] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const { favorites } = useLocalState();
  const { pathname } = useLocation();

  useEffect(() => {
    setDrawer(false);
    setMobileSearch(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawer]);

  return (
    <>
      <header className="header">
        <div className="header__inner">
          <Logo />
          <nav className="header__nav" aria-label="Primary">
            {PRIMARY.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className="header__link">
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="header__search">
            <SearchBar />
          </div>
          <nav className="header__tools" aria-label="Your library">
            <NavLink to="/favorites" className="icon-btn" aria-label={`Favorites (${favorites.length})`} title="Favorites">
              <Heart size={18} aria-hidden="true" />
              {favorites.length > 0 && <span className="icon-btn__dot" aria-hidden="true" />}
            </NavLink>
            <NavLink to="/recent" className="icon-btn" aria-label="Recently played" title="Recently played">
              <History size={18} aria-hidden="true" />
            </NavLink>
            <NavLink to="/settings" className="icon-btn" aria-label="Settings" title="Settings">
              <Settings size={18} aria-hidden="true" />
            </NavLink>
          </nav>
          <div className="header__mobile">
            <button type="button" className="icon-btn" aria-label="Search" aria-expanded={mobileSearch} onClick={() => setMobileSearch((v) => !v)}>
              {mobileSearch ? <X size={20} /> : <Search size={20} />}
            </button>
            <button type="button" className="icon-btn" aria-label="Open menu" aria-expanded={drawer} onClick={() => setDrawer(true)}>
              <Menu size={20} />
            </button>
          </div>
        </div>
        {mobileSearch && (
          <div className="header__mobile-search">
            <SearchBar autoFocus variant="page" onDone={() => setMobileSearch(false)} />
          </div>
        )}
      </header>

      {/* Mobile drawer */}
      <div className={`drawer${drawer ? ' is-open' : ''}`} aria-hidden={!drawer}>
        <div className="drawer__scrim" onClick={() => setDrawer(false)} />
        <nav className="drawer__panel" aria-label="Menu">
          <div className="drawer__head">
            <Logo onClick={() => setDrawer(false)} />
            <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setDrawer(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="drawer__links">
            {[...PRIMARY, { to: '/favorites', label: 'Favorites', icon: Heart }, { to: '/recent', label: 'Recently Played', icon: History }, { to: '/settings', label: 'Settings', icon: Settings }].map((l) => (
              <NavLink key={l.to} to={l.to} end={'end' in l} className="drawer__link">
                <l.icon size={18} aria-hidden="true" /> {l.label}
              </NavLink>
            ))}
          </div>
          <p className="eyebrow drawer__label">Categories</p>
          <div className="drawer__cats">
            {categories.map((c) => (
              <NavLink key={c.id} to={`/categories/${c.id}`} className="drawer__cat">
                {c.name}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="bottom-nav" aria-label="Primary mobile">
        {[...PRIMARY, { to: '/favorites', label: 'Favorites', icon: Heart }, { to: '/recent', label: 'Recent', icon: History }].map((l) => (
          <NavLink key={l.to} to={l.to} end={'end' in l} className="bottom-nav__item">
            <l.icon size={20} aria-hidden="true" />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
