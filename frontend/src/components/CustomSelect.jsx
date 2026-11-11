import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchable,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const searchRef = useRef(null);

  // Search box turns on automatically for long lists (e.g. countries)
  const showSearch = searchable ?? options.length > 15;

  const filtered = query
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus the search box when opening; clear it when closing
  useEffect(() => {
    if (open && showSearch) searchRef.current?.focus();
    if (!open) setQuery("");
  }, [open, showSearch]);

  const pick = (val) => {
    onChange(val);
    setOpen(false);
  };

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input-field flex items-center justify-between text-left"
      >
        <span className={selected ? "text-navy-900" : "text-slate-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-card border border-slate-100 z-30 overflow-hidden">
          {showSearch && (
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (filtered[0]) pick(filtered[0].value);
                    }
                    if (e.key === "Escape") setOpen(false);
                  }}
                  placeholder="Search..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-100 pl-9 pr-3 py-2 text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none focus:border-navy-200"
                />
              </div>
            </div>
          )}

          <div className="py-2 max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-2.5 text-sm text-slate-400">No matches</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => pick(opt.value)}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-left hover:bg-navy-50 transition-colors ${value === opt.value ? "text-navy font-semibold" : "text-slate-600"}`}
                >
                  {opt.label}
                  {value === opt.value && (
                    <Check size={14} className="text-navy" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;