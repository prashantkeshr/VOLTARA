# VOLTARA

**ENTER THE GAME.** A premium, instant-play browser gaming platform that runs entirely client-side and deploys as a static site.

- React 18 + TypeScript + Vite, React Router, Lucide icons, plain CSS design tokens
- No backend, no database, no accounts. Favorites, history, preferences and reports live in `localStorage` / IndexedDB
- 17 playable **VOLTARA Originals** (vanilla HTML5, zero dependencies), plus a scalable catalog of upcoming titles
- Universal game player with Focus Mode, Fullscreen API, reload, external fallback, failure detection and problem reports
- PWA: installable, offline app shell, Originals cached for offline play
- Static SEO: every route and every game gets its own pre-generated `index.html` with unique title, description, Open Graph and JSON-LD

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ locally (service worker active)
```

## Deploy

`dist/` is a plain static site. Every known route has a real `index.html`, so deep links work without rewrite rules; `404.html` is an SPA fallback.

| Host | Notes |
| --- | --- |
| **Cloudflare Pages / Netlify / Vercel** | Build command `npm run build`, output `dist` |
| **GitHub Pages (project site)** | Build with `VITE_BASE=/<repo>/ npm run build` and publish `dist/` |
| **Any static host** | Upload `dist/` |

### Build-time configuration (all optional)

| Variable | Purpose |
| --- | --- |
| `VITE_SITE_URL` | Absolute origin (e.g. `https://voltara.gg`). Enables canonical URLs, `og:url`, `sitemap.xml` |
| `VITE_BASE` | Base path for sub-directory hosting |
| `VITE_ADS_MODE` | `placeholder` (default), `off`, or `provider` |
| `VITE_REPORT_ENDPOINT` | If set, problem reports are also POSTed here as JSON |
| `VITE_CONTACT_EMAIL` | Shown on the Contact page |

## Architecture

```
src/
  types/game.ts          Game / Category / Collection model
  data/
    categories.ts        10 categories with subcategories
    collections.ts       Editorial collections
    games/               Modular catalog, one file per category group
      define.ts          original() / upcoming() entry helpers with defaults
      index.ts           Aggregated catalog + lookups
  components/
    GamePlayer.tsx       Universal player: LOCAL / IFRAME / EXTERNAL / COMING_SOON
    GameControls.tsx     Focus · Fullscreen · Reload · Open · Sound · Favorite · Report
    AdSlot.tsx           Network-agnostic, reserved-size ad slots
    …                    Header, SearchBar, GameCard, FilterBar, Hero, States, …
  hooks/
    usePlayerSize.ts     Viewport-fitting frame sizing + rail decision
    useFullscreen.ts     Fullscreen API wrapper that reports real success
    useLocalState.ts     Subscribes to the local store
  lib/
    storage.ts           Namespaced localStorage store (favorites, history, prefs)
    idb.ts               IndexedDB wrapper (problem reports)
    search.ts            Weighted instant search
    filters.ts           URL-synced filter + sort model
    recommend.ts         On-device recommendations, related games
    seo.ts               Shared metadata builders (runtime + static generation)
  pages/                 Route-level, lazily loaded
build/static-pages.ts    Post-build page generation, sitemap, SW precache manifest
public/
  games/_shared/         vt.js + vt.css: tiny runtime shared by all Originals
  games/<slug>/game.html One self-contained game per folder
  sw.js                  Service worker (precache list injected at build)
```

### Adding a game

1. **VOLTARA Original**: create `public/games/<slug>/game.html` (include `data-voltara-game` on `<html>`, load `../_shared/vt.js`, call `VT.ready()` once initialised), then add an `original({...})` entry to the relevant file in `src/data/games/`.
2. **Permitted embed**: add an entry with `type: 'IFRAME'`, `source: 'embed'`, `url: 'https://…'`, `embedAllowed: true` and a `credit`. Only do this when the provider explicitly permits embedding.
3. **External only**: `type: 'EXTERNAL'`, `embedAllowed: false`. The player shows *EMBEDDING IS NOT AVAILABLE* with an **OPEN GAME** button.

No page or component changes are needed. VOLTARA never tries to bypass `X-Frame-Options`, CSP or `frame-ancestors`.

### Game player

- The frame is sized from the real viewport: it fits the game's intended aspect ratio into the available width × (viewport height − chrome). On phones it fills the screen unless the game is landscape-only.
- Ad rails are shown **only** when the fitted game leaves at least 2 × 180px of spare width, so rails never shrink the game.
- A local game must answer the host with `voltara:ready` within 12 s, otherwise the player shows *THIS GAME IS CURRENTLY UNAVAILABLE* with Retry / Open externally / Report problem / Return to library. The game file is verified before the iframe is created, so a missing build never produces a blank frame.
- Frames are sandboxed (`allow-scripts allow-same-origin allow-pointer-lock allow-orientation-lock`) with `allow="fullscreen; gamepad; autoplay"`: no popups, no top navigation.
- Focus Mode hides all site chrome. Fullscreen falls back to Focus Mode with a clear message when the browser doesn't support it.

### Honest data

With no server there are no global statistics, so none are claimed. Labels read *Featured*, *Curated*, *Popular on this device*, *Recommended for you (generated on this device)*. Upcoming titles are clearly marked **COMING SOON**. Multiplayer is marked as needing infrastructure that a static platform doesn't have yet.

### Ads

`<AdSlot />` reserves its dimensions (no layout shift), is labelled *Advertisement*, never overlaps the game or controls, and doesn't imitate VOLTARA UI. To connect a provider, set `VITE_ADS_MODE=provider` and implement `renderProvider()` in `src/config/ads.ts`.
