import { games, isPlayable } from '../data/games';
import type { Game } from '../types/game';
import type { LocalState } from './storage';

/**
 * Lightweight on-device recommendations. No network, no model — a weighted
 * affinity score from local play history and favorites.
 */

const DAY = 86_400_000;

function recencyWeight(last: number): number {
  const days = (Date.now() - last) / DAY;
  return 1 / (1 + days / 7);
}

export function hasActivity(state: LocalState): boolean {
  return state.favorites.length > 0 || Object.keys(state.history).length > 0;
}

export function recommend(state: LocalState, limit = 8, exclude: string[] = []): Game[] {
  const catAffinity = new Map<string, number>();
  const tagAffinity = new Map<string, number>();
  const bump = (g: Game, w: number) => {
    catAffinity.set(g.category, (catAffinity.get(g.category) ?? 0) + w);
    g.tags.forEach((t) => tagAffinity.set(t, (tagAffinity.get(t) ?? 0) + w * 0.4));
  };

  for (const [slug, rec] of Object.entries(state.history)) {
    const g = games.find((x) => x.slug === slug);
    if (!g) continue;
    bump(g, (Math.log2(1 + rec.plays) + Math.min(rec.seconds / 300, 2)) * recencyWeight(rec.last));
  }
  for (const slug of state.favorites) {
    const g = games.find((x) => x.slug === slug);
    if (g) bump(g, 2);
  }
  if (!catAffinity.size) return [];

  const skip = new Set(exclude);
  return games
    .filter((g) => isPlayable(g) && !skip.has(g.slug))
    .map((g) => {
      const played = state.history[g.slug];
      let score = (catAffinity.get(g.category) ?? 0) * 3;
      g.tags.forEach((t) => (score += tagAffinity.get(t) ?? 0));
      // Favour discovery: already-played games rank lower.
      if (played) score *= 0.35;
      return { g, score: score - g.curatedRank * 0.001 };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.g);
}

/** Related games for a detail page: same category first, then shared tags. */
export function relatedGames(game: Game, limit = 6): Game[] {
  return games
    .filter((g) => g.slug !== game.slug)
    .map((g) => {
      let s = g.category === game.category ? 10 : 0;
      s += g.tags.filter((t) => game.tags.includes(t)).length * 3;
      if (g.subcategory === game.subcategory) s += 2;
      if (isPlayable(g)) s += 6;
      return { g, s };
    })
    .filter((x) => x.s > 6)
    .sort((a, b) => b.s - a.s || a.g.curatedRank - b.g.curatedRank)
    .slice(0, limit)
    .map((x) => x.g);
}

/** Games played on this device, most-played first. Only truthful local data. */
export function popularOnDevice(state: LocalState, limit = 8): Game[] {
  return Object.entries(state.history)
    .sort(([, a], [, b]) => b.plays - a.plays || b.seconds - a.seconds)
    .map(([slug]) => games.find((g) => g.slug === slug))
    .filter((g): g is Game => Boolean(g))
    .slice(0, limit);
}

export function recentlyPlayed(state: LocalState, limit = 12): Game[] {
  return Object.entries(state.history)
    .sort(([, a], [, b]) => b.last - a.last)
    .map(([slug]) => games.find((g) => g.slug === slug))
    .filter((g): g is Game => Boolean(g))
    .slice(0, limit);
}
