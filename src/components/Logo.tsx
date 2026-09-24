import { Link } from 'react-router-dom';

export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M3 5h7.2L16 20.4 21.8 5H29L19.4 28h-6.8z" fill="var(--accent-ink)" />
      <path d="M13.4 5h5.2L16 12.2z" fill="var(--accent-ink)" opacity="0.45" />
    </svg>
  );
}

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link to="/" className="logo" aria-label="VOLTARA home" onClick={onClick}>
      <LogoMark />
      <span className="logo__word">VOLTARA</span>
    </Link>
  );
}
