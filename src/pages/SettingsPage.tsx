import { Download, Monitor, Moon, ShieldCheck, Trash2 } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useToast } from '../components/Toast';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useLocalState } from '../hooks/useLocalState';
import { fullscreenSupported } from '../hooks/useFullscreen';
import { idb } from '../lib/idb';
import { store, type Prefs } from '../lib/storage';
import { clearReports, listReports, type GameReport } from '../services/reports';

function Row({ title, desc, children }: { title: string; desc?: ReactNode; children: ReactNode }) {
  return (
    <div className="setting">
      <div className="setting__text">
        <p className="setting__title">{title}</p>
        {desc && <p className="setting__desc">{desc}</p>}
      </div>
      <div className="setting__control">{children}</div>
    </div>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`switch${checked ? ' is-on' : ''}`} onClick={() => onChange(!checked)}>
      <span className="switch__thumb" />
      <span className="switch__text mono">{checked ? 'ON' : 'OFF'}</span>
    </button>
  );
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string; icon?: ReactNode }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className={value === o.id ? 'is-on' : ''} onClick={() => onChange(o.id)}>
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  useDocumentMeta({ title: 'Settings — VOLTARA', description: 'Appearance, motion, gameplay and privacy settings.', path: '/settings' });
  const { prefs, favorites, history } = useLocalState();
  const toast = useToast();
  const [reports, setReports] = useState<GameReport[]>([]);
  const set = (p: Partial<Prefs>) => store.setPrefs(p);

  useEffect(() => {
    listReports().then(setReports);
  }, []);

  const confirmThen = (msg: string, fn: () => void | Promise<unknown>, done: string) => async () => {
    if (!window.confirm(msg)) return;
    await fn();
    toast(done);
  };

  const exportReports = () => {
    const blob = new Blob([JSON.stringify(reports, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `voltara-reports-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="page page--narrow">
      <header className="page__head">
        <p className="eyebrow">Preferences</p>
        <h1 className="page__title">SETTINGS</h1>
      </header>

      <section className="settings-group" aria-labelledby="s-appearance">
        <h2 id="s-appearance" className="settings-group__title">Appearance</h2>
        <Row title="Theme" desc="System follows your device's light or dark setting.">
          <Segmented
            label="Theme"
            value={prefs.theme}
            onChange={(theme) => set({ theme })}
            options={[
              { id: 'dark', label: 'Dark', icon: <Moon size={14} aria-hidden="true" /> },
              { id: 'system', label: 'System', icon: <Monitor size={14} aria-hidden="true" /> },
            ]}
          />
        </Row>
        <Row title="Motion" desc="Reduced removes interface animation and asks games to limit effects.">
          <Segmented
            label="Motion"
            value={prefs.motion}
            onChange={(motion) => set({ motion })}
            options={[
              { id: 'full', label: 'Full' },
              { id: 'reduced', label: 'Reduced' },
            ]}
          />
        </Row>
      </section>

      <section className="settings-group" aria-labelledby="s-gameplay">
        <h2 id="s-gameplay" className="settings-group__title">Gameplay</h2>
        <Row title="Start games automatically" desc="Off shows a PLAY NOW screen before a game loads.">
          <Switch label="Start games automatically" checked={prefs.autoStart} onChange={(autoStart) => set({ autoStart })} />
        </Row>
        <Row title="Auto Focus" desc="Enter Focus Mode as soon as a game is ready.">
          <Switch label="Auto Focus" checked={prefs.autoFocus} onChange={(autoFocus) => set({ autoFocus })} />
        </Row>
        <Row
          title="Remember fullscreen preference"
          desc={fullscreenSupported() ? 'Browsers require a click to enter fullscreen, so VOLTARA offers a one-tap resume.' : "This browser doesn't support the Fullscreen API. Focus Mode works everywhere."}
        >
          <Switch label="Remember fullscreen preference" checked={prefs.rememberFullscreen} onChange={(rememberFullscreen) => set({ rememberFullscreen, lastFullscreen: false })} />
        </Row>
        <Row title="Game sound" desc="Applies to VOLTARA Originals.">
          <Switch label="Game sound" checked={prefs.sound} onChange={(sound) => set({ sound })} />
        </Row>
        <Row title="Save search history" desc="Recent searches are kept in this browser only.">
          <Switch label="Save search history" checked={prefs.saveSearchHistory} onChange={(saveSearchHistory) => set({ saveSearchHistory })} />
        </Row>
      </section>

      <section className="settings-group" aria-labelledby="s-privacy">
        <h2 id="s-privacy" className="settings-group__title">Privacy</h2>
        <p className="privacy-note">
          <ShieldCheck size={18} aria-hidden="true" />
          <span>VOLTARA does not require an account. Favorites and game history are stored locally in this browser. Nothing is sent to a server.</span>
        </p>
        <Row title="Favorites" desc={`${favorites.length} saved`}>
          <button type="button" className="btn btn--sm" disabled={!favorites.length} onClick={confirmThen('Clear all favorites?', store.clearFavorites, 'Favorites cleared')}>
            Clear Favorites
          </button>
        </Row>
        <Row title="History" desc={`${Object.keys(history).length} games in history, plus recent searches`}>
          <button type="button" className="btn btn--sm" disabled={!Object.keys(history).length} onClick={confirmThen('Clear play and search history?', store.clearHistory, 'History cleared')}>
            Clear History
          </button>
        </Row>
        <Row title="Problem reports" desc={`${reports.length} stored on this device`}>
          <div className="btn-row">
            <button type="button" className="btn btn--sm" disabled={!reports.length} onClick={exportReports}>
              <Download size={14} aria-hidden="true" /> Export
            </button>
            <button
              type="button"
              className="btn btn--sm"
              disabled={!reports.length}
              onClick={confirmThen('Delete stored problem reports?', async () => {
                await clearReports();
                setReports([]);
              }, 'Reports deleted')}
            >
              Delete
            </button>
          </div>
        </Row>
        <Row title="Clear All Local Data" desc="Favorites, history, preferences, reports and offline cache.">
          <button
            type="button"
            className="btn btn--sm btn--danger"
            onClick={confirmThen(
              'Remove ALL VOLTARA data from this browser? This cannot be undone.',
              async () => {
                store.clearAll();
                await idb.destroy();
                setReports([]);
                if ('caches' in window) {
                  const keys = await caches.keys();
                  await Promise.all(keys.filter((k) => k.startsWith('voltara')).map((k) => caches.delete(k)));
                }
              },
              'All local data cleared',
            )}
          >
            <Trash2 size={14} aria-hidden="true" /> Clear All
          </button>
        </Row>
      </section>
    </div>
  );
}
