import { Link } from 'react-router-dom';
import { LogoMark } from './Logo';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="logo">
            <LogoMark />
            <span className="logo__word">VOLTARA</span>
          </div>
          <p>Browser gaming platform.</p>
        </div>
        <nav className="footer__links" aria-label="Footer">
          <Link to="/discover">Games</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <p className="footer__copy mono">© {new Date().getFullYear()} VOLTARA · ENTER THE GAME.</p>
      </div>
    </footer>
  );
}
