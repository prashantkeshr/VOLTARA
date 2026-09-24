/**
 * Local-first persistence. Small, frequently-read state lives in localStorage
 * behind a tiny subscribable store; everything is namespaced under `voltara:`.
 * All access is wrapped — private mode or blocked storage degrades to memory.
 */

export type ThemePref = 'dark' | 'system';
export type MotionPref = 'full' | 'reduced';

export interface Prefs {
  theme: ThemePref;
  motion: MotionPref;
  autoStart: boolean;
  autoFocus: boolean;
  rememberFullscreen: boolean;
  /** Last fullscreen choice, only used when rememberFullscreen is on. */
  lastFullscreen: boolean;
  sound: boolean;
  saveSearchHistory: boolean;
}

export interface PlayRecord {
  plays: number;
  first: number;
  last: number;
  /** Seconds with the game page visible. */
  seconds: number;
}

export interface LocalState {
  favorites: string[];
  history: Record<string, PlayRecord>;
  searches: string[];
  prefs: Prefs;
}

const KEYS = {
  favorites: 'voltara:favorites',
  history: 'voltara:history',
  searches: 'voltara:searches',
  prefs: 'voltara:prefs',
} as const;

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const defaultPrefs: Prefs = {
  theme: 'dark',
  motion: prefersReduced ? 'reduced' : 'full',
  autoStart: true,
  autoFocus: false,
  rememberFullscreen: false,
  lastFullscreen: false,
  sound: true,
  saveSearchHistory: true,
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — state stays in memory for this session */
  }
}

function load(): LocalState {
  return {
    favorites: read<string[]>(KEYS.favorites, []),
    history: read<Record<string, PlayRecord>>(KEYS.history, {}),
    searches: read<string[]>(KEYS.searches, []),
    prefs: { ...defaultPrefs, ...read<Partial<Prefs>>(KEYS.prefs, {}) },
  };
}

let state: LocalState = load();
const listeners = new Set<() => void>();

function commit(next: Partial<LocalState>): void {
  state = { ...state, ...next };
  (Object.keys(next) as (keyof LocalState)[]).forEach((k) => write(KEYS[k], state[k]));
  listeners.forEach((l) => l());
}

export const store = {
  get: (): LocalState => state,
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  toggleFavorite(slug: string): boolean {
    const has = state.favorites.includes(slug);
    commit({ favorites: has ? state.favorites.filter((s) => s !== slug) : [slug, ...state.favorites] });
    return !has;
  },

  recordPlay(slug: string): void {
    const now = Date.now();
    const prev = state.history[slug];
    commit({
      history: {
        ...state.history,
        [slug]: { plays: (prev?.plays ?? 0) + 1, first: prev?.first ?? now, last: now, seconds: prev?.seconds ?? 0 },
      },
    });
  },

  addPlayTime(slug: string, seconds: number): void {
    const prev = state.history[slug];
    if (!prev || seconds <= 0) return;
    commit({ history: { ...state.history, [slug]: { ...prev, seconds: prev.seconds + Math.round(seconds) } } });
  },

  removeFromHistory(slug: string): void {
    const { [slug]: _removed, ...rest } = state.history;
    commit({ history: rest });
  },

  addSearch(query: string): void {
    const q = query.trim().toLowerCase();
    if (!q || !state.prefs.saveSearchHistory) return;
    commit({ searches: [q, ...state.searches.filter((s) => s !== q)].slice(0, 8) });
  },

  setPrefs(patch: Partial<Prefs>): void {
    commit({ prefs: { ...state.prefs, ...patch } });
  },

  clearFavorites: () => commit({ favorites: [] }),
  clearHistory: () => commit({ history: {}, searches: [] }),
  clearAll(): void {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('voltara'))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    state = { favorites: [], history: {}, searches: [], prefs: { ...defaultPrefs } };
    listeners.forEach((l) => l());
  },
};

// Keep multiple tabs in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('voltara:')) {
      state = load();
      listeners.forEach((l) => l());
    }
  });
}
