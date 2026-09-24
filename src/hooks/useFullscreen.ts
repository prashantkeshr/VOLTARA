import { useCallback, useEffect, useState } from 'react';

type FsDoc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => Promise<void>; webkitFullscreenEnabled?: boolean };
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };

export function fullscreenSupported(): boolean {
  const d = document as FsDoc;
  return Boolean(d.fullscreenEnabled || d.webkitFullscreenEnabled);
}

function currentFsElement(): Element | null {
  const d = document as FsDoc;
  return d.fullscreenElement ?? d.webkitFullscreenElement ?? null;
}

/**
 * Wraps the Fullscreen API. `enter` resolves to whether fullscreen actually
 * engaged — callers must never assume success.
 */
export function useFullscreen(target: React.RefObject<HTMLElement>) {
  const [active, setActive] = useState(false);
  const supported = typeof document !== 'undefined' && fullscreenSupported();

  useEffect(() => {
    const onChange = () => setActive(Boolean(target.current && currentFsElement() === target.current));
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, [target]);

  const enter = useCallback(
    async (orientation?: 'landscape' | 'portrait'): Promise<boolean> => {
      const el = target.current as FsEl | null;
      if (!el || !supported) return false;
      try {
        if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
        else return false;
      } catch {
        return false;
      }
      // Orientation lock only works in fullscreen on some mobile browsers; failure is fine.
      const so = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
      if (orientation && so?.lock) so.lock(orientation).catch(() => undefined);
      return currentFsElement() === el;
    },
    [target, supported],
  );

  const exit = useCallback(async () => {
    const d = document as FsDoc;
    if (!currentFsElement()) return;
    try {
      if (d.exitFullscreen) await d.exitFullscreen();
      else await d.webkitExitFullscreen?.();
    } catch {
      /* already exited */
    }
  }, []);

  return { active, supported, enter, exit };
}
