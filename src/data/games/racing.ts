import { original, upcoming } from './define';

export const racingGames = [
  original({
    slug: 'vector-race',
    title: 'Vector Race',
    tagline: 'Three lanes, rising speed, zero margin for error.',
    description:
      'Weave through traffic on an endless neon highway. Speed climbs continuously; near misses award bonus points. One collision ends the run.',
    category: 'racing',
    subcategory: 'Traffic',
    tags: ['racing', 'traffic', 'endless', 'cars', 'keyboard'],
    difficulty: 'medium',
    controls: ['keyboard', 'touch', 'mouse'],
    keyBindings: [
      { keys: '← → / A D', action: 'Change lane' },
      { keys: 'Space', action: 'Start / restart' },
      { keys: 'P', action: 'Pause' },
    ],
    instructions: ['Change lanes to avoid traffic.', 'Touch: tap the left or right side.', 'Near misses score +25.'],
    orientation: 'portrait',
    aspectRatio: 3 / 4,
    featured: true,
    curatedRank: 3,
    releaseDate: '2026-09-15',
    art: { pattern: 'lanes', hue: 190 },
  }),
  ...[
    ['neon-circuit', 'Neon Circuit', 'Top-down circuit racing against the clock.', 'Top-down racing', 200],
    ['drift-line', 'Drift Line', 'Hold the perfect drift angle through every corner.', 'Drift', 330],
    ['traffic-run', 'Traffic Run', 'Rush-hour dodging in dense city traffic.', 'Traffic', 30],
    ['time-attack', 'Time Attack', 'Checkpoint sprints with ghost replays.', 'Time trial', 90],
    ['apex-sprint', 'Apex Sprint', 'Short, technical sprint tracks. Hit every apex.', 'Cars', 150],
  ].map(([slug, title, tagline, sub, hue]) =>
    upcoming({
      slug: slug as string,
      title: title as string,
      tagline: tagline as string,
      description: `${tagline} In development.`,
      category: 'racing',
      subcategory: sub as string,
      tags: ['racing'],
      art: { pattern: 'lanes', hue: hue as number },
    }),
  ),
];
