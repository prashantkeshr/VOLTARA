import { GameBrowser } from '../components/GameBrowser';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function DiscoverPage() {
  useDocumentMeta({
    title: 'Discover Games — VOLTARA',
    description: 'Search and filter every VOLTARA game by genre, controls, difficulty and session length.',
    path: '/discover',
  });
  return (
    <div className="page">
      <header className="page__head">
        <p className="eyebrow">Library</p>
        <h1 className="page__title">DISCOVER GAMES</h1>
      </header>
      <GameBrowser />
    </div>
  );
}
