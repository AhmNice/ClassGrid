// components/form/SearchableSelect.tsx
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

interface Option {
  value: string;
  label: string;
  /** Extra text matched against the query, e.g. a staff code. */
  hint?: string;
}

interface SearchableSelectProps {
  label: string;
  placeholder?: string;
  searchPlaceholder?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  /** Optional message when there are no options at all. */
  emptyMessage?: string;
}

const SearchableSelect = ({
  label,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  options,
  value,
  onChange,
  emptyMessage = "No matches.",
}: SearchableSelectProps) => {
  const uid = useId();
  const labelId = `${uid}-label`;
  const listboxId = `${uid}-listbox`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const hay = `${o.label} ${o.hint ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [options, query]);

  // Close on outside click / Escape at the root.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onDocKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onDocKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onDocKey);
    };
  }, [open]);

  // When opening, focus the search input and reset the query.
  useEffect(() => {
    if (open) {
      queueMicrotask(() => setQuery(""));
     queueMicrotask(() => setActiveIdx(0));
      // small delay so the input is mounted
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const openList = () => setOpen(true);

  const choose = (opt: Option) => {
    onChange(opt.value);
    setOpen(false);
  };

  const clear = () => {
    onChange("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[activeIdx];
      if (opt) choose(opt);
    }
  };

  return (
    <div ref={rootRef} className="relative flex flex-col gap-1">
      <span
        id={labelId}
        className="text-[11px] font-medium text-on-surface-variant"
      >
        {label}
      </span>

      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        onClick={() => (open ? setOpen(false) : openList())}
        className="flex h-8 w-full cursor-pointer items-center justify-between gap-2 rounded border border-outline-variant/40 bg-surface-container px-2 text-left text-xs text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className={selected ? "truncate" : "truncate text-on-surface-variant"}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="flex items-center gap-1">
          {selected && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear selection"
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  clear();
                }
              }}
              className="grid h-4 w-4 place-items-center rounded hover:bg-surface-container-high"
            >
              <X size={12} aria-hidden="true" />
            </span>
          )}
          <ChevronDown size={14} aria-hidden="true" />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded border border-outline-variant/40 bg-surface shadow-lg">
          {/* Search input */}
          <div className="relative border-b border-outline-variant/40 p-1.5">
            <Search
              size={12}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIdx(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              aria-controls={listboxId}
              aria-autocomplete="list"
              className="w-full rounded bg-surface-container py-1.5 pl-7 pr-2 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Options */}
          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            className="max-h-56 overflow-auto"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-on-surface-variant">
                {options.length === 0 ? emptyMessage : "No matches."}
              </li>
            ) : (
              filtered.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isActive = idx === activeIdx;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => choose(opt)}
                    className={[
                      "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5 text-xs",
                      isActive ? "bg-surface-container-high" : "",
                      isSelected ? "font-medium text-primary" : "text-on-surface",
                    ].join(" ")}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <span aria-hidden="true">✓</span>}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;