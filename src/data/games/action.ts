import { original } from './define';

export const actionGames = [
  original({
    slug: 'pulse-dodge',
    title: 'Pulse Dodge',
    tagline: 'Survive the arena. Every pulse is aimed at you.',
    description:
      'Guide a point of light around a circular arena while emitters fire pulses and seekers at your position. Waves intensify every ten seconds. Pure survival — how long can you last?',
    category: 'action',
    subcategory: 'Arena',
    tags: ['survival', 'arena', 'dodge', 'bullet hell', 'endless'],
    difficulty: 'hard',
    controls: ['keyboard', 'mouse', 'touch'],
    keyBindings: [
      { keys: 'WASD / Arrows', action: 'Move' },
      { keys: 'Mouse / Touch', action: 'Drag to steer' },
      { keys: 'P', action: 'Pause' },
    ],
    instructions: ['Move with the mouse, touch-drag, or WASD / arrow keys.', 'Avoid every projectile.', 'Survive as long as possible — waves escalate.'],
    featured: true,
    curatedRank: 3,
    releaseDate: '2026-09-14',
    art: { pattern: 'pulse', hue: 12 },
  }),
  original({
    slug: 'gravity-shift',
    title: 'Gravity Shift',
    tagline: 'Flip gravity to thread the gaps. Ceiling or floor — choose fast.',
    description:
      'Your runner sprints forward automatically. Tap to invert gravity and switch between floor and ceiling to avoid spikes. The course speeds up the further you go.',
    category: 'action',
    subcategory: 'Reflex',
    tags: ['runner', 'one button', 'reflex', 'endless'],
    difficulty: 'medium',
    controls: ['keyboard', 'mouse', 'touch'],
    keyBindings: [{ keys: 'Space / ↑ / Click', action: 'Flip gravity' }],
    instructions: ['Tap, click or press Space to flip gravity.', 'Avoid the spikes on both surfaces.', 'Distance is your score.'],
    orientation: 'landscape',
    aspectRatio: 16 / 9,
    curatedRank: 7,
    releaseDate: '2026-09-06',
    art: { pattern: 'flip', hue: 280 },
  }),
];
