import { History, Play, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GameArt } from '../components/GameArt';
import { EmptyState } from '../components/States';
import { categoryName } from '../data/categories';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useLocalState } from '../hooks/useLocalState';
import { formatPlaytime, timeAgo } from '../lib/format';
import { recentlyPlayed } from '../lib/recommend';
import { store } from '../lib/storage';

export default function RecentPage() {
  useDocumentMeta({ title: 'Recently Played — VOLTARA', description: 'Your recently played games on this device.', path: '/recent' });
  const state = useLocalState();
  const list = recentlyPlayed(state, 100);

  return (
    <div className="page">
      <header className="page__head page__head--row">
        <div>
          <p className="eyebrow">Stored in this browser</p>
          <h1 className="page__title">RECENTLY PLAYED</h1>
        </div>
        {list.length > 0 && (
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() => {
              if (window.confirm('Clear your play history on this device?')) store.clearHistory();
            }}
          >
            <Trash2 size={14} aria-hidden="true" /> Clear history
          </button>
        )}
      </header>

      {list.length ? (
        <ul className="history">
          {list.map((g) => {
            const r = state.history[g.slug];
            return (
              <li key={g.slug} className="history__row">
                <Link to={`/games/${g.slug}`} className="history__link">
                  <GameArt game={g} className="history__art" />
                  <span className="history__text">
                    <span className="history__title">{g.title}</span>
                    <span className="history__meta">
                      {categoryName(g.category)} · {timeAgo(r.last)} · {r.plays} {r.plays === 1 ? 'session' : 'sessions'} · {formatPlaytime(r.seconds)}
                    </span>
                  </span>
                  <span className="history__play">
                    <Play size={14} fill="currentColor" strokeWidth={0} aria-hidden="true" /> CONTINUE
                  </span>
                </Link>
                <button type="button" className="icon-btn" aria-label={`Remove ${g.title} from history`} onClick={() => store.removeFromHistory(g.slug)}>
                  <X size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={<History size={28} />}
          title="NOTHING PLAYED YET"
          body="Your recently played games will appear here."
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
