import { useState, useRef, useMemo, type KeyboardEvent } from 'react';
import Fuse from 'fuse.js';
import type { Player } from '../types/player';

interface SearchInputProps {
  players: Player[];
  excludedIds: string[];
  onSelect: (player: Player) => void;
  disabled?: boolean;
}

export default function SearchInput({ players, excludedIds, onSelect, disabled = false }: SearchInputProps) {
  const [query, setQuery]       = useState('');
  const [activeIdx, setActiveIdx] = useState(-1);
  const [open, setOpen]           = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const available = useMemo(
    () => players.filter((p) => !excludedIds.includes(p.id)),
    [players, excludedIds]
  );

  const fuse = useMemo(
    () => new Fuse(available, { keys: ['name'], threshold: 0.4 }),
    [available]
  );

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).slice(0, 6).map((r) => r.item);
  }, [query, fuse]);

  function select(player: Player) {
    onSelect(player);
    setQuery('');
    setActiveIdx(-1);
    inputRef.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown')  { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const idx = activeIdx >= 0 ? activeIdx : 0;
      if (suggestions[idx]) select(suggestions[idx]);
    } else if (e.key === 'Escape') { setQuery(''); }
  }

  const showDropdown = open && suggestions.length > 0;

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div
        className={`flex items-center bg-game-card border rounded-card transition-colors ${
          open && !disabled ? 'border-game-correct' : 'border-game-border'
        } ${disabled ? 'opacity-40' : ''}`}
      >
        <span className="pl-4 text-game-muted text-base">🔍</span>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="suggestions"
          aria-label="Rechercher un joueur"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIdx(-1); }}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          disabled={disabled}
          placeholder={disabled ? 'Partie terminée' : 'Rechercher un joueur…'}
          className="flex-1 bg-transparent px-3 py-3 text-game-text placeholder-game-muted text-sm font-medium focus:outline-none disabled:cursor-not-allowed"
        />
        {query && !disabled && (
          <button
            onClick={() => setQuery('')}
            aria-label="Effacer"
            className="pr-4 text-game-muted hover:text-game-text text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {showDropdown && (
        <ul
          id="suggestions"
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-game-card border border-game-border rounded-card overflow-hidden shadow-lg"
        >
          {suggestions.map((p, idx) => (
            <li
              key={p.id}
              role="option"
              aria-selected={idx === activeIdx}
              onMouseDown={() => select(p)}
              onMouseEnter={() => setActiveIdx(idx)}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                idx === activeIdx ? 'bg-game-border' : 'hover:bg-game-border'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-game-incorrect shrink-0 flex items-center justify-center text-xs font-bold text-game-muted">
                {p.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-game-text truncate">{p.name}</p>
                <p className="text-xs text-game-muted">{p.country}</p>
              </div>
              <span className="font-mono text-xs text-game-muted shrink-0">{p.countryCode}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
