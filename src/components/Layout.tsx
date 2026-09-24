import { WifiOff } from 'lucide-react';
import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useOnline } from '../hooks/useOnline';
import { usePrefsEffects } from '../hooks/usePrefsEffects';
import { Footer } from './Footer';
import { Header } from './Header';
import { LoadingState } from './States';

export function Layout() {
  usePrefsEffects();
  const online = useOnline();
  const { pathname } = useLocation();

  // Route changes start at the top and move focus to main for screen readers.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="app">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      {!online && (
        <div className="offline-banner" role="status">
          <WifiOff size={14} aria-hidden="true" />
          <span>
            <strong>YOU'RE OFFLINE.</strong> VOLTARA Originals you've opened before still work. Some games require an internet connection.
          </span>
        </div>
      )}
      <main id="main" tabIndex={-1} className="main">
        <Suspense fallback={<div className="page-loader"><LoadingState /></div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
