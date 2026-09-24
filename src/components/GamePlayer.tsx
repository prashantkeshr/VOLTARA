import { AlertTriangle, ArrowLeft, ExternalLink, Flag, Library, Maximize, Minimize, Play, RotateCcw, Smartphone, WifiOff } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { adMode } from '../config/ads';
import { useFullscreen } from '../hooks/useFullscreen';
import { useLocalState } from '../hooks/useLocalState';
import { useOnline } from '../hooks/useOnline';
import { usePlayerSize } from '../hooks/usePlayerSize';
import { asset } from '../lib/format';
import { store } from '../lib/storage';
import type { Game } from '../types/game';
import { AdSlot } from './AdSlot';
import { GameArt } from './GameArt';
import { GameControls } from './GameControls';
import { ErrorState, LoadingState } from './States';
import { useToast } from './Toast';

type Phase = 'poster' | 'checking' | 'loading' | 'ready' | 'slow' | 'error';

/** How long a game may take to signal readiness before we call it failed. */
const LOCAL_TIMEOUT = 12_000;
const EMBED_SLOW = 20_000;

/** Deliberately minimal capabilities for game frames. No popups, no top navigation. */
const SANDBOX = 'allow-scripts allow-same-origin allow-pointer-lock allow-orientation-lock';
const ALLOW = 'fullscreen; gamepad; autoplay';

interface Props {
  game: Game;
  focus: boolean;
  onFocusChange: (focus: boolean) => void;
  onStarted: () => void;
  onReport: () => void;
}

