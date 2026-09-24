/**
 * VOLTARA game catalog model.
 *
 * Every game on the platform is described by metadata only. The universal
 * GamePlayer decides how to run it from `type`, `url` and `embedAllowed`.
 */

export type GameType = 'LOCAL' | 'IFRAME' | 'EXTERNAL' | 'COMING_SOON';

/** Licensing origin — drives badges and what the player is allowed to do. */
export type GameSource = 'original' | 'licensed' | 'embed';

export type GameStatus = 'live' | 'coming-soon' | 'maintenance';

export type CategoryId =
  | 'action'
  | 'arcade'
  | 'puzzle'
  | 'racing'
  | 'sports'
  | 'strategy'
  | 'casual'
  | 'board'
  | 'educational'
  | 'multiplayer';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type ControlScheme = 'keyboard' | 'mouse' | 'touch';
export type Orientation = 'landscape' | 'portrait' | 'any';
/** quick: < ~5 min sessions, medium: 5–15 min, long: open-ended. */
export type PlayDuration = 'quick' | 'medium' | 'long';

/** Procedural artwork descriptor — every card is drawn as SVG, no image downloads. */
export type ArtPattern =
  | 'grid'
  | 'orbit'
  | 'lanes'
  | 'stack'
  | 'nodes'
  | 'tiles'
  | 'pulse'
  | 'rings'
  | 'hex'
  | 'wave'
  | 'bars'
  | 'target'
  | 'cards'
  | 'drop'
  | 'golf'
  | 'mines'
  | 'flip';

export interface GameArt {
  pattern: ArtPattern;
  /** Signature hue 0–360 used for the artwork's accent geometry. */
  hue: number;
}

export interface KeyBinding {
  keys: string;
  action: string;
}

export interface Game {
  id: string;
  slug: string;
  title: string;
  /** One-line hook shown on cards and in meta descriptions. */
  tagline: string;
  description: string;
  category: CategoryId;
  subcategory: string;
  tags: string[];
  difficulty: Difficulty;
  controls: ControlScheme[];
  keyBindings: KeyBinding[];
  instructions: string[];
  orientation: Orientation;
  /** Intended width / height. `null` means the game fills any shape. */
  aspectRatio: number | null;
  duration: PlayDuration;
  multiplayer: boolean;
  featured: boolean;
  /** Curated editorial rank (lower = higher priority). Not a popularity claim. */
  curatedRank: number;
  releaseDate: string;
  type: GameType;
  source: GameSource;
  /** LOCAL: path under /public/games. IFRAME/EXTERNAL: absolute https URL. */
  url: string | null;
  embedAllowed: boolean;
  status: GameStatus;
  art: GameArt;
  /** Optional raster artwork; procedural art is used when absent. */
  thumbnail?: string;
  banner?: string;
  /** For licensed / embed titles: publisher credit shown on the game page. */
  credit?: { name: string; url?: string; license?: string };
}

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  subcategories: string[];
  hue: number;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  slugs: string[];
}
