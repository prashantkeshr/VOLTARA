import { useEffect } from 'react';
import { useLocalState } from './useLocalState';

/** Applies theme + motion preferences to <html> so CSS tokens can react. */
export function usePrefsEffects() {
  const { prefs } = useLocalState();
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = prefs.theme;
    root.dataset.motion = prefs.motion;
    const light = prefs.theme === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f3f4f1' : '#0a0b0c');
  }, [prefs.theme, prefs.motion]);
}
