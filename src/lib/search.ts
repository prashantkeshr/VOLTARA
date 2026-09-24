import { categoryName } from '../data/categories';
import { games, isPlayable } from '../data/games';
import type { Game } from '../types/game';

/**
 * Instant client-side search. Each game gets a weighted field index built
 * once; queries are tokenised and every token must match somewhere (AND).
 */

interface IndexedGame {
  game: Game;
  fields: { text: string; weight: number }[];
}

const DURATION_WORDS: Record<string, string> = {
  quick: 'quick short fast',
  medium: 'medium',
  long: 'long endless',
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ');

const index: IndexedGame[] = games.map((game) => ({
  game,
  fields: [
    { text: norm(game.title), weight: 10 },
    { text: norm(game.tags.join(' ')), weight: 5 },
    { text: norm(`${categoryName(game.category)} ${game.category} ${game.subcategory}`), weight: 4 },
    { text: norm(`${game.controls.join(' ')} ${DURATION_WORDS[game.duration]}`), weight: 3 },
    { text: norm(`${game.difficulty} ${game.orientation}`), weight: 2 },
    { text: norm(`${game.tagline} ${game.description}`), weight: 1 },
  ],
}));

export function tokenize(query: string): string[] {
  return norm(query)
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

export function searchGames(query: string, pool: Game[] = games): Game[] {
  const tokens = tokenize(query);
  if (!tokens.length) return pool;
  const allowed = new Set(pool.map((g) => g.slug));

  const scored: { game: Game; score: number }[] = [];
  for (const entry of index) {
    if (!allowed.has(entry.game.slug)) continue;
    let total = 0;
    let all = true;
    for (const t of tokens) {
      let best = 0;
      for (const f of entry.fields) {
        const i = f.text.indexOf(t);
        if (i === -1) continue;
        // Prefix-of-word matches outrank mid-word matches.
        const atWord = i === 0 || f.text[i - 1] === ' ' || f.text[i - 1] === '-';
        best = Math.max(best, f.weight * (atWord ? 2 : 1));
      }
      if (!best) {
        all = false;
        break;
      }
      total += best;
    }
    if (all) scored.push({ game: entry.game, score: total + (isPlayable(entry.game) ? 50 : 0) });
  }
  return scored.sort((a, b) => b.score - a.score || a.game.curatedRank - b.game.curatedRank).map((s) => s.game);
}

export const SEARCH_SUGGESTIONS = ['racing', 'puzzle', 'quick', 'keyboard', 'touch', 'arcade', 'logic', 'endless'];