export function GamePlayer({ game, focus, onFocusChange, onStarted, onReport }: Props) {
  const { prefs } = useLocalState();
  const online = useOnline();
  const toast = useToast();

  const stageRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const canEmbed = game.type === 'LOCAL' || (game.type === 'IFRAME' && game.embedAllowed);
  const src = game.url ? asset(game.url) : null;

  const [phase, setPhase] = useState<Phase>(canEmbed && prefs.autoStart ? 'checking' : 'poster');
  const [attempt, setAttempt] = useState(0);
  const [resumeFs, setResumeFs] = useState(false);
  const startedRef = useRef(false);

  const size = usePlayerSize(stageRef, { aspectRatio: game.aspectRatio, orientation: game.orientation, focus, allowRails: adMode !== 'off' });
  const fs = useFullscreen(shellRef);

  const needsNetwork = game.type !== 'LOCAL';
  const blockedOffline = needsNetwork && !online;

  // Reset when navigating between games.
  useEffect(() => {
    startedRef.current = false;
    setAttempt(0);
    setPhase(canEmbed && store.get().prefs.autoStart ? 'checking' : 'poster');
  }, [game.slug, canEmbed]);

  const markStarted = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    onStarted();
    const p = store.get().prefs;
    if (p.rememberFullscreen && p.lastFullscreen && fs.supported) setResumeFs(true);
  }, [onStarted, fs.supported]);

  // Verify local game files exist before mounting the iframe, so a missing
  // build never produces a blank frame.
  useEffect(() => {
    if (phase !== 'checking' || !src) return;
    if (blockedOffline) {
      setPhase('error');
      return;
    }
    if (game.type !== 'LOCAL') {
      setPhase('loading');
      return;
    }
    let cancelled = false;
    fetch(src, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((html) => {
        if (cancelled) return;
        setPhase(html.includes('data-voltara-game') ? 'loading' : 'error');
      })
      .catch(() => !cancelled && setPhase('error'));
    return () => {
      cancelled = true;
    };
  }, [phase, src, game.type, blockedOffline, attempt]);

  useEffect(() => {
    if (phase === 'loading') markStarted();
  }, [phase, markStarted]);

  // Readiness: LOCAL games post `voltara:ready`; third-party embeds only fire load.
  useEffect(() => {
    if (phase !== 'loading') return;
    const onMsg = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      const type = (e.data as { type?: string } | null)?.type;
      if (type === 'voltara:ready') setPhase('ready');
    };
    window.addEventListener('message', onMsg);
    const t = window.setTimeout(() => setPhase((p) => (p === 'loading' ? (game.type === 'LOCAL' ? 'error' : 'slow') : p)), game.type === 'LOCAL' ? LOCAL_TIMEOUT : EMBED_SLOW);
    return () => {
      window.removeEventListener('message', onMsg);
      window.clearTimeout(t);
    };
  }, [phase, game.type, attempt]);

  // Messages from a running game (Escape forwards focus-mode exit).
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      if ((e.data as { type?: string } | null)?.type === 'voltara:escape' && focus && !fs.active) onFocusChange(false);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [focus, fs.active, onFocusChange]);

  // Push preferences into local games; focus the frame so keys work immediately.
  useEffect(() => {
    if (phase !== 'ready') return;
    const win = iframeRef.current?.contentWindow;
    if (game.type === 'LOCAL') win?.postMessage({ type: 'voltara:settings', sound: prefs.sound, reducedMotion: prefs.motion === 'reduced' }, window.location.origin);
  }, [phase, prefs.sound, prefs.motion, game.type]);

  useEffect(() => {
    if (phase === 'ready') {
      iframeRef.current?.focus();
      if (store.get().prefs.autoFocus) onFocusChange(true);
    }
  }, [phase, onFocusChange]);

  // Focus mode: Escape exits (when the parent document has focus).
  useEffect(() => {
    if (!focus) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !fs.active) onFocusChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus, fs.active, onFocusChange]);

  const start = useCallback(async () => {
    setPhase('checking');
    const p = store.get().prefs;
    if (p.rememberFullscreen && p.lastFullscreen) {
      await fs.enter(game.orientation === 'any' ? undefined : game.orientation);
    }
  }, [fs, game.orientation]);

  const reload = useCallback(() => {
    if (phase === 'poster') return;
    setAttempt((a) => a + 1);
    setPhase('checking');
    toast(`Reloading ${game.title}`);
  }, [phase, game.title, toast]);

  const toggleFullscreen = useCallback(async () => {
    setResumeFs(false);
    if (fs.active) {
      await fs.exit();
      if (store.get().prefs.rememberFullscreen) store.setPrefs({ lastFullscreen: false });
      return;
    }
    const ok = await fs.enter(game.orientation === 'any' ? undefined : game.orientation);
    if (ok) {
      if (store.get().prefs.rememberFullscreen) store.setPrefs({ lastFullscreen: true });
      iframeRef.current?.focus();
    } else {
      onFocusChange(true);
      toast("Fullscreen isn't available in this browser — Focus Mode is on instead.");
    }
  }, [fs, game.orientation, onFocusChange, toast]);

  const openExternal = useCallback(() => {
    if (!src) return;
    window.open(src, '_blank', 'noopener,noreferrer');
    if (game.type === 'EXTERNAL') markStarted();
  }, [src, game.type, markStarted]);

  const showFrame = canEmbed && src && (phase === 'loading' || phase === 'ready' || phase === 'slow');
  const portraitHint = game.orientation === 'landscape' && size.height > size.width * 1.1;

  return (
    <div className={`player${focus ? ' player--focus' : ''}`}>
      {focus && (
        <div className="player__focusbar">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => onFocusChange(false)}>
            <ArrowLeft size={16} aria-hidden="true" /> EXIT
          </button>
          <span className="player__focustitle">{game.title}</span>
          <button type="button" className="btn btn--ghost btn--sm" onClick={toggleFullscreen}>
            {fs.active ? <Minimize size={16} aria-hidden="true" /> : <Maximize size={16} aria-hidden="true" />} FULLSCREEN
          </button>
        </div>
      )}

      <div className="player__stage" ref={stageRef}>
        {size.rails && <AdSlot id="game-left" size="rail" className="player__rail" />}

        <div
          ref={shellRef}
          className={`player__frame${fs.active ? ' is-fullscreen' : ''}`}
          style={size.width ? { width: size.width, height: size.height } : undefined}
        >
          {showFrame && (
            <iframe
              key={`${game.slug}-${attempt}`}
              ref={iframeRef}
              src={src!}
              title={`${game.title} — game`}
              className={`player__iframe${phase === 'ready' || phase === 'slow' ? ' is-visible' : ''}`}
              sandbox={SANDBOX}
              allow={ALLOW}
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => game.type !== 'LOCAL' && setPhase('ready')}
            />
          )}

          {(phase === 'checking' || phase === 'loading') && (
            <div className="player__overlay">
              <LoadingState label="INITIALIZING GAME" />
            </div>
          )}

          {phase === 'poster' && <Poster game={game} canEmbed={canEmbed} blockedOffline={blockedOffline} onPlay={start} onOpen={openExternal} />}

          {phase === 'slow' && (
            <div className="player__notice" role="status">
              <span>This game is taking longer than expected to load.</span>
              <button type="button" className="btn btn--sm" onClick={reload}>
                <RotateCcw size={14} aria-hidden="true" /> Retry
              </button>
              <button type="button" className="btn btn--sm" onClick={openExternal}>
                <ExternalLink size={14} aria-hidden="true" /> Open externally
              </button>
              <button type="button" className="icon-btn" aria-label="Dismiss" onClick={() => setPhase('ready')}>
                ×
              </button>
            </div>
          )}

          {phase === 'error' && (
            <div className="player__overlay player__overlay--solid">
              {blockedOffline ? (
                <ErrorState
                  icon={<WifiOff size={28} />}
                  title="YOU'RE OFFLINE"
                  body="This game requires an internet connection. VOLTARA Originals you've played before work offline."
                  action={
                    <>
                      <button type="button" className="btn btn--primary" onClick={() => setPhase('checking')}>
                        <RotateCcw size={16} aria-hidden="true" /> RETRY
                      </button>
                      <Link to="/discover?playable=1" className="btn">
                        <Library size={16} aria-hidden="true" /> Return to library
                      </Link>
                    </>
                  }
                />
              ) : (
                <ErrorState
                  icon={<AlertTriangle size={28} />}
                  title="THIS GAME IS CURRENTLY UNAVAILABLE"
                  body={!online ? "You're offline and this game hasn't been cached on this device yet." : 'It failed to load. Retrying usually helps.'}
                  action={
                    <>
                      <button type="button" className="btn btn--primary" onClick={reload}>
                        <RotateCcw size={16} aria-hidden="true" /> RETRY
                      </button>
                      {src && (
                        <button type="button" className="btn" onClick={openExternal}>
                          <ExternalLink size={16} aria-hidden="true" /> Open externally
                        </button>
                      )}
                      <button type="button" className="btn" onClick={onReport}>
                        <Flag size={16} aria-hidden="true" /> Report problem
                      </button>
                      <Link to="/discover" className="btn">
                        <Library size={16} aria-hidden="true" /> Return to library
                      </Link>
                    </>
                  }
                />
              )}
            </div>
          )}

          {resumeFs && phase === 'ready' && !fs.active && (
            <button type="button" className="player__resume" onClick={toggleFullscreen}>
              <Maximize size={14} aria-hidden="true" /> Resume fullscreen
            </button>
          )}

          {portraitHint && phase === 'ready' && !fs.active && (
            <div className="player__hint" aria-hidden="true">
              <Smartphone size={14} style={{ transform: 'rotate(90deg)' }} /> Best in landscape
            </div>
          )}
        </div>

        {size.rails && <AdSlot id="game-right" size="rail" className="player__rail" />}
      </div>

      {!focus && (
        <GameControls
          game={game}
          canEmbed={Boolean(canEmbed)}
          running={phase !== 'poster'}
          fullscreenActive={fs.active}
          onFocus={() => onFocusChange(true)}
          onFullscreen={toggleFullscreen}
          onReload={reload}
          onOpen={openExternal}
          onReport={onReport}
        />
      )}
    </div>
  );
}

