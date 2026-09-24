import type { ControlScheme, Difficulty, Orientation, PlayDuration } from '../types/game';

export const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
export const DIFFICULTY_LEVEL: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 };
export const DURATION_LABEL: Record<PlayDuration, string> = { quick: 'Under 5 min', medium: '5–15 min', long: 'Open-ended' };
export const ORIENTATION_LABEL: Record<Orientation, string> = { landscape: 'Landscape', portrait: 'Portrait', any: 'Any orientation' };
export const CONTROL_LABEL: Record<ControlScheme, string> = { keyboard: 'Keyboard', mouse: 'Mouse', touch: 'Touch' };

export function timeAgo(ts: number): string {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} d ago`;
  return new Date(ts).toLocaleDateString();
}

export function formatPlaytime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

/** Resolve a public asset path against the deployment base (GitHub Pages subpaths). */
export function asset(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}
