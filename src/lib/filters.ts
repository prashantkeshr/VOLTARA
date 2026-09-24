import { byCuratedRank, isPlayable } from '../data/games';
import type { CategoryId, ControlScheme, Difficulty, Game, Orientation, PlayDuration } from '../types/game';
import type { LocalState } from './storage';

export type SortKey = 'featured' | 'popular' | 'newest' | 'az' | 'recent';

export const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'popular', label: 'Popular on this device' },
  { id: 'newest', label: 'Newest' },
  { id: 'az', label: 'A–Z' },
  { id: 'recent', label: 'Recently played' },
];

export interface Filters {
  q: string;
  category: CategoryId | 'all';
  difficulty: Difficulty | 'any';
  controls: ControlScheme | 'any';
  orientation: Orientation | 'any';
  duration: PlayDuration | 'any';
  multiplayer: boolean;
  isNew: boolean;
  favorites: boolean;
  playable: boolean;
  sort: SortKey;
}

export const defaultFilters: Filters = {
  q: '',
  category: 'all',
  difficulty: 'any',
  controls: 'any',
  orientation: 'any',
  duration: 'any',
  multiplayer: false,
  isNew: false,
  favorites: false,
  playable: false,
  sort: 'featured',
};

const BOOL_KEYS = ['multiplayer', 'isNew', 'favorites', 'playable'] as const;

export function filtersFromParams(p: URLSearchParams): Filters {
  const f: Filters = { ...defaultFilters };
  (Object.keys(defaultFilters) as (keyof Filters)[]).forEach((k) => {
    const v = p.get(k);
    if (v === null) return;
    if ((BOOL_KEYS as readonly string[]).includes(k)) (f as unknown as Record<string, unknown>)[k] = v === '1';
    else (f as unknown as Record<string, unknown>)[k] = v;
  });
  return f;
}

export function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  (Object.keys(f) as (keyof Filters)[]).forEach((k) => {
    const v = f[k];
    if (v === defaultFilters[k]) return;
    p.set(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
  });
  return p;
}

export function activeFilterCount(f: Filters): number {
  return (Object.keys(f) as (keyof Filters)[]).filter((k) => k !== 'q' && k !== 'sort' && k !== 'category' && f[k] !== defaultFilters[k]).length;
}

/** "New" = released within 30 days of the newest title in the catalog. */
function newCutoff(pool: Game[]): number {
  const newest = Math.max(...pool.map((g) => Date.parse(g.releaseDate)));
  return newest - 30 * 86_400_000;
}

export function applyFilters(pool: Game[], f: Filters, state: LocalState): Game[] {
  const cutoff = newCutoff(pool);
  const favs = new Set(state.favorites);
  const out = pool.filter(
    (g) =>
      (f.category === 'all' || g.category === f.category || (f.category === 'multiplayer' && g.multiplayer)) &&
      (f.difficulty === 'any' || g.difficulty === f.difficulty) &&
      (f.controls === 'any' || g.controls.includes(f.controls)) &&
      (f.orientation === 'any' || g.orientation === f.orientation || g.orientation === 'any') &&
      (f.duration === 'any' || g.duration === f.duration) &&
      (!f.multiplayer || g.multiplayer) &&
      (!f.isNew || (Date.parse(g.releaseDate) >= cutoff && isPlayable(g))) &&
      (!f.favorites || favs.has(g.slug)) &&
      (!f.playable || isPlayable(g)),
  );
  return sortGames(out, f.sort, state, Boolean(f.q));
}

export function sortGames(list: Game[], sort: SortKey, state: LocalState, keepRelevance = false): Game[] {
  const h = state.history;
  const arr = [...list];
  switch (sort) {
    case 'featured':
      return keepRelevance ? arr : arr.sort((a, b) => Number(b.featured) - Number(a.featured) || byCuratedRank(a, b));
    case 'popular':
      return arr.sort((a, b) => (h[b.slug]?.plays ?? 0) - (h[a.slug]?.plays ?? 0) || byCuratedRank(a, b));
    case 'newest':
      return arr.sort((a, b) => Number(isPlayable(b)) - Number(isPlayable(a)) || b.releaseDate.localeCompare(a.releaseDate));
    case 'az':
      return arr.sort((a, b) => a.title.localeCompare(b.title));
    case 'recent':
      return arr.sort((a, b) => (h[b.slug]?.last ?? 0) - (h[a.slug]?.last ?? 0) || byCuratedRank(a, b));
  }
}
