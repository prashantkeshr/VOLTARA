import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/States';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function NotFoundPage() {
  useDocumentMeta({ title: 'Not found — VOLTARA', description: 'This page does not exist.' });
  return (
    <div className="page">
      <EmptyState
        icon={<Compass size={28} />}
        title="404 — SIGNAL LOST"
        body="That page doesn't exist, or the game has moved."
        action={
          <>
            <Link to="/" className="btn btn--primary">
              Go home
            </Link>
            <Link to="/discover" className="btn">
              Discover games
            </Link>
          </>
        }
      />
    </div>
  );
}
