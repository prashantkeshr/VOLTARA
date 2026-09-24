import { idb, STORES } from '../lib/idb';

export const REPORT_REASONS = [
  { id: 'not-loading', label: "Game doesn't load" },
  { id: 'controls', label: "Controls don't work" },
  { id: 'broken', label: 'Broken content' },
  { id: 'info', label: 'Incorrect information' },
  { id: 'performance', label: 'Performance problem' },
  { id: 'other', label: 'Other' },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]['id'];

export interface GameReport {
  id: string;
  slug: string;
  reason: ReportReason;
  notes: string;
  createdAt: number;
  userAgent: string;
  viewport: string;
  /** true when successfully delivered to the configured endpoint. */
  sent: boolean;
}

const endpoint = import.meta.env.VITE_REPORT_ENDPOINT;

export const reportEndpointConfigured = Boolean(endpoint);

/**
 * Stores the report locally (IndexedDB) and, if a report endpoint is configured
 * at build time, also POSTs it there. Returns the saved report.
 */
export async function submitReport(slug: string, reason: ReportReason, notes: string): Promise<GameReport> {
  const report: GameReport = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    slug,
    reason,
    notes: notes.trim().slice(0, 2000),
    createdAt: Date.now(),
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    sent: false,
  };

  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
      report.sent = res.ok;
    } catch {
      report.sent = false;
    }
  }

  try {
    await idb.put(STORES.reports, report);
  } catch {
    /* IndexedDB unavailable — report still returned so it can be copied */
  }
  return report;
}

export function listReports(): Promise<GameReport[]> {
  return idb.all<GameReport>(STORES.reports).then((r) => r.sort((a, b) => b.createdAt - a.createdAt)).catch(() => []);
}

export function clearReports(): Promise<unknown> {
  return idb.clear(STORES.reports).catch(() => undefined);
}

export function formatReport(r: GameReport): string {
  const reason = REPORT_REASONS.find((x) => x.id === r.reason)?.label ?? r.reason;
  return [
    `VOLTARA problem report`,
    `Game: ${r.slug}`,
    `Issue: ${reason}`,
    r.notes ? `Notes: ${r.notes}` : '',
    `When: ${new Date(r.createdAt).toISOString()}`,
    `Viewport: ${r.viewport}`,
    `Browser: ${r.userAgent}`,
  ]
    .filter(Boolean)
    .join('\n');
}
