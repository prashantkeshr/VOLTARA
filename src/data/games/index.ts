import type { CategoryId, Game } from '../../types/game';
import { actionGames } from './action';
import { arcadeGames } from './arcade';
import { boardGames, casualGames, educationalGames, sportsGames, strategyGames } from './more';
import { puzzleGames } from './puzzle';
import { racingGames } from './racing';

/**
 * The full catalog. To add a game, append an entry to the relevant category
 * module — no page or component changes are needed.
 */
export const games: Game[] = [
  ...arcadeGames,
  ...actionGames,
  ...puzzleGames,
  ...racingGames,
  ...strategyGames,
  ...sportsGames,
  ...casualGames,
  ...boardGames,
  ...educationalGames,
];

const bySlug = new Map(games.map((g) => [g.slug, g]));

if (bySlug.size !== games.length) {
  throw new Error('VOLTARA catalog: duplicate game slug detected');
}

export function getGame(slug: string | undefined): Game | undefined {
  return slug ? bySlug.get(slug) : undefined;
}

export function isPlayable(g: Game): boolean {
  return g.status === 'live' && g.type !== 'COMING_SOON';
}

export const playableGames = games.filter(isPlayable);

export function gamesInCategory(id: CategoryId): Game[] {
  return games.filter((g) => g.category === id || (id === 'multiplayer' && g.multiplayer));
}

export function byCuratedRank(a: Game, b: Game): number {
  return Number(isPlayable(b)) - Number(isPlayable(a)) || a.curatedRank - b.curatedRank || a.title.localeCompare(b.title);
}
