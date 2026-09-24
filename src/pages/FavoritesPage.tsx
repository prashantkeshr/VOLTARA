import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GameGrid } from '../components/GameGrid';
import { EmptyState } from '../components/States';
import { getGame } from '../data/games';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useLocalState } from '../hooks/useLocalState';
import type { Game } from '../types/game';

export default function FavoritesPage() {
  useDocumentMeta({ title: 'Favorites — VOLTARA', description: 'Games you saved on this device.', path: '/favorites' });
  const { favorites } = useLocalState();
  const list = favorites.map(getGame).filter((g): g is Game => Boolean(g));

  return (
    <div className="page">
      <header className="page__head">
        <p className="eyebrow">Stored in this browser</p>
        <h1 className="page__title">FAVORITES</h1>
      </header>
      {list.length ? (
        <GameGrid games={list} label="Favorite games" />
      ) : (
        <EmptyState
          icon={<Heart size={28} />}
          title="NO FAVORITES YET"
          body="Save games you want to play again."
          action={
            <Link to="/discover" className="btn btn--primary">
              DISCOVER GAMES
            </Link>
          }
        />
      )}
    </div>
  );
}
