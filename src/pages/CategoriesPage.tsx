import { CategoryCard } from '../components/CategoryCard';
import { categories } from '../data/categories';
import { gamesInCategory, isPlayable } from '../data/games';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function CategoriesPage() {
  useDocumentMeta({
    title: 'Game Categories — VOLTARA',
    description: 'Action, arcade, puzzle, racing, strategy, sports, casual, board and educational browser games.',
    path: '/categories',
  });
  return (
    <div className="page">
      <header className="page__head">
        <p className="eyebrow">Browse</p>
        <h1 className="page__title">CATEGORIES</h1>
      </header>
      <div className="cat-grid">
        {categories.map((c) => {
          const list = gamesInCategory(c.id);
          return <CategoryCard key={c.id} category={c} total={list.length} live={list.filter(isPlayable).length} />;
        })}
      </div>
    </div>
  );
}
