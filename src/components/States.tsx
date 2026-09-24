import type { ReactNode } from 'react';
import { LogoMark } from './Logo';

interface StateProps {
  icon?: ReactNode;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ icon, title, body, action }: StateProps) {
  return (
    <div className="state">
      {icon && <div className="state__icon">{icon}</div>}
      <h2 className="state__title">{title}</h2>
      {body && <div className="state__body">{body}</div>}
      {action && <div className="state__actions">{action}</div>}
    </div>
  );
}

export function ErrorState({ icon, title, body, action }: StateProps) {
  return (
    <div className="state state--error" role="alert">
      {icon && <div className="state__icon">{icon}</div>}
      <h2 className="state__title">{title}</h2>
      {body && <div className="state__body">{body}</div>}
      {action && <div className="state__actions">{action}</div>}
    </div>
  );
}

/** Branded loader: VOLTARA / INITIALIZING GAME / progress bar. */
export function LoadingState({ label = 'INITIALIZING' }: { label?: string }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader__brand">
        <LogoMark size={20} />
        <span>VOLTARA</span>
      </div>
      <p className="loader__label mono">{label}</p>
      <div className="loader__bar" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <ul className="game-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <div className="skeleton-card">
            <div className="skeleton skeleton--media" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line short" />
          </div>
        </li>
      ))}
    </ul>
  );
}
