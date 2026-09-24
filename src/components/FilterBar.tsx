import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { categories } from '../data/categories';
import { CONTROL_LABEL, DIFFICULTY_LABEL, DURATION_LABEL, ORIENTATION_LABEL } from '../lib/format';
import { SORT_OPTIONS, activeFilterCount, defaultFilters, type Filters, type SortKey } from '../lib/filters';

interface Props {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  showCategories: boolean;
  count: number;
}

function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <label className="select">
      <span className="select__label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" className={`chip chip--toggle${checked ? ' is-on' : ''}`} aria-pressed={checked} onClick={() => onChange(!checked)}>
      {label}
    </button>
  );
}

export function FilterBar({ filters, onChange, showCategories, count }: Props) {
  const [open, setOpen] = useState(false);
  const active = activeFilterCount(filters);

  return (
    <div className="filters">
      {showCategories && (
        <div className="filters__cats" role="group" aria-label="Category">
          {[{ id: 'all', name: 'All' }, ...categories].map((c) => (
            <button
              key={c.id}
              type="button"
              className={`chip chip--cat${filters.category === c.id ? ' is-on' : ''}`}
              aria-pressed={filters.category === c.id}
              onClick={() => onChange({ category: c.id as Filters['category'] })}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="filters__bar">
        <p className="filters__count" aria-live="polite">
          Showing <strong>{count}</strong> {count === 1 ? 'game' : 'games'}
        </p>
        <div className="filters__right">
          <button type="button" className={`btn btn--sm${open || active ? ' is-on' : ''}`} aria-expanded={open} aria-controls="filter-panel" onClick={() => setOpen((v) => !v)}>
            <SlidersHorizontal size={14} aria-hidden="true" /> Filters{active > 0 && <span className="badge">{active}</span>}
          </button>
          <Select<SortKey> label="Sort" value={filters.sort} options={SORT_OPTIONS.map((o) => [o.id, o.label])} onChange={(sort) => onChange({ sort })} />
        </div>
      </div>

      {open && (
        <div id="filter-panel" className="filters__panel">
          <Select label="Difficulty" value={filters.difficulty} options={[['any', 'Any'], ...(Object.entries(DIFFICULTY_LABEL) as [Filters['difficulty'], string][])]} onChange={(difficulty) => onChange({ difficulty })} />
          <Select label="Controls" value={filters.controls} options={[['any', 'Any'], ...(Object.entries(CONTROL_LABEL) as [Filters['controls'], string][])]} onChange={(controls) => onChange({ controls })} />
          <Select label="Orientation" value={filters.orientation} options={[['any', 'Any'], ['landscape', ORIENTATION_LABEL.landscape], ['portrait', ORIENTATION_LABEL.portrait]]} onChange={(orientation) => onChange({ orientation })} />
          <Select label="Play duration" value={filters.duration} options={[['any', 'Any'], ...(Object.entries(DURATION_LABEL) as [Filters['duration'], string][])]} onChange={(duration) => onChange({ duration })} />
          <div className="filters__toggles">
            <Toggle label="Playable now" checked={filters.playable} onChange={(playable) => onChange({ playable })} />
            <Toggle label="New" checked={filters.isNew} onChange={(isNew) => onChange({ isNew })} />
            <Toggle label="Favorites" checked={filters.favorites} onChange={(favorites) => onChange({ favorites })} />
            <Toggle label="Multiplayer" checked={filters.multiplayer} onChange={(multiplayer) => onChange({ multiplayer })} />
          </div>
          {active > 0 && (
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              onClick={() =>
                onChange({
                  difficulty: defaultFilters.difficulty,
                  controls: defaultFilters.controls,
                  orientation: defaultFilters.orientation,
                  duration: defaultFilters.duration,
                  playable: false,
                  isNew: false,
                  favorites: false,
                  multiplayer: false,
                })
              }
            >
              <X size={14} aria-hidden="true" /> Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
