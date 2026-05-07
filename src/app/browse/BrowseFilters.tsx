"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, FormEvent, ReactNode } from "react";

type CategoryValue = "" | "graduate" | "internship";
type SortValue = "soon" | "new" | "latest";

const CATEGORY_OPTIONS: { value: CategoryValue; label: string }[] = [
  { value: "", label: "all" },
  { value: "graduate", label: "graduate" },
  { value: "internship", label: "internship" },
];

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "soon", label: "closing soon" },
  { value: "new", label: "newly posted" },
  { value: "latest", label: "latest sourced" },
];

export default function BrowseFilters({
  category,
  company,
  sort,
}: {
  category: "graduate" | "internship" | undefined;
  company: string;
  sort: SortValue;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [companyInput, setCompanyInput] = useState(company);

  useEffect(() => {
    setCompanyInput(company);
  }, [company]);

  function applyParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value && value.length > 0) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    const query = params.toString();
    router.push(query ? `/browse?${query}` : "/browse");
  }

  function setCategory(next: CategoryValue) {
    applyParams({ category: next || undefined });
  }

  function setSort(next: SortValue) {
    applyParams({ sort: next === "soon" ? undefined : next });
  }

  function handleCompanySubmit(e: FormEvent) {
    e.preventDefault();
    applyParams({ company: companyInput.trim() || undefined });
  }

  const categoryLabel =
    CATEGORY_OPTIONS.find((o) => o.value === (category ?? ""))?.label ?? "all";
  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "closing soon";

  return (
    <div
      className="mb-6 sm:mb-8 px-4 sm:px-5 py-3 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3"
      style={{
        background: "var(--bg-elev)",
        border: "0.5px solid var(--border)",
      }}
    >
      {/* Search — dominant, takes remaining space */}
      <form
        onSubmit={handleCompanySubmit}
        className="flex items-center gap-2 sm:flex-1 sm:min-w-0 sm:order-1 order-2"
      >
        <span
          className="mono text-sm shrink-0"
          style={{ color: "var(--accent)" }}
        >
          $
        </span>
        <input
          type="text"
          value={companyInput}
          onChange={(e) => setCompanyInput(e.target.value)}
          placeholder="search company (e.g. tiktok, ey, google)..."
          className="mono text-sm flex-1 min-w-0 bg-transparent outline-none"
          style={{ color: "var(--text)" }}
        />
        {companyInput && (
          <button
            type="button"
            onClick={() => {
              setCompanyInput("");
              applyParams({ company: undefined });
            }}
            className="mono text-xs px-2 py-1 rounded transition-opacity hover:opacity-60 shrink-0"
            style={{ color: "var(--text-dim)" }}
            aria-label="Clear company filter"
          >
            ✕
          </button>
        )}
      </form>

      {/* Right-side compact dropdowns */}
      <div className="flex items-center gap-2 sm:order-2 order-1 shrink-0">
        <Dropdown
          label={categoryLabel}
          options={CATEGORY_OPTIONS}
          selected={category ?? ""}
          onSelect={(v) => setCategory(v as CategoryValue)}
        />
        <Dropdown
          label={sortLabel}
          options={SORT_OPTIONS}
          selected={sort}
          onSelect={(v) => setSort(v as SortValue)}
        />
      </div>
    </div>
  );
}

// ---------- Dropdown ----------

interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

function Dropdown<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: ReactNode;
  options: DropdownOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function onClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mono text-xs uppercase tracking-wider px-3 py-1.5 rounded transition-colors flex items-center gap-2 whitespace-nowrap"
        style={{
          background: "transparent",
          color: "var(--text-dim)",
          border: "0.5px solid var(--border)",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{label}</span>
        <span style={{ color: "var(--text-muted)" }}>{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1 z-20 min-w-[10rem] rounded-lg overflow-hidden"
          style={{
            background: "var(--bg-elev)",
            border: "0.5px solid var(--border-strong)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {options.map((opt) => {
            const active = opt.value === selected;
            return (
              <li key={opt.value || "all"} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(opt.value);
                    setOpen(false);
                  }}
                  className="mono text-xs uppercase tracking-wider w-full text-left px-3 py-2 transition-colors flex items-center justify-between gap-3"
                  style={{
                    background: active ? "var(--accent-bg)" : "transparent",
                    color: active ? "var(--accent)" : "var(--text-dim)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active)
                      e.currentTarget.style.background = "var(--bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span>{opt.label}</span>
                  {active && <span>✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
