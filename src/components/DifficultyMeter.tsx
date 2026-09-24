import type { Difficulty } from '../types/game';
import { DIFFICULTY_LABEL, DIFFICULTY_LEVEL } from '../lib/format';

/** Three bars + text label, so difficulty never depends on colour alone. */
export function DifficultyMeter({ value, showLabel = false }: { value: Difficulty; showLabel?: boolean }) {
  const level = DIFFICULTY_LEVEL[value];
  return (
    <span className="difficulty" title={`Difficulty: ${DIFFICULTY_LABEL[value]}`}>
      <span className="difficulty__bars" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span key={i} className={i <= level ? 'on' : ''} />
        ))}
      </span>
      <span className={showLabel ? '' : 'visually-hidden'}>{DIFFICULTY_LABEL[value]}</span>
    </span>
  );
}
