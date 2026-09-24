import { categoryName } from '../data/categories';
import type { Game } from '../types/game';

/** Pure metadata builders shared by the runtime <head> manager and the static page generator. */
export interface PageMeta {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'game';
  /** Public path of a preview image, e.g. images/games/neon-grid.jpg */
  image?: string;
}

export const SITE_TITLE = 'VOLTARA — Enter the Game';
export const SITE_DESCRIPTION = 'Instant-play browser games. No account. No waiting. Just play.';

export function gameMeta(g: Game): PageMeta {
  const status = g.type === 'COMING_SOON' ? ' (in development)' : '';
  return {
    title: `${g.title}${status} — Play free in your browser | VOLTARA`,
    description: `${g.tagline} ${categoryName(g.category)} game${g.type === 'COMING_SOON' ? ' coming to VOLTARA' : ' — instant play, no download, no account'}.`,
    path: `/games/${g.slug}`,
    type: 'game',
    image: g.thumbnail,
  };
}

export function gameJsonLd(g: Game, origin: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: g.title,
    description: g.description,
    genre: categoryName(g.category),
    gamePlatform: 'Web browser',
    applicationCategory: 'Game',
    operatingSystem: 'Any',
    ...(origin ? { url: `${origin}/games/${g.slug}` } : {}),
    ...(g.source === 'original' ? { publisher: { '@type': 'Organization', name: 'VOLTARA' } } : {}),
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}
