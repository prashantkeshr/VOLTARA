import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { playableGames } from '../data/games';
import type { Game } from '../types/game';
import { GameArt } from './GameArt';

export function Hero({ spotlight }: { spotlight: Game }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__grid" />
        <svg className="hero__geo" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="currentColor">
            <circle cx="420" cy="260" r="220" opacity="0.08" />
            <circle cx="420" cy="260" r="160" opacity="0.12" strokeDasharray="2 10" />
            <circle cx="420" cy="260" r="96" opacity="0.18" />
            <path d="M180 520 L420 40 L600 400" opacity="0.1" />
            <rect x="380" y="220" width="80" height="80" opacity="0.35" className="hero__spin" />
          </g>
          <circle cx="420" cy="260" r="5" fill="var(--accent)" className="hero__pulse" />
        </svg>
      </div>

      <div className="hero__inner">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow">
            <span className="hero__dot" aria-hidden="true" /> {playableGames.length} games ready to play
          </p>
          <h1 id="hero-title" className="hero__title">
            ENTER THE
            <br />
            <span>VOLTARA.</span>
          </h1>
          <p className="hero__lead">
            Instant-play browser games.
            <br />
            No account. No waiting. Just play.
          </p>
          <div className="hero__actions">
            <Link to="/discover" className="btn btn--primary btn--xl">
              EXPLORE GAMES <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to={`/games/${spotlight.slug}`} className="btn btn--xl btn--ghost">
              <Play size={16} fill="currentColor" strokeWidth={0} aria-hidden="true" /> Play {spotlight.title}
            </Link>
          </div>
        </div>

        <Link to={`/games/${spotlight.slug}`} className="hero__spot" aria-label={`Play ${spotlight.title}`}>
          <GameArt game={spotlight} className="hero__spot-art" />
          <span className="hero__spot-meta">
            <span className="eyebrow">Spotlight · VOLTARA Original</span>
            <span className="hero__spot-title">{spotlight.title}</span>
            <span className="hero__spot-tag">{spotlight.tagline}</span>
          </span>
          <span className="hero__spot-play" aria-hidden="true">
            <Play size={18} fill="currentColor" strokeWidth={0} />
          </span>
        </Link>
      </div>
    </section>
  );
}
