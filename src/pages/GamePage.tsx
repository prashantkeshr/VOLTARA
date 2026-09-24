import { ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AdSlot } from '../components/AdSlot';
import { FavoriteButton } from '../components/FavoriteButton';
import { GameGrid } from '../components/GameGrid';
import { GameMetadata } from '../components/GameMetadata';
import { GamePlayer } from '../components/GamePlayer';
import { ReportDialog } from '../components/ReportDialog';
import { Section } from '../components/Section';
import { categoryName } from '../data/categories';
import { getGame } from '../data/games';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { relatedGames } from '../lib/recommend';
import { gameJsonLd, gameMeta } from '../lib/seo';
import { store } from '../lib/storage';
import { site } from '../config/site';
import NotFoundPage from './NotFoundPage';

export default function GamePage() {
  const { slug } = useParams();
  const game = getGame(slug);
  useDocumentMeta(game ? gameMeta(game) : null);

  const [focus, setFocus] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const started = useRef(false);

  // The game gets the vertical space the mobile bottom nav would take.
  useEffect(() => {
    document.documentElement.dataset.page = 'game';
    return () => {
      delete document.documentElement.dataset.page;
    };
  }, []);

  // Focus mode hides all site chrome and locks page scroll.
  useEffect(() => {
    const root = document.documentElement;
    if (focus) root.dataset.focus = 'true';
    else delete root.dataset.focus;
    return () => {
      delete root.dataset.focus;
    };
  }, [focus]);

  useEffect(() => {
    setFocus(false);
    started.current = false;
  }, [slug]);

  // Structured data for this game.
  useEffect(() => {
    if (!game) return;
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.dataset.voltara = 'game';
    el.textContent = JSON.stringify(gameJsonLd(game, site.url));
    document.querySelectorAll('script[data-voltara="game"]').forEach((s) => s.remove());
    document.head.appendChild(el);
    return () => el.remove();
  }, [game]);

  // Count visible time on the page once the game has started.
  useEffect(() => {
    if (!game) return;
    let acc = 0;
    let lastTick = Date.now();
    const tick = () => {
      const now = Date.now();
      if (started.current && document.visibilityState === 'visible') acc += (now - lastTick) / 1000;
      lastTick = now;
    };
    const flush = () => {
      tick();
      if (acc >= 1) store.addPlayTime(game.slug, acc);
      acc = 0;
    };
    const iv = window.setInterval(() => (tick(), acc >= 30 && flush()), 5000);
    const onVis = () => (document.visibilityState === 'hidden' ? flush() : (lastTick = Date.now()));
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', flush);
    return () => {
      window.clearInterval(iv);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [game]);

  const onStarted = useCallback(() => {
    if (!game || started.current) return;
    started.current = true;
    store.recordPlay(game.slug);
  }, [game]);

  if (!game) return <NotFoundPage />;
  const related = relatedGames(game, 6);

  return (
    <div className="game-page">
      <nav className="game-bar" aria-label="Breadcrumb">
        <ol className="crumbs">
          <li>
            <Link to="/">VOLTARA</Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li>
            <Link to={`/categories/${game.category}`}>{categoryName(game.category)}</Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li aria-current="page" className="crumbs__current">
            {game.title}
          </li>
        </ol>
        <FavoriteButton slug={game.slug} title={game.title} />
      </nav>

      <GamePlayer key={game.slug} game={game} focus={focus} onFocusChange={setFocus} onStarted={onStarted} onReport={() => setReportOpen(true)} />

      <div className="game-page__below">
        <AdSlot id="game-below" size="leaderboard" className="ad--inline ad--below-player" />
        <AdSlot id="game-mobile" size="mobile" className="ad--inline ad--mobile-only" />
        <GameMetadata game={game} />
        {related.length > 0 && (
          <Section id="related" title="Related Games" viewAll={`/categories/${game.category}`}>
            <GameGrid games={related} variant="row" label="Related games" />
          </Section>
        )}
      </div>

      <ReportDialog game={game} open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
