import { original, upcoming } from './define';

export const strategyGames = [
  ...[
    ['signal-command', 'Signal Command', 'Command relay networks across a hostile grid.', 'Tactical', 'nodes', 280],
    ['grid-defense', 'Grid Defense', 'Build a maze of towers and hold the line.', 'Tower defense', 'grid', 12],
    ['tactical-core', 'Tactical Core', 'Turn-based squad tactics on compact maps.', 'Turn-based', 'hex', 220],
    ['resource-node', 'Resource Node', 'Balance extraction, power and expansion.', 'Resource management', 'rings', 100],
  ].map(([slug, title, tagline, sub, pattern, hue]) =>
    upcoming({
      slug: slug as string,
      title: title as string,
      tagline: tagline as string,
      description: `${tagline} In development.`,
      category: 'strategy',
      subcategory: sub as string,
      tags: ['strategy'],
      duration: 'long',
      art: { pattern: pattern as 'nodes', hue: hue as number },
    }),
  ),
];

export const casualGames = [
  original({
    slug: 'color-tap',
    title: 'Color Tap',
    tagline: 'Read the ink, not the word. Your brain will argue.',
    description:
      'A fast Stroop-effect challenge. A colour word appears in a mismatched ink — pick the ink colour, not the word. Thirty seconds, escalating pace, streak multipliers. Answer buttons are labelled, so it never relies on colour vision alone for the controls.',
    category: 'casual',
    subcategory: 'Quick play',
    tags: ['quick', 'brain', 'reaction', 'stroop'],
    difficulty: 'easy',
    controls: ['mouse', 'touch', 'keyboard'],
    keyBindings: [{ keys: '1 – 4', action: 'Choose answer' }],
    instructions: ['Choose the colour of the ink, not the word.', 'Streaks multiply your score.', 'Wrong answers cost 2 seconds.'],
    curatedRank: 11,
    releaseDate: '2026-09-03',
    art: { pattern: 'bars', hue: 45 },
  }),
  original({
    slug: 'precision-drop',
    title: 'Precision Drop',
    tagline: 'Release on time. Land dead centre.',
    description:
      'A carrier sweeps across the top of the screen while a landing pad drifts below. Release the payload so it lands on the pad — centre hits score triple. Ten drops per run.',
    category: 'casual',
    subcategory: 'Mini games',
    tags: ['timing', 'one button', 'precision', 'quick'],
    difficulty: 'easy',
    controls: ['keyboard', 'mouse', 'touch'],
    keyBindings: [{ keys: 'Space / Click', action: 'Release payload' }],
    instructions: ['Tap, click or press Space to release.', 'Centre hits: 300. Pad hits: 100.', 'Ten drops per run.'],
    curatedRank: 14,
    releaseDate: '2026-09-01',
    art: { pattern: 'drop', hue: 78 },
  }),
  ...[
    ['quick-target', 'Quick Target', 'Tap targets as they appear. Thirty seconds.', 'target', 12],
    ['perfect-stack', 'Perfect Stack', 'A zen stacking toy with no fail state.', 'stack', 190],
    ['orbit-catch', 'Orbit Catch', 'Catch falling stars from an orbiting ring.', 'orbit', 45],
  ].map(([slug, title, tagline, pattern, hue]) =>
    upcoming({
      slug: slug as string,
      title: title as string,
      tagline: tagline as string,
      description: `${tagline} In development.`,
      category: 'casual',
      subcategory: 'Quick play',
      tags: ['casual'],
      art: { pattern: pattern as 'target', hue: hue as number },
    }),
  ),
];

export const sportsGames = [
  original({
    slug: 'mini-golf',
    title: 'Mini Golf',
    tagline: 'Nine geometric holes. Pull, aim, sink it.',
    description:
      'Minimalist mini golf across nine hand-designed holes with walls, bumpers and slopes. Drag back from the ball to set direction and power. Beat par on every hole.',
    category: 'sports',
    subcategory: 'Golf',
    tags: ['golf', 'physics', 'precision', 'relaxing'],
    difficulty: 'easy',
    controls: ['mouse', 'touch'],
    instructions: ['Drag back from the ball to aim — longer drag, more power.', 'Release to shoot.', 'Sink the ball in as few strokes as possible.'],
    aspectRatio: 16 / 10,
    orientation: 'landscape',
    duration: 'medium',
    featured: true,
    curatedRank: 5,
    releaseDate: '2026-09-16',
    art: { pattern: 'golf', hue: 140 },
  }),
];

export const boardGames = [
  original({
    slug: 'sweep-grid',
    title: 'Sweep Grid',
    tagline: 'Classic mine deduction on a clean technical grid.',
    description:
      'The classic deduction game. Reveal every safe cell without triggering a mine; numbers show how many mines touch each cell. First reveal is always safe. Three board sizes.',
    category: 'board',
    subcategory: 'Minesweeper',
    tags: ['minesweeper', 'logic', 'deduction', 'grid', 'classic'],
    difficulty: 'medium',
    controls: ['mouse', 'touch'],
    keyBindings: [
      { keys: 'Left click / Tap', action: 'Reveal' },
      { keys: 'Right click / Long press', action: 'Flag' },
    ],
    instructions: ['Reveal cells; numbers count adjacent mines.', 'Flag suspected mines with right-click or long-press.', 'Use the Flag mode toggle on touch devices.'],
    duration: 'medium',
    curatedRank: 13,
    releaseDate: '2026-09-07',
    art: { pattern: 'mines', hue: 30 },
  }),
];

export const educationalGames = [
  original({
    slug: 'sum-sprint',
    title: 'Sum Sprint',
    tagline: 'Pick tiles that add up to the target. Beat the clock.',
    description:
      'Mental arithmetic under pressure. Select number tiles that sum exactly to the target. Targets grow as you level up. Sixty seconds per run.',
    category: 'educational',
    subcategory: 'Mathematics',
    tags: ['math', 'arithmetic', 'numbers', 'brain', 'quick'],
    difficulty: 'easy',
    controls: ['mouse', 'touch'],
    instructions: ['Select tiles whose sum equals the target.', 'Selections clear automatically when correct.', 'Overshooting resets your selection.'],
    curatedRank: 15,
    releaseDate: '2026-09-02',
    art: { pattern: 'grid', hue: 210 },
  }),
];
