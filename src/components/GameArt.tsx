import { memo, type ReactNode } from 'react';
import type { Game } from '../types/game';
import { asset } from '../lib/format';

/**
 * Procedural artwork: every game gets deterministic abstract geometry drawn
 * as inline SVG. Zero network requests, crisp at any size, consistent style.
 * If a game declares a raster `thumbnail`, that is used instead.
 */

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const W = 320;
const H = 200;

function pattern(g: Game, a: string, a2: string, dim: string): ReactNode {
  const r = rng(g.slug);
  const p = g.art.pattern;
  switch (p) {
    case 'grid': {
      const n = 6;
      const s = 22;
      const ox = W / 2 - (n * s) / 2;
      const oy = H / 2 - (n * s) / 2;
      const hot = Math.floor(r() * n * n);
      return Array.from({ length: n * n }, (_, i) => {
        const x = ox + (i % n) * s;
        const y = oy + Math.floor(i / n) * s;
        const on = i === hot;
        const decoy = !on && r() < 0.08;
        return <rect key={i} x={x + 2} y={y + 2} width={s - 4} height={s - 4} rx={2} fill={on ? a : decoy ? a2 : 'none'} stroke={on ? a : dim} strokeWidth={1} opacity={on ? 1 : decoy ? 0.7 : 0.8} />;
      });
    }
    case 'orbit':
      return (
        <>
          {[40, 70, 100].map((rad, i) => (
            <ellipse key={i} cx={W / 2} cy={H + 30} rx={rad * 2.2} ry={rad * 1.3} fill="none" stroke={dim} strokeWidth={1} />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={20 + r() * (W - 40)} y={10 + r() * 110} width={6 + r() * 14} height={6 + r() * 14} fill="none" stroke={i % 3 ? dim : a2} transform={`rotate(${r() * 90})`} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
          ))}
          <polygon points={`${W / 2},${H - 58} ${W / 2 - 12},${H - 36} ${W / 2 + 12},${H - 36}`} fill={a} />
          <circle cx={W / 2 + 60} cy={70} r={5} fill={a} />
        </>
      );
    case 'lanes':
      return (
        <>
          <polygon points={`${W / 2 - 30},0 ${W / 2 + 30},0 ${W / 2 + 130},${H} ${W / 2 - 130},${H}`} fill={dim} opacity={0.25} />
          {[-1, 1].map((d) => (
            <line key={d} x1={W / 2 + d * 10} y1={0} x2={W / 2 + d * 43} y2={H} stroke={dim} strokeDasharray="10 12" />
          ))}
          <line x1={W / 2 - 30} y1={0} x2={W / 2 - 130} y2={H} stroke={a} strokeWidth={1.5} />
          <line x1={W / 2 + 30} y1={0} x2={W / 2 + 130} y2={H} stroke={a} strokeWidth={1.5} />
          <rect x={W / 2 - 14} y={H - 52} width={28} height={40} rx={4} fill={a} />
          <rect x={W / 2 + 26} y={70} width={18} height={26} rx={3} fill="none" stroke={a2} />
          <rect x={W / 2 - 50} y={30} width={14} height={20} rx={2} fill="none" stroke={dim} />
        </>
      );
    case 'stack': {
      let w = 150;
      let x = W / 2 - w / 2;
      return Array.from({ length: 8 }, (_, i) => {
        const y = H - 22 - i * 18;
        const shift = (r() - 0.5) * 18;
        w -= r() * 12;
        x += shift / 3;
        return <rect key={i} x={x} y={y} width={w} height={14} fill={i === 7 ? a : 'none'} stroke={i === 7 ? a : i > 4 ? a2 : dim} />;
      });
    }
    case 'nodes': {
      const pts = Array.from({ length: 10 }, () => [30 + r() * (W - 60), 25 + r() * (H - 50)] as const);
      return (
        <>
          {pts.slice(1).map((pt, i) => {
            const q = pts[Math.floor(r() * (i + 1))];
            return <path key={i} d={`M${q[0]},${q[1]} H${pt[0]} V${pt[1]}`} fill="none" stroke={i < 4 ? a : dim} strokeWidth={i < 4 ? 1.5 : 1} />;
          })}
          {pts.map((pt, i) => (
            <circle key={i} cx={pt[0]} cy={pt[1]} r={i === 0 ? 8 : 4} fill={i === 0 ? a : i < 5 ? a : 'var(--art-bg)'} stroke={i < 5 ? a : dim} />
          ))}
        </>
      );
    }
    case 'tiles': {
      const n = 5;
      const s = 26;
      return Array.from({ length: n * n }, (_, i) => {
        const on = r() < 0.45;
        const x = W / 2 - (n * s) / 2 + (i % n) * s;
        const y = H / 2 - (n * s) / 2 + Math.floor(i / n) * s;
        return <rect key={i} x={x + 2} y={y + 2} width={s - 4} height={s - 4} fill={on ? a : 'none'} stroke={on ? a : dim} opacity={on ? 0.9 - (i % 3) * 0.2 : 1} />;
      });
    }
    case 'pulse':
      return (
        <>
          <circle cx={W / 2} cy={H / 2} r={84} fill="none" stroke={dim} />
          {[20, 38, 58].map((rad, i) => (
            <circle key={i} cx={W / 2 + 30} cy={H / 2 - 20} r={rad} fill="none" stroke={a2} opacity={1 - i * 0.3} />
          ))}
          {Array.from({ length: 14 }, (_, i) => {
            const t = r() * Math.PI * 2;
            const d = 20 + r() * 60;
            return <circle key={i} cx={W / 2 + Math.cos(t) * d} cy={H / 2 + Math.sin(t) * d} r={2.5} fill={i % 4 ? dim : a2} />;
          })}
          <circle cx={W / 2 - 24} cy={H / 2 + 22} r={6} fill={a} />
        </>
      );
    case 'rings':
      return [26, 44, 62, 80].map((rad, i) => <circle key={i} cx={W / 2} cy={H / 2} r={rad} fill="none" stroke={i === 1 ? a : dim} strokeDasharray={i % 2 ? '4 6' : undefined} />);
    case 'hex': {
      const out: ReactNode[] = [];
      const s = 18;
      for (let row = 0; row < 5; row++)
        for (let col = 0; col < 7; col++) {
          const cx = W / 2 - 3 * s * 1.75 + col * s * 1.75 + (row % 2 ? s * 0.87 : 0);
          const cy = H / 2 - 2 * s * 1.5 + row * s * 1.5;
          const pts = Array.from({ length: 6 }, (_, k) => {
            const t = (Math.PI / 3) * k + Math.PI / 6;
            return `${cx + Math.cos(t) * s * 0.92},${cy + Math.sin(t) * s * 0.92}`;
          }).join(' ');
          const on = r() < 0.18;
          out.push(<polygon key={`${row}-${col}`} points={pts} fill={on ? a : 'none'} stroke={on ? a : dim} opacity={on ? 0.9 : 1} />);
        }
      return out;
    }
    case 'wave':
      return [0, 1, 2, 3].map((i) => {
        const d = Array.from({ length: 17 }, (_, k) => `${k === 0 ? 'M' : 'L'}${k * 20},${H / 2 + Math.sin(k * 0.7 + i) * (20 + i * 10) + (i - 1.5) * 18}`).join(' ');
        return <path key={i} d={d} fill="none" stroke={i === 1 ? a : dim} strokeWidth={i === 1 ? 2 : 1} />;
      });
    case 'bars':
      return Array.from({ length: 14 }, (_, i) => {
        const h = 20 + r() * 120;
        return <rect key={i} x={24 + i * 20} y={H - 20 - h} width={10} height={h} fill={i === 9 ? a : 'none'} stroke={i === 9 ? a : i % 4 === 0 ? a2 : dim} />;
      });
    case 'target':
      return (
        <>
          {[70, 50, 30].map((rad, i) => (
            <circle key={i} cx={W / 2} cy={H / 2} r={rad} fill="none" stroke={i === 2 ? a : dim} strokeWidth={i === 2 ? 2 : 1} />
          ))}
          <circle cx={W / 2} cy={H / 2} r={8} fill={a} />
          <line x1={W / 2 - 100} y1={H / 2} x2={W / 2 - 78} y2={H / 2} stroke={dim} />
          <line x1={W / 2 + 78} y1={H / 2} x2={W / 2 + 100} y2={H / 2} stroke={dim} />
          <line x1={W / 2} y1={H / 2 - 92} x2={W / 2} y2={H / 2 - 78} stroke={dim} />
          <line x1={W / 2} y1={H / 2 + 78} x2={W / 2} y2={H / 2 + 92} stroke={dim} />
        </>
      );
    case 'cards':
      return Array.from({ length: 8 }, (_, i) => {
        const x = 56 + (i % 4) * 54;
        const y = 36 + Math.floor(i / 4) * 68;
        const open = i === 1 || i === 6;
        return (
          <g key={i}>
            <rect x={x} y={y} width={42} height={58} rx={3} fill={open ? 'none' : dim} opacity={open ? 1 : 0.35} stroke={open ? a : dim} />
            {open && <polygon points={`${x + 21},${y + 17} ${x + 33},${y + 39} ${x + 9},${y + 39}`} fill={a} />}
          </g>
        );
      });
    case 'drop':
      return (
        <>
          <line x1={20} y1={34} x2={W - 20} y2={34} stroke={dim} />
          <rect x={W / 2 + 30} y={26} width={30} height={14} fill={a2} />
          <line x1={W / 2 + 45} y1={48} x2={W / 2 + 45} y2={H - 40} stroke={a} strokeDasharray="3 6" />
          <circle cx={W / 2 + 45} cy={110} r={7} fill={a} />
          <rect x={W / 2 + 10} y={H - 32} width={70} height={8} fill="none" stroke={a} />
          <line x1={20} y1={H - 20} x2={W - 20} y2={H - 20} stroke={dim} />
        </>
      );
    case 'golf':
      return (
        <>
          <path d={`M40,40 H200 V100 H280 V170 H40 Z`} fill="none" stroke={dim} strokeWidth={2} />
          <rect x={110} y={100} width={40} height={14} fill={dim} opacity={0.6} />
          <circle cx={250} cy={140} r={9} fill="var(--art-bg)" stroke={a} strokeWidth={2} />
          <circle cx={80} cy={70} r={6} fill={a} />
          <path d="M80,70 Q140,150 240,140" fill="none" stroke={a} strokeDasharray="2 6" />
        </>
      );
    case 'mines': {
      const n = 7;
      const s = 20;
      return Array.from({ length: n * n }, (_, i) => {
        const x = W / 2 - (n * s) / 2 + (i % n) * s;
        const y = H / 2 - (n * s) / 2 + Math.floor(i / n) * s;
        const open = r() < 0.55;
        const num = open && r() < 0.35 ? 1 + Math.floor(r() * 3) : 0;
        return (
          <g key={i}>
            <rect x={x + 1} y={y + 1} width={s - 2} height={s - 2} fill={open ? 'none' : dim} opacity={open ? 1 : 0.4} stroke={dim} strokeWidth={0.5} />
            {num > 0 && (
              <text x={x + s / 2} y={y + s / 2 + 4} textAnchor="middle" fontSize={11} fontFamily="monospace" fill={num === 1 ? a : a2}>
                {num}
              </text>
            )}
          </g>
        );
      });
    }
    case 'flip':
      return (
        <>
          <line x1={0} y1={40} x2={W} y2={40} stroke={dim} strokeWidth={2} />
          <line x1={0} y1={H - 40} x2={W} y2={H - 40} stroke={dim} strokeWidth={2} />
          {Array.from({ length: 7 }, (_, i) => {
            const x = 30 + i * 44;
            const top = i % 2 === 0;
            return top ? (
              <polygon key={i} points={`${x},40 ${x + 14},40 ${x + 7},58`} fill={a2} opacity={0.8} />
            ) : (
              <polygon key={i} points={`${x},${H - 40} ${x + 14},${H - 40} ${x + 7},${H - 58}`} fill={a2} opacity={0.8} />
            );
          })}
          <rect x={96} y={42} width={16} height={16} fill={a} />
          <path d={`M104,62 C104,100 150,100 150,${H - 58}`} fill="none" stroke={a} strokeDasharray="2 5" />
        </>
      );
  }
}