function Poster({ game, canEmbed, blockedOffline, onPlay, onOpen }: { game: Game; canEmbed: boolean | null; blockedOffline: boolean; onPlay: () => void; onOpen: () => void }) {
  const soon = game.type === 'COMING_SOON';
  return (
    <div className="poster">
      <GameArt game={game} className="poster__art" />
      <div className="poster__scrim" />
      <div className="poster__content">
        <p className="eyebrow">{soon ? 'In development' : game.source === 'original' ? 'VOLTARA Original' : 'Third-party game'}</p>
        <h2 className="poster__title">{game.title}</h2>
        <p className="poster__tagline">{game.tagline}</p>
        {soon ? (
          <div className="poster__actions">
            <span className="chip chip--soon">COMING SOON</span>
            <Link to="/discover?playable=1" className="btn">
              <Library size={16} aria-hidden="true" /> Browse playable games
            </Link>
          </div>
        ) : blockedOffline ? (
          <div className="poster__actions">
            <p className="poster__warn">
              <WifiOff size={16} aria-hidden="true" /> Internet connection required.
            </p>
          </div>
        ) : canEmbed ? (
          <div className="poster__actions">
            <button type="button" className="btn btn--primary btn--xl" onClick={onPlay} autoFocus>
              <Play size={20} fill="currentColor" strokeWidth={0} aria-hidden="true" /> PLAY NOW
            </button>
          </div>
        ) : (
          <div className="poster__actions poster__actions--col">
            <p className="poster__embed-title mono">EMBEDDING IS NOT AVAILABLE</p>
            <p className="poster__note">This game must be opened separately.</p>
            <button type="button" className="btn btn--primary btn--xl" onClick={onOpen}>
              <ExternalLink size={18} aria-hidden="true" /> OPEN GAME
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
