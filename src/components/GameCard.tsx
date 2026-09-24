import { Clock, Play } from 'lucide-react';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { categoryName } from '../data/categories';
import { isPlayable } from '../data/games';
import { DURATION_LABEL } from '../lib/format';
import type { Game } from '../types/game';
import { DifficultyMeter } from './DifficultyMeter';
import { FavoriteButton } from './FavoriteButton';
import { GameArt } from './GameArt';

interface Props {
  game: Game;
  size?: 'default' | 'large';
  meta?: string;
}

export const GameCard = memo(function GameCard({ game, size = 'default', meta }: Props) {
  const playable = isPlayable(game);
  return (
    <article className={`card card--${size}${playable ? '' : ' card--soon'}`}>
      <Link to={`/games/${game.slug}`} className="card__link" aria-label={`${playable ? 'Play' : 'View'} ${game.title}`}>
        <div className="card__media">
          <GameArt game={game} className="card__art" />
          <div className="card__overlay" aria-hidden="true">
            {playable ? (
              <span className="card__play">
                <Play size={16} fill="currentColor" strokeWidth={0} /> PLAY
              </span>
            ) : (
              <span className="card__soon-label">IN DEVELOPMENT</span>
            )}
            <span className="card__reveal">{game.tagline}</span>
          </div>
          {!playable && <span className="chip chip--soon card__badge">COMING SOON</span>}
          {playable && game.source === 'original' && size === 'large' && <span className="chip card__badge">VOLTARA ORIGINAL</span>}
        </div>
        <div className="card__body">
          <h3 className="card__title">{game.title}</h3>
          <div className="card__meta">
            <span>{meta ?? categoryName(game.category)}</span>
            <span className="card__sep" aria-hidden="true" />
            <span className="card__dur">
              <Clock size={12} aria-hidden="true" />
              {DURATION_LABEL[game.duration]}
            </span>
            <DifficultyMeter value={game.difficulty} />
          </div>
          {size === 'large' && <p className="card__tagline">{game.tagline}</p>}
        </div>
      </Link>
      <div className="card__fav">
        <FavoriteButton slug={game.slug} title={game.title} variant="overlay" />
      </div>
    </article>
  );
});
