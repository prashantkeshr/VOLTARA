import { Search, SearchX, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { games } from '../data/games';
import { useLocalState } from '../hooks/useLocalState';
import { applyFilters, filtersFromParams, filtersToParams, type Filters } from '../lib/filters';
import { SEARCH_SUGGESTIONS, searchGames } from '../lib/search';
import { store } from '../lib/storage';
import type { CategoryId } from '../types/game';
import { FilterBar } from './FilterBar';
import { GameGrid } from './GameGrid';
import { EmptyState } from './States';

const PAGE = 48;

interface Props {
  fixedCategory?: CategoryId;
  showSearch?: boolean;
}

/**
 * Search + filter + sort over the catalog. All state lives in the URL so
 * results are shareable and survive reloads. Rendering is incremental:
 * 48 cards at a time, more as the sentinel scrolls into view.
 */
export function GameBrowser({ fixedCategory, showSearch = true }: Props) {
  const [params, setParams] = useSearchParams();
  const state = useLocalState();
  const filters = useMemo(() => {
    const f = filtersFromParams(params);
    return fixedCategory ? { ...f, category: fixedCategory } : f;
  }, [params, fixedCategory]);

  const [draft, setDraft] = useState(filters.q);
  useEffect(() => setDraft(filters.q), [filters.q]);

  const update = (patch: Partial<Filters>) => {
    const next = { ...filters, ...patch };
    const p = filtersToParams(next);
    if (fixedCategory) p.delete('category');
    setParams(p, { replace: true });
  };

  // Debounce typing into the URL.
  useEffect(() => {
    if (draft === filters.q) return;
    const t = window.setTimeout(() => update({ q: draft }), 160);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const results = useMemo(() => {
    const pool = filters.q ? searchGames(filters.q, games) : games;
    return applyFilters(pool, filters, state);
  }, [filters, state]);

  const [limit, setLimit] = useState(PAGE);
  useEffect(() => setLimit(PAGE), [filters]);
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || limit >= results.length) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && setLimit((l) => l + PAGE), { rootMargin: '600px' });
    io.observe(el);
    return () => io.disconnect();
  }, [limit, results.length]);

  return (
    <div className="browser">
      {showSearch && (
        <form
          className="browser__search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            store.addSearch(draft);
            update({ q: draft });
          }}
        >
          <Search size={18} aria-hidden="true" />
          <input type="search" aria-label="Search games" placeholder="Search by title, genre, tag, controls…" value={draft} onChange={(e) => setDraft(e.target.value)} enterKeyHint="search" />
          {draft && (
            <button type="button" className="icon-btn" aria-label="Clear search" onClick={() => setDraft('')}>
              <X size={16} />
            </button>
          )}
        </form>
      )}

      <FilterBar filters={filters} onChange={update} showCategories={!fixedCategory} count={results.length} />

      {results.length > 0 ? (
        <>
          <GameGrid games={results.slice(0, limit)} label="Games" />
          {limit < results.length && <div ref={sentinel} className="browser__sentinel" aria-hidden="true" />}
        </>
      ) : (
        <EmptyState
          icon={<SearchX size={28} />}
          title="NO RESULTS"
          body={
            <>
              <p>{filters.q ? `Nothing matches “${filters.q}” with the current filters.` : 'No games match the current filters.'}</p>
              <p className="state__try">
                Try:{' '}
                {SEARCH_SUGGESTIONS.map((s) => (
                  <button key={s} type="button" className="chip chip--button" onClick={() => setParams(new URLSearchParams({ q: s }), { replace: true })}>
                    {s}
                  </button>
                ))}
              </p>
            </>
          }
          action={
            <button type="button" className="btn" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
              Reset search and filters
            </button>
          }
        />
      )}
    </div>
  );
}
