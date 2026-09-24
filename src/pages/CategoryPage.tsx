import { ArrowLeft, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { GameBrowser } from '../components/GameBrowser';
import { EmptyState } from '../components/States';
import { getCategory } from '../data/categories';
import { gamesInCategory } from '../data/games';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import NotFoundPage from './NotFoundPage';

export default function CategoryPage() {
  const { id } = useParams();
  const cat = getCategory(id ?? '');
  useDocumentMeta(
    cat
      ? { title: `${cat.name} Games — Play free in your browser | VOLTARA`, description: `${cat.description} Instant-play ${cat.name.toLowerCase()} games on VOLTARA.`, path: `/categories/${cat.id}` }
      : null,
  );
  if (!cat) return <NotFoundPage />;
  const count = gamesInCategory(cat.id).length;

  return (
    <div className="page">
      <header className="page__head page__head--cat" style={{ ['--cat-hue' as string]: cat.hue }}>
        <Link to="/categories" className="back-link">
          <ArrowLeft size={14} aria-hidden="true" /> All categories
        </Link>
        <h1 className="page__title">{cat.name.toUpperCase()}</h1>
        <p className="page__lead">{cat.description}</p>
        <ul className="subcats" aria-label="Subcategories">
          {cat.subcategories.map((s) => (
            <li key={s}>
              <Link to={`/discover?q=${encodeURIComponent(s.toLowerCase())}`} className="chip chip--button">
                {s}
              </Link>
            </li>
          ))}
        </ul>
      </header>
      {count === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title={cat.id === 'multiplayer' ? 'MULTIPLAYER — COMING SOON' : 'NOTHING HERE YET'}
          body={
            cat.id === 'multiplayer'
              ? 'Real-time multiplayer needs matchmaking infrastructure that a static, server-free platform does not have yet. The catalog already supports multiplayer titles — they will appear here as soon as properly licensed games are added.'
              : 'Games for this category are in development.'
          }
          action={
            <Link to="/discover?playable=1" className="btn btn--primary">
              DISCOVER GAMES
            </Link>
          }
        />
      ) : (
        <GameBrowser fixedCategory={cat.id} showSearch={false} />
      )}
    </div>
  );
}
