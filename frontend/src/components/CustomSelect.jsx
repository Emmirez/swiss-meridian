import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

const CustomSelect = ({ value, onChange, options, placeholder = "Select..." }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-card border border-slate-100 py-2 z-30 max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-left hover:bg-navy-50 transition-colors ${value === opt.value ? "text-navy font-semibold" : "text-slate-600"}`}
            >
              {opt.label}
              {value === opt.value && <Check size={14} className="text-navy" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;