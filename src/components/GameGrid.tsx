import type { Game } from '../types/game';
import { GameCard } from './GameCard';

interface Props {
  games: Game[];
  label?: string;
  metaFor?: (g: Game) => string | undefined;
  variant?: 'grid' | 'row' | 'featured';
}

export function GameGrid({ games, label, metaFor, variant = 'grid' }: Props) {
  return (
    <ul className={`game-grid game-grid--${variant}`} aria-label={label}>
      {games.map((g, i) => (
        <li key={g.slug}>
          <GameCard game={g} meta={metaFor?.(g)} size={variant === 'featured' && i < 2 ? 'large' : 'default'} />
        </li>
      ))}
    </ul>
  );
}
