import { Heart } from 'lucide-react';
import { useIsFavorite } from '../hooks/useLocalState';
import { store } from '../lib/storage';
import { useToast } from './Toast';

interface Props {
  slug: string;
  title: string;
  variant?: 'icon' | 'overlay' | 'full';
}

export function FavoriteButton({ slug, title, variant = 'icon' }: Props) {
  const fav = useIsFavorite(slug);
  const toast = useToast();
  const label = fav ? `Remove ${title} from favorites` : `Add ${title} to favorites`;
  return (
    <button
      type="button"
      className={`fav fav--${variant}${fav ? ' is-active' : ''}`}
      aria-pressed={fav}
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = store.toggleFavorite(slug);
        toast(added ? `${title} saved to favorites` : `${title} removed from favorites`);
      }}
    >
      <Heart size={variant === 'full' ? 18 : 16} strokeWidth={2} fill={fav ? 'currentColor' : 'none'} aria-hidden="true" />
      {variant === 'full' && <span>{fav ? 'Saved' : 'Favorite'}</span>}
    </button>
  );
}
