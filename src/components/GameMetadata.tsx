import { Gamepad2, Keyboard, Monitor, MousePointer2, ShieldCheck, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categoryName } from '../data/categories';
import { useLocalState } from '../hooks/useLocalState';
import { CONTROL_LABEL, DURATION_LABEL, ORIENTATION_LABEL, formatPlaytime, timeAgo } from '../lib/format';
import type { ControlScheme, Game } from '../types/game';
import { DifficultyMeter } from './DifficultyMeter';

const CONTROL_ICON: Record<ControlScheme, typeof Keyboard> = { keyboard: Keyboard, mouse: MousePointer2, touch: Smartphone };

const SOURCE_LABEL = { original: 'VOLTARA Original', licensed: 'Licensed game', embed: 'Permitted embed' } as const;

export function GameMetadata({ game }: { game: Game }) {
  const { history } = useLocalState();
  const rec = history[game.slug];
  return (
    <div className="meta">
      <div className="meta__main">
        <p className="eyebrow">
          <Link to={`/categories/${game.category}`}>{categoryName(game.category)}</Link> · {game.subcategory}
        </p>
        <h1 className="meta__title">{game.title}</h1>
        <p className="meta__tagline">{game.tagline}</p>
        <p className="meta__desc">{game.description}</p>

        {game.instructions.length > 0 && (
          <div className="meta__block">
            <h2 className="meta__h">How to play</h2>
            <ol className="meta__steps">
              {game.instructions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        )}

        {game.keyBindings.length > 0 && (
          <div className="meta__block">
            <h2 className="meta__h">Keyboard</h2>
            <dl className="keys">
              {game.keyBindings.map((k) => (
                <div key={k.action} className="keys__row">
                  <dt>
                    <kbd>{k.keys}</kbd>
                  </dt>
                  <dd>{k.action}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {game.tags.length > 0 && (
          <ul className="tags" aria-label="Tags">
            {game.tags.map((t) => (
              <li key={t}>
                <Link to={`/discover?q=${encodeURIComponent(t)}`} className="chip chip--button">
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <dl className="meta__facts">
        <div>
          <dt>Controls</dt>
          <dd className="meta__controls">
            {game.controls.map((c) => {
              const Icon = CONTROL_ICON[c];
              return (
                <span key={c}>
                  <Icon size={14} aria-hidden="true" /> {CONTROL_LABEL[c]}
                </span>
              );
            })}
          </dd>
        </div>
        <div>
          <dt>Difficulty</dt>
          <dd>
            <DifficultyMeter value={game.difficulty} showLabel />
          </dd>
        </div>
        <div>
          <dt>Orientation</dt>
          <dd>
            <Monitor size={14} aria-hidden="true" /> {ORIENTATION_LABEL[game.orientation]}
          </dd>
        </div>
        <div>
          <dt>Session</dt>
          <dd>{DURATION_LABEL[game.duration]}</dd>
        </div>
        <div>
          <dt>Players</dt>
          <dd>
            <Gamepad2 size={14} aria-hidden="true" /> {game.multiplayer ? 'Multiplayer' : 'Single player'}
          </dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>
            <ShieldCheck size={14} aria-hidden="true" /> {SOURCE_LABEL[game.source]}
            {game.credit && (
              <>
                {' · '}
                {game.credit.url ? (
                  <a href={game.credit.url} target="_blank" rel="noopener noreferrer">
                    {game.credit.name}
                  </a>
                ) : (
                  game.credit.name
                )}
              </>
            )}
          </dd>
        </div>
        {rec && (
          <div>
            <dt>On this device</dt>
            <dd>
              Played {rec.plays}× · {formatPlaytime(rec.seconds)} · last {timeAgo(rec.last)}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
