import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Category } from '../types/game';

export function CategoryCard({ category, total, live }: { category: Category; total: number; live: number }) {
  return (
    <Link to={`/categories/${category.id}`} className="cat-card" style={{ ['--cat-hue' as string]: category.hue }}>
      <span className="cat-card__geo" aria-hidden="true" />
      <span className="cat-card__top">
        <span className="eyebrow">{live > 0 ? `${live} playable` : 'In development'}</span>
        <ArrowUpRight size={18} aria-hidden="true" />
      </span>
      <span className="cat-card__name">{category.name}</span>
      <span className="cat-card__desc">{category.description}</span>
      <span className="cat-card__count mono">{String(total).padStart(2, '0')} TITLES</span>
    </Link>
  );
}
