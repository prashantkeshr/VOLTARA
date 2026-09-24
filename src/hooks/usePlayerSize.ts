import { useEffect, useState } from 'react';
import type { Orientation } from '../types/game';

export interface PlayerSize {
  width: number;
  height: number;
  rails: boolean;
}

/** Width of one side rail (160px ad) plus its gap to the game. */
export const RAIL_SPACE = 160 + 20;

interface Options {
  aspectRatio: number | null;
  orientation: Orientation;
  focus: boolean;
  allowRails: boolean;
}

/**
 * Fits the game frame into the space actually available.
 *
 * 1. Start from the full content width and the viewport height minus chrome.
 * 2. Fit the game's aspect ratio inside that box (flexible games may fill
 *    the box, capped at 16:9 on large screens so they don't become letterbox
 *    strips on ultrawide monitors).
 * 3. Only if the fitted game leaves enough spare width are ad rails shown —
 *    rails never take width the game could have used.
 */
export function usePlayerSize(stage: React.RefObject<HTMLElement>, { aspectRatio, orientation, focus, allowRails }: Options): PlayerSize {
  const [size, setSize] = useState<PlayerSize>({ width: 0, height: 0, rails: false });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;

    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.visualViewport?.height ?? window.innerHeight;
      const mobile = vw < 768;
      const availW = el.clientWidth;
      const css = getComputedStyle(document.documentElement);
      const header = parseFloat(css.getPropertyValue('--header-h')) || 60;
      // Chrome around the frame: header + breadcrumb bar + control bar + breathing room.
      const chrome = focus ? 52 : header + (mobile ? 46 + 60 : 52 + 70);
      const availH = Math.max(focus ? 200 : 280, vh - chrome);

      let w: number;
      let h: number;
      // Phones: fill the screen unless the game only works in landscape.
      const ratio = mobile && orientation !== 'landscape' ? null : aspectRatio;
      if (ratio) {
        w = availW;
        h = w / ratio;
        if (h > availH) {
          h = availH;
          w = h * ratio;
        }
      } else {
        h = availH;
        w = vw >= 1024 ? Math.min(availW, h * (16 / 9)) : availW;
      }

      const spare = availW - w;
      const rails = allowRails && !focus && !mobile && spare >= RAIL_SPACE * 2 && h >= 420;
      setSize({ width: Math.floor(w), height: Math.floor(h), rails });
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener('resize', compute);
    window.visualViewport?.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
      window.visualViewport?.removeEventListener('resize', compute);
    };
  }, [stage, aspectRatio, orientation, focus, allowRails]);

  return size;
}
