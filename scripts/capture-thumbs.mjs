// Captures a real gameplay screenshot of every VOLTARA Original for catalog
// artwork: public/images/games/<slug>.jpg. Games run in ?preview=1 mode
// (intro skipped, staged state, silent). Cards fall back to procedural SVG
// art whenever an image is missing.
//
// Usage: npm run thumbs   (Windows: uses Chrome/Edge headless + System.Drawing)
import { spawn, spawnSync } from 'node:child_process';
import { createReadStream, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';

const ROOT = resolve('public');
const OUT = join(ROOT, 'images', 'games');
const TMP = join(tmpdir(), 'voltara-thumbs');
const PORT = 5197;
const W = 1280, H = 800;           // capture viewport
const OW = 800, OH = 500;          // output size (16:10, matches cards)
const only = process.argv.slice(2);

const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];
const browser = BROWSERS.find(existsSync);
if (!browser) throw new Error('No Edge/Chrome found for headless capture');

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = createServer((req, res) => {
  const path = join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!path.startsWith(ROOT) || !existsSync(path) || statSync(path).isDirectory()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(path)] ?? 'application/octet-stream' });
  createReadStream(path).pipe(res);
});
await new Promise((r) => server.listen(PORT, r));

mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });
const slugs = readdirSync(join(ROOT, 'games')).filter((d) => d !== '_shared' && existsSync(join(ROOT, 'games', d, 'game.html')) && (!only.length || only.includes(d)));

for (const slug of slugs) {
  const png = join(TMP, `${slug}.png`);
  rmSync(png, { force: true });
  // Async spawn: the static server above runs on this same event loop.
  await new Promise((done) => {
    const child = spawn(browser, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio', '--no-first-run',
    `--user-data-dir=${join(TMP, 'profile')}`,
    `--window-size=${W},${H}`, '--virtual-time-budget=3500',
    `--screenshot=${png}`,
    `http://localhost:${PORT}/games/${slug}/game.html?preview=1`,
  ], { stdio: 'ignore' });
    const kill = setTimeout(() => child.kill(), 60_000);
    child.on('exit', () => { clearTimeout(kill); done(); });
  });
  if (!existsSync(png)) {
    console.log(`✗ ${slug}: capture failed (SVG fallback will be used)`);
    continue;
  }
  const jpg = join(OUT, `${slug}.jpg`);
  const ps = `
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile('${png}')
$dst = New-Object System.Drawing.Bitmap ${OW}, ${OH}
$g = [System.Drawing.Graphics]::FromImage($dst)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($src, 0, 0, ${OW}, ${OH})
$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$p = New-Object System.Drawing.Imaging.EncoderParameters 1
$p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 84L
$dst.Save('${jpg}', $enc, $p)
$g.Dispose(); $dst.Dispose(); $src.Dispose()`;
  const r = spawnSync('powershell', ['-NoProfile', '-Command', ps], { encoding: 'utf8' });
  if (r.status !== 0) console.log(`✗ ${slug}: convert failed ${r.stderr}`);
  else console.log(`✓ ${slug} → images/games/${slug}.jpg (${Math.round(statSync(jpg).size / 1024)} KB)`);
}

server.close();
