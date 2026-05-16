import { useState, useRef, useEffect, useCallback } from 'react';
import type { Player } from '../types/player.ts';
import { FLAG_URL } from './AttributeCell.tsx';

interface SearchInputProps {
  players: Player[];
  excluded: Set<string>;
  onSelect: (player: Player) => void;
  disabled?: boolean;
}

function fuzzyMatch(query: string, name: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const n = name.toLowerCase();
  if (n.includes(q)) return true;
  // Check if all query chars appear in order
  let qi = 0;
  for (const c of n) {
    if (c === q[qi]) qi++;
    if (qi === q.length) return true;
  }
  return false;
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function colorFromName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return `hsl(${h % 360}, 50%, 40%)`;
}

export function SearchInput({ players, excluded, onSelect, disabled }: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const suggestions = players
    .filter(p => !excluded.has(p.id) && fuzzyMatch(query, p.name))
    .slice(0, 6);

  useEffect(() => { setHighlighted(0); }, [query]);

  const confirm = useCallback((player: Player) => {
    onSelect(player);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }, [onSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => (h + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      confirm(suggestions[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <input
        ref={inputRef}
        type="text"
        value={query}
        disabled={disabled}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? 'Partie terminée !' : 'Rechercher un joueur…'}
        className="w-full bg-game-card border border-game-border rounded-card px-4 py-3 text-game-text placeholder-game-muted focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
        aria-label="Rechercher un joueur"
        aria-autocomplete="list"
        aria-expanded={open && suggestions.length > 0}
      />
      {open && suggestions.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-game-card border border-game-border rounded-card shadow-xl overflow-hidden"
        >
          {suggestions.map((p, i) => (
            <li
              key={p.id}
              role="option"
              aria-selected={i === highlighted}
              onMouseDown={() => confirm(p)}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                i === highlighted ? 'bg-blue-600/30' : 'hover:bg-game-border/50'
              }`}
            >
              <span className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold"
                style={{ background: p.imageUrl ? 'transparent' : colorFromName(p.name) }}>
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  : getInitials(p.name)
                }
              </span>
              <span className="flex-1 text-game-text text-sm font-medium">{p.name}</span>
              <img
                src={FLAG_URL(p.countryCode)}
                alt={p.country}
                className="w-5 h-4 object-cover rounded-sm"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