interface Props {
  game: Game;
  className?: string;
  /** Decorative when paired with a visible title. */
  decorative?: boolean;
}

export const GameArt = memo(function GameArt({ game, className, decorative = true }: Props) {
  if (game.thumbnail) {
    return <img className={className} src={asset(game.thumbnail)} alt={decorative ? '' : `${game.title} artwork`} loading="lazy" decoding="async" />;
  }
  const h = game.art.hue;
  const a = `hsl(${h} 95% 62%)`;
  const a2 = `hsl(${(h + 140) % 360} 80% 68%)`;
  const dim = `hsl(${h} 12% 34%)`;
  const id = `g-${game.slug}`;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : `${game.title} artwork`}
      style={{ ['--art-bg' as string]: '#0c0e10' }}
    >
      <defs>
        <radialGradient id={`${id}-glow`} cx="70%" cy="20%" r="80%">
          <stop offset="0%" stopColor={`hsl(${h} 60% 22%)`} />
          <stop offset="60%" stopColor="#0d0f11" />
          <stop offset="100%" stopColor="#08090a" />
        </radialGradient>
        <pattern id={`${id}-dots`} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="#ffffff" opacity="0.06" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-glow)`} />
      <rect width={W} height={H} fill={`url(#${id}-dots)`} />
      <g>{pattern(game, a, a2, dim)}</g>
    </svg>
  );
});
