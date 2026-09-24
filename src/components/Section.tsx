import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  id: string;
  title: string;
  eyebrow?: string;
  note?: string;
  viewAll?: string;
  children: ReactNode;
}

export function Section({ id, title, eyebrow, note, viewAll, children }: Props) {
  return (
    <section className="section" aria-labelledby={`${id}-title`}>
      <header className="section__head">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 id={`${id}-title`} className="section__title">
            {title}
          </h2>
          {note && <p className="section__note">{note}</p>}
        </div>
        {viewAll && (
          <Link to={viewAll} className="section__all">
            VIEW ALL <ArrowRight size={14} aria-hidden="true" />
            <span className="visually-hidden"> {title}</span>
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}
