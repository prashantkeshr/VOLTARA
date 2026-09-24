/** Build-time site configuration. Everything is optional — the app works without it. */
export const site = {
  name: 'VOLTARA',
  tagline: 'ENTER THE GAME.',
  description: 'Instant-play browser games. No account. No waiting. Just play.',
  /** Absolute origin used for canonical and Open Graph URLs, e.g. https://voltara.gg */
  url: (import.meta.env.VITE_SITE_URL ?? '').replace(/\/$/, ''),
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL ?? '',
};
