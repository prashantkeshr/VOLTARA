import type { Category, CategoryId } from '../types/game';

export const categories: Category[] = [
  {
    id: 'action',
    name: 'Action',
    description: 'Reflex-driven survival, dodging and arena play.',
    subcategories: ['Platformers', 'Combat', 'Survival', 'Arena', 'Shooter', 'Reflex', 'Endless'],
    hue: 12,
  },
  {
    id: 'arcade',
    name: 'Arcade',
    description: 'Pick up, chase the high score, go again.',
    subcategories: ['Classic arcade', 'High score', 'Brick breaker', 'Reaction', 'Timing', 'Endless runner'],
    hue: 78,
  },
  {
    id: 'puzzle',
    name: 'Puzzle',
    description: 'Logic, matching, numbers and spatial reasoning.',
    subcategories: ['Logic', 'Matching', 'Number', 'Word', 'Memory', 'Physics', 'Grid'],
    hue: 250,
  },
  {
    id: 'racing',
    name: 'Racing',
    description: 'Speed, traffic and time trials.',
    subcategories: ['Cars', 'Bikes', 'Drift', 'Time trial', 'Traffic', 'Top-down racing'],
    hue: 190,
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Precision sports and physics games.',
    subcategories: ['Football', 'Basketball', 'Tennis', 'Golf', 'Pool', 'Cricket', 'Bowling'],
    hue: 140,
  },
  {
    id: 'strategy',
    name: 'Strategy',
    description: 'Plan, defend, manage resources.',
    subcategories: ['Tower defense', 'Tactical', 'Resource management', 'Logic strategy', 'Turn-based'],
    hue: 280,
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Short, relaxing sessions — one more round.',
    subcategories: ['Quick play', 'Relaxing', 'Idle', 'Clicker', 'Mini games'],
    hue: 45,
  },
  {
    id: 'board',
    name: 'Board & Card',
    description: 'Timeless board, card and grid classics.',
    subcategories: ['Chess', 'Checkers', 'Solitaire', 'Minesweeper', 'Sudoku', 'Mahjong', 'Connect Four'],
    hue: 30,
  },
  {
    id: 'educational',
    name: 'Educational',
    description: 'Train mental math, memory and logic.',
    subcategories: ['Mathematics', 'Memory', 'Geography', 'Vocabulary', 'Logic'],
    hue: 210,
  },
  {
    id: 'multiplayer',
    name: 'Multiplayer',
    description: 'Play with others where technically and legally supported.',
    subcategories: ['Local', 'Online'],
    hue: 320,
  },
];

const byId = new Map(categories.map((c) => [c.id, c]));

export function getCategory(id: string): Category | undefined {
  return byId.get(id as CategoryId);
}

export function categoryName(id: CategoryId): string {
  return byId.get(id)?.name ?? id;
}
