import type { Game } from '../../types/game';

type Required =
  | 'slug'
  | 'title'
  | 'tagline'
  | 'description'
  | 'category'
  | 'subcategory'
  | 'art';

/**
 * Helper for catalog entries: fills sensible defaults so each entry only
 * declares what makes it distinct. VOLTARA Originals default to LOCAL and
 * resolve to /games/<slug>/index.html.
 */
export function original(g: Pick<Game, Required> & Partial<Game>): Game {
  return {
    id: g.slug,
    tags: [],
    difficulty: 'medium',
    controls: ['mouse', 'touch'],
    keyBindings: [],
    instructions: [],
    orientation: 'any',
    // Intended desktop frame shape. Phones fill the screen unless the game is landscape-only.
    aspectRatio: 4 / 3,
    duration: 'quick',
    multiplayer: false,
    featured: false,
    curatedRank: 100,
    releaseDate: '2026-09-01',
    type: 'LOCAL',
    source: 'original',
    url: `games/${g.slug}/game.html`,
    embedAllowed: true,
    status: 'live',
    ...g,
  };
}

/** A VOLTARA Original that is designed but not yet built. */
export function upcoming(g: Pick<Game, Required> & Partial<Game>): Game {
  return original({
    type: 'COMING_SOON',
    status: 'coming-soon',
    url: null,
    embedAllowed: false,
    curatedRank: 500,
    releaseDate: '2026-12-01',
    ...g,
  });
}
