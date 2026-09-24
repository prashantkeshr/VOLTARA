/**
 * Advertising configuration. VOLTARA ships network-agnostic: <AdSlot /> reserves
 * space and renders a neutral placeholder until a compliant provider is wired
 * in via `renderProvider` below.
 *
 *   placeholder – reserved, clearly-labelled empty slots (default)
 *   off         – no ad slots rendered at all
 *   provider    – call renderProvider() for each slot
 */
export type AdMode = 'placeholder' | 'off' | 'provider';

export const adMode: AdMode = import.meta.env.VITE_ADS_MODE ?? 'placeholder';

export type AdSize = 'rail' | 'leaderboard' | 'rectangle' | 'mobile';

export const AD_DIMENSIONS: Record<AdSize, { w: number; h: number }> = {
  rail: { w: 160, h: 600 },
  leaderboard: { w: 728, h: 90 },
  rectangle: { w: 300, h: 250 },
  mobile: { w: 320, h: 100 },
};

/**
 * Hook for a real ad network. Receive the slot element once it is visible and
 * mount the provider's tag inside it. Must respect the provider's policies:
 * no overlap with game controls, no deceptive styling.
 */
export function renderProvider(_el: HTMLElement, _slot: { id: string; size: AdSize }): void {
  /* intentionally empty until a provider is configured */
}
