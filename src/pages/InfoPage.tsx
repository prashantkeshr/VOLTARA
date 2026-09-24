import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { site } from '../config/site';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import NotFoundPage from './NotFoundPage';

const PAGES: Record<string, { title: string; description: string; body: ReactNode }> = {
  about: {
    title: 'About',
    description: 'VOLTARA is a static, instant-play browser gaming platform.',
    body: (
      <>
        <p>VOLTARA is a browser gaming platform built for instant play: no account, no install, no waiting. The entire platform is static — there is no application server and no database.</p>
        <h2>What's in the catalog</h2>
        <p>
          <strong>VOLTARA Originals</strong> are built by the project and run entirely in your browser. Once opened, they keep working offline. The catalog architecture also supports <strong>licensed games</strong> and <strong>permitted embeds</strong> from providers that explicitly allow embedding; VOLTARA never bypasses a site's framing restrictions.
        </p>
        <h2>Honest labels</h2>
        <p>Without a server there are no global statistics, so VOLTARA never claims them. "Popular on this device" and "Recommended for you" are computed locally from your own activity.</p>
      </>
    ),
  },
  privacy: {
    title: 'Privacy',
    description: 'How VOLTARA handles your data: locally, in your browser.',
    body: (
      <>
        <p>VOLTARA does not require an account. Favorites, play history, search history, preferences and problem reports are stored locally in this browser using localStorage and IndexedDB.</p>
        <h2>What leaves your device</h2>
        <p>Nothing is sent to a VOLTARA server — there isn't one. If the operator configures a report endpoint, problem reports you choose to submit are sent there. Third-party games and advertising providers, where present, are governed by their own policies.</p>
        <h2>Your controls</h2>
        <p>
          You can clear favorites, history or all local data at any time from <Link to="/settings">Settings</Link>.
        </p>
      </>
    ),
  },
  terms: {
    title: 'Terms',
    description: 'Terms of use for VOLTARA.',
    body: (
      <>
        <p>VOLTARA is provided as-is, free of charge, for personal entertainment. Games are provided by VOLTARA or by third parties who permit their distribution or embedding.</p>
        <h2>Third-party content</h2>
        <p>Third-party games remain the property of their owners and are subject to their terms. If you believe content on VOLTARA infringes your rights, use the contact page and it will be reviewed promptly.</p>
        <h2>Acceptable use</h2>
        <p>Don't attempt to disrupt the service or use it to distribute malicious content.</p>
      </>
    ),
  },
  contact: {
    title: 'Contact',
    description: 'Get in touch with the VOLTARA team.',
    body: (
      <>
        {site.contactEmail ? (
          <p>
            Email: <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
          </p>
        ) : (
          <p>A public contact address hasn't been configured for this deployment yet (set VITE_CONTACT_EMAIL at build time).</p>
        )}
        <p>
          To report a problem with a specific game, use the <strong>Report problem</strong> button under the game player.
        </p>
      </>
    ),
  },
};

export default function InfoPage() {
  const key = useLocation().pathname.replace(/^\/+|\/+$/g, '');
  const page = PAGES[key];
  useDocumentMeta(page ? { title: `${page.title} — VOLTARA`, description: page.description, path: `/${key}` } : null);
  if (!page) return <NotFoundPage />;
  return (
    <div className="page page--narrow">
      <header className="page__head">
        <p className="eyebrow">VOLTARA</p>
        <h1 className="page__title">{page.title.toUpperCase()}</h1>
      </header>
      <div className="prose">{page.body}</div>
    </div>
  );
}
