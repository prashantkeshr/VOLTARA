import { useMemo } from 'react';
import { AdSlot } from '../components/AdSlot';
import { CategoryCard } from '../components/CategoryCard';
import { GameGrid } from '../components/GameGrid';
import { Hero } from '../components/Hero';
import { Section } from '../components/Section';
import { categories } from '../data/categories';
import { collections } from '../data/collections';
import { byCuratedRank, games, gamesInCategory, getGame, isPlayable, playableGames } from '../data/games';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useLocalState } from '../hooks/useLocalState';
import { timeAgo } from '../lib/format';
import { popularOnDevice, recentlyPlayed, recommend } from '../lib/recommend';
import type { CategoryId, Game } from '../types/game';

const HOME_CATEGORIES: CategoryId[] = ['action', 'arcade', 'puzzle', 'racing', 'strategy', 'sports', 'casual'];

export default function HomePage() {
  useDocumentMeta({ path: '/' });
  const state = useLocalState();

  const featured = useMemo(() => games.filter((g) => g.featured && isPlayable(g)).sort(byCuratedRank).slice(0, 6), []);
  const spotlight = featured[0];
  const quick = useMemo(() => playableGames.filter((g) => g.duration === 'quick').sort(byCuratedRank).slice(0, 6), []);
  const recent = useMemo(() => recentlyPlayed(state, 6), [state]);
  const popular = useMemo(() => popularOnDevice(state, 6).filter((g) => (state.history[g.slug]?.plays ?? 0) >= 2), [state]);
  const recommended = useMemo(() => recommend(state, 6), [state]);

  const originals = collections[0].slugs.map(getGame).filter((g): g is Game => Boolean(g));

  return (
    <>
      <Hero spotlight={spotlight} />

      <div className="page page--home">
        {recent.length > 0 && (
          <Section id="continue" title="Continue Playing" eyebrow="On this device" viewAll="/recent">
            <GameGrid games={recent} variant="row" label="Continue playing" metaFor={(g) => `Played ${timeAgo(state.history[g.slug].last)}`} />
          </Section>
        )}

        <Section id="featured" title="Featured" eyebrow="Curated by VOLTARA" viewAll="/discover?sort=featured">
          <GameGrid games={featured} variant="featured" label="Featured games" />
        </Section>

        {popular.length > 0 && (
          <Section id="trending" title="Popular on this device" eyebrow="Based on your local play history" viewAll="/discover?sort=popular">
            <GameGrid games={popular} variant="row" label="Popular on this device" metaFor={(g) => `${state.history[g.slug].plays} plays`} />
          </Section>
        )}

        <Section id="quick" title="Quick Play" eyebrow="Sessions under 5 minutes" viewAll="/discover?duration=quick">
          <GameGrid games={quick} variant="row" label="Quick play games" />
        </Section>

        {recommended.length > 0 && (
          <Section id="recommended" title="Recommended for you" eyebrow="Generated on this device from your activity" viewAll="/discover?playable=1">
            <GameGrid games={recommended} variant="row" label="Recommended games" />
          </Section>
        )}

        <AdSlot id="home-banner" size="leaderboard" className="ad--inline" />

        <Section id="originals" title={collections[0].title} note={collections[0].description} viewAll="/discover?playable=1">
          <GameGrid games={originals} variant="row" label="VOLTARA originals" />
        </Section>

        {HOME_CATEGORIES.map((id, i) => {
          const cat = categories.find((c) => c.id === id)!;
          const list = gamesInCategory(id).sort(byCuratedRank).slice(0, 6);
          if (!list.length) return null;
          return (
            <div key={id}>
              <Section id={`cat-${id}`} title={cat.name} eyebrow={cat.description} viewAll={`/categories/${id}`}>
                <GameGrid games={list} variant="row" label={`${cat.name} games`} />
              </Section>
              {i === 3 && <AdSlot id="home-mid" size="leaderboard" className="ad--inline" />}
            </div>
          );
        })}

        <Section id="all-categories" title="Browse Categories" viewAll="/categories">
          <div className="cat-grid">
            {categories.map((c) => {
              const list = gamesInCategory(c.id);
              return <CategoryCard key={c.id} category={c} total={list.length} live={list.filter(isPlayable).length} />;
            })}
          </div>
        </Section>
      </div>
    </>
  );
}
