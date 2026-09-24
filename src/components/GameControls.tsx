import { ExternalLink, Flag, Maximize, Minimize, RotateCcw, Scan, Volume2, VolumeX } from 'lucide-react';
import { useLocalState } from '../hooks/useLocalState';
import { store } from '../lib/storage';
import type { Game } from '../types/game';
import { FavoriteButton } from './FavoriteButton';

interface Props {
  game: Game;
  canEmbed: boolean;
  running: boolean;
  fullscreenActive: boolean;
  onFocus: () => void;
  onFullscreen: () => void;
  onReload: () => void;
  onOpen: () => void;
  onReport: () => void;
}

/** The player control bar — sits below the frame, never over gameplay. */
export function GameControls({ game, canEmbed, running, fullscreenActive, onFocus, onFullscreen, onReload, onOpen, onReport }: Props) {
  const { prefs } = useLocalState();
  const soon = game.type === 'COMING_SOON';
  return (
    <div className="controls" role="toolbar" aria-label="Game controls">
      <div className="controls__group">
        <button type="button" className="ctl ctl--accent" onClick={onFocus} disabled={!canEmbed}>
          <Scan size={16} aria-hidden="true" />
          <span>FOCUS</span>
        </button>
        <button type="button" className="ctl" onClick={onFullscreen} disabled={!canEmbed} aria-pressed={fullscreenActive}>
          {fullscreenActive ? <Minimize size={16} aria-hidden="true" /> : <Maximize size={16} aria-hidden="true" />}
          <span>FULLSCREEN</span>
        </button>
        <button type="button" className="ctl" onClick={onReload} disabled={!running || !canEmbed}>
          <RotateCcw size={16} aria-hidden="true" />
          <span>RELOAD</span>
        </button>
        <button type="button" className="ctl" onClick={onOpen} disabled={soon || !game.url}>
          <ExternalLink size={16} aria-hidden="true" />
          <span>OPEN</span>
        </button>
      </div>
      <div className="controls__group">
        {game.type === 'LOCAL' && (
          <button
            type="button"
            className="ctl ctl--icon"
            onClick={() => store.setPrefs({ sound: !prefs.sound })}
            aria-pressed={prefs.sound}
            aria-label={prefs.sound ? 'Mute game sound' : 'Unmute game sound'}
            title={prefs.sound ? 'Sound on' : 'Sound off'}
          >
            {prefs.sound ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
          </button>
        )}
        <FavoriteButton slug={game.slug} title={game.title} variant="full" />
        <button type="button" className="ctl ctl--icon" onClick={onReport} aria-label="Report a problem" title="Report a problem">
          <Flag size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
