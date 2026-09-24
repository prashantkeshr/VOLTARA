import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';
import { categories } from '../src/data/categories';
import { games } from '../src/data/games';
import { SITE_DESCRIPTION, SITE_TITLE, gameJsonLd, gameMeta, type PageMeta } from '../src/lib/seo';

/**
 * Post-build static generation:
 *  - one index.html per known route with unique <title>, description,
 *    Open Graph, canonical and JSON-LD (no JS needed for essential metadata)
 *  - 404.html SPA fallback for GitHub Pages
 *  - sitemap.xml / robots.txt when VITE_SITE_URL is set
 *  - injects the precache manifest into the service worker
 */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

interface Page extends PageMeta {
  body: string;
  jsonLd?: Record<string, unknown>;
}

function pages(): Page[] {
  const list: Page[] = [
    { title: SITE_TITLE, description: SITE_DESCRIPTION, path: '/', body: `<h1>VOLTARA</h1><p>${esc(SITE_DESCRIPTION)}</p>` },
    { title: 'Discover Games — VOLTARA', description: 'Search and filter every VOLTARA game by genre, controls, difficulty and session length.', path: '/discover', body: '<h1>Discover games</h1>' },
    { title: 'Game Categories — VOLTARA', description: 'Action, arcade, puzzle, racing, strategy, sports, casual, board and educational browser games.', path: '/categories', body: '<h1>Categories</h1>' },
    { title: 'Favorites — VOLTARA', description: 'Games you saved on this device.', path: '/favorites', body: '<h1>Favorites</h1>' },
    { title: 'Recently Played — VOLTARA', description: 'Your recently played games on this device.', path: '/recent', body: '<h1>Recently played</h1>' },
    { title: 'Settings — VOLTARA', description: 'Appearance, motion, gameplay and privacy settings.', path: '/settings', body: '<h1>Settings</h1>' },
    { title: 'About — VOLTARA', description: 'VOLTARA is a static, instant-play browser gaming platform.', path: '/about', body: '<h1>About</h1>' },
    { title: 'Privacy — VOLTARA', description: 'How VOLTARA handles your data: locally, in your browser.', path: '/privacy', body: '<h1>Privacy</h1>' },
    { title: 'Terms — VOLTARA', description: 'Terms of use for VOLTARA.', path: '/terms', body: '<h1>Terms</h1>' },
    { title: 'Contact — VOLTARA', description: 'Get in touch with the VOLTARA team.', path: '/contact', body: '<h1>Contact</h1>' },
  ];
  for (const c of categories) {
    const inCat = games.filter((g) => g.category === c.id);
    list.push({
      title: `${c.name} Games — Play free in your browser | VOLTARA`,
      description: `${c.description} Instant-play ${c.name.toLowerCase()} games on VOLTARA.`,
      path: `/categories/${c.id}`,
      body: `<h1>${esc(c.name)} games</h1><ul>${inCat.map((g) => `<li><a href="/games/${g.slug}">${esc(g.title)}</a></li>`).join('')}</ul>`,
    });
  }
  return list;
}

export function staticPages(siteUrl: string): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'voltara-static-pages',
    apply: 'build',
    configResolved(c) {
      config = c;
    },
    closeBundle() {
      const out = config.build.outDir;
      const base = config.base;
      const origin = siteUrl.replace(/\/$/, '');
      const template = readFileSync(join(out, 'index.html'), 'utf8');
      const link = (p: string) => base.replace(/\/$/, '') + p;

      const render = (p: Page) => {
        const url = origin ? origin + link(p.path) : '';
        const head = [
          url ? `<link rel="canonical" href="${url}" />` : '',
          url ? `<meta property="og:url" content="${url}" />` : '',
          p.jsonLd ? `<script type="application/ld+json" data-voltara="game">${JSON.stringify(p.jsonLd).replace(/</g, '\\u003c')}</script>` : '',
        ].join('\n    ');
        return template
          .replace(/<title>.*?<\/title>/, `<title>${esc(p.title)}</title>`)
          .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(p.description)}`)
          .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(p.title)}`)
          .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(p.description)}`)
          .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${esc(p.title)}`)
          .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${esc(p.description)}`)
          .replace(/(<meta property="og:type" content=")[^"]*/, `$1website`)
          .replace('<!--voltara:head-->', head)
          .replace('<div id="root"></div>', `<div id="root"><div class="prerender">${p.body.replace(/href="\//g, `href="${link('/')}`)}</div></div>`);
      };

      const all: Page[] = [
        ...pages(),
        ...games.map((g) => ({
          ...gameMeta(g),
          jsonLd: gameJsonLd(g, origin ? origin + base.replace(/\/$/, '') : ''),
          body: `<h1>${esc(g.title)}</h1><p>${esc(g.tagline)}</p><p>${esc(g.description)}</p>`,
        })),
      ];

      for (const p of all) {
        const dir = p.path === '/' ? out : join(out, ...p.path.split('/').filter(Boolean));
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, 'index.html'), render(p));
      }
      writeFileSync(join(out, '404.html'), template);

      if (origin) {
        const urls = all.filter((p) => !['/favorites', '/recent', '/settings'].includes(p.path)).map((p) => `  <url><loc>${origin}${link(p.path)}</loc></url>`);
        writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
        writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}${link('/sitemap.xml')}\n`);
      } else {
        writeFileSync(join(out, 'robots.txt'), 'User-agent: *\nAllow: /\n');
      }

      // Service worker precache: app shell, hashed assets, and every local game.
      const swPath = join(out, 'sw.js');
      // Route HTML stays out (the SPA shell serves every route offline); game HTML goes in.
      const precache = walk(out)
        .map((f) => relative(out, f).split(sep).join('/'))
        .filter((f) => !['sw.js', '404.html', 'CNAME', '.nojekyll'].includes(f) && !f.endsWith('.map'))
        .filter((f) => !f.endsWith('.html') || f === 'index.html' || /^games\/[^/]+\/game\.html$/.test(f));
      const swSource = readFileSync(swPath, 'utf8');
      const version = createHash('sha1').update(precache.join('|') + template + swSource).digest('hex').slice(0, 10);
      const sw = swSource
        .replace('self.__VOLTARA_PRECACHE__ = [];', `self.__VOLTARA_PRECACHE__ = ${JSON.stringify(precache)};`)
        .replace("'voltara-dev'", `'voltara-${version}'`);
      writeFileSync(swPath, sw);
    },
  };
}
