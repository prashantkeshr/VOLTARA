import { Check, Copy, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { REPORT_REASONS, formatReport, reportEndpointConfigured, submitReport, type GameReport, type ReportReason } from '../services/reports';
import type { Game } from '../types/game';

interface Props {
  game: Game;
  open: boolean;
  onClose: () => void;
}

/** Native <dialog> for focus trapping and Escape handling. */
export function ReportDialog({ game, open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState<ReportReason>('not-loading');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<GameReport | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setDone(null);
      setNotes('');
      setCopied(false);
      d.showModal();
    } else if (!open && d.open) d.close();
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setDone(await submitReport(game.slug, reason, notes));
    setBusy(false);
  };

  const copy = async () => {
    if (!done) return;
    try {
      await navigator.clipboard.writeText(formatReport(done));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <dialog ref={ref} className="dialog" onClose={onClose} aria-labelledby="report-title" onClick={(e) => e.target === ref.current && onClose()}>
      <div className="dialog__inner">
        <header className="dialog__head">
          <div>
            <p className="eyebrow">Report problem</p>
            <h2 id="report-title">{game.title}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        {done ? (
          <div className="dialog__body">
            <p className="dialog__ok">
              <Check size={18} aria-hidden="true" /> {done.sent ? 'Report sent. Thank you.' : 'Report saved on this device.'}
            </p>
            {!done.sent && (
              <p className="muted">
                {reportEndpointConfigured
                  ? 'The report service could not be reached, so it was stored locally.'
                  : 'VOLTARA has no server — reports are stored in this browser. Copy the report to share it with the site operator.'}
              </p>
            )}
            <div className="dialog__actions">
              <button type="button" className="btn" onClick={copy}>
                {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />} {copied ? 'Copied' : 'Copy report'}
              </button>
              <button type="button" className="btn btn--primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form className="dialog__body" onSubmit={submit}>
            <fieldset className="radio-list">
              <legend className="visually-hidden">What went wrong?</legend>
              {REPORT_REASONS.map((r) => (
                <label key={r.id} className={`radio${reason === r.id ? ' is-checked' : ''}`}>
                  <input type="radio" name="reason" value={r.id} checked={reason === r.id} onChange={() => setReason(r.id)} />
                  <span>{r.label}</span>
                </label>
              ))}
            </fieldset>
            <label className="field">
              <span className="field__label">Details (optional)</span>
              <textarea rows={3} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What happened? Which device or browser?" />
            </label>
            <div className="dialog__actions">
              <button type="button" className="btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={busy}>
                {busy ? 'Saving…' : 'Submit report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
