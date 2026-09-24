import type { Collection } from '../types/game';

/** Hand-curated editorial collections. Labels never imply usage statistics. */
export const collections: Collection[] = [
  {
    id: 'originals',
    title: 'VOLTARA Originals',
    description: 'Built in-house. Run entirely in your browser, work offline once cached.',
    slugs: ['neon-grid', 'orbit-runner', 'signal-switch', 'vector-race', 'block-shift', 'pulse-dodge', 'mini-golf', 'stack-line'],
  },
  {
    id: 'brain',
    title: 'Think Fast',
    description: 'Logic and memory under pressure.',
    slugs: ['color-tap', 'sum-sprint', 'memory-field', 'sweep-grid', 'number-merge'],
  },
];
