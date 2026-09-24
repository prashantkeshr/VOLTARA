import { ArrowRight, History, Search, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryName } from '../data/categories';
import { isPlayable } from '../data/games';
import { useLocalState } from '../hooks/useLocalState';
import { SEARCH_SUGGESTIONS, searchGames } from '../lib/search';
import { store } from '../lib/storage';
import { GameArt } from './GameArt';

interface Props {
  autoFocus?: boolean;
  onDone?: () => void;
  variant?: 'header' | 'page';
}

/** Instant search with a live results panel. Enter opens the full Discover view. */
export function SearchBar({ autoFocus, onDone, variant = 'header' }: Props) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { searches } = useLocalState();
  const listId = useId();

  const results = useMemo(() => (q.trim() ? searchGames(q).slice(0, 6) : []), [q]);
  const showRecent = !q.trim() && searches.length > 0;

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // "/" focuses search from anywhere (except while typing in a field).
  useEffect(() => {
    if (variant !== 'header') return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [variant]);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  const finish = () => {
    setOpen(false);
    setActive(-1);
    onDone?.();
  };

  const goSearch = (term: string) => {
    const t = term.trim();
    if (!t) return;
    store.addSearch(t);
    navigate(`/discover?q=${encodeURIComponent(t)}`);
    setQ('');
    inputRef.current?.blur();
    finish();
  };

  const goGame = (slug: string) => {
    if (q.trim()) store.addSearch(q);
    navigate(`/games/${slug}`);
    setQ('');
    inputRef.current?.blur();
    finish();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && results[active]) goGame(results[active].slug);
      else goSearch(q);
    } else if (e.key === 'Escape') {
      if (q) setQ('');
      else {
        inputRef.current?.blur();
        finish();
      }
    }
  };

  const panelOpen = open && (results.length > 0 || showRecent || q.trim().length > 0);

  return (
    <div className={`search search--${variant}`} ref={wrapRef}>
      <div className="search__field">
        <Search size={16} className="search__icon" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={panelOpen}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-label="Search games"
          placeholder="Search games, genres, controls…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
        />
        {q ? (
          <button type="button" className="search__clear" onClick={() => setQ('')} aria-label="Clear search">
            <X size={14} />
          </button>
        ) : (
          variant === 'header' && <kbd className="search__kbd">/</kbd>
        )}
      </div>

      {panelOpen && (
        <div className="search__panel" id={listId} role="listbox" aria-label="Search results">
          {showRecent && (
            <div className="search__group">
              <p className="eyebrow">Recent searches</p>
              {searches.slice(0, 5).map((s) => (
                <button key={s} type="button" className="search__recent" onClick={() => goSearch(s)}>
                  <History size={14} aria-hidden="true" /> {s}
                </button>
              ))}
            </div>
          )}
          {results.map((g, i) => (
            <button
              key={g.slug}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              type="button"
              className={`search__result${i === active ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => goGame(g.slug)}
            >
              <GameArt game={g} className="search__thumb" />
              <span className="search__text">
                <span className="search__title">{g.title}</span>
                <span className="search__meta">
                  {categoryName(g.category)} · {isPlayable(g) ? 'Play now' : 'Coming soon'}
                </span>
              </span>
            </button>
          ))}
          {q.trim() && results.length === 0 && (
            <div className="search__none">
              <p>
                No games match <strong>“{q.trim()}”</strong>.
              </p>
              <p className="search__try">
                Try:{' '}
                {SEARCH_SUGGESTIONS.slice(0, 5).map((s) => (
                  <button key={s} type="button" className="chip chip--button" onClick={() => setQ(s)}>
                    {s}
                  </button>
                ))}
              </p>
            </div>
          )}
          {q.trim() && (
            <button type="button" className="search__all" onClick={() => goSearch(q)}>
              See all results in Discover <ArrowRight size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
