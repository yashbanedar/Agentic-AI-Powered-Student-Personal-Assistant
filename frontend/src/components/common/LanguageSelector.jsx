import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { Globe, ChevronDown, Check } from "lucide-react";

export default function LanguageSelector({ compact = false, className = "" }) {
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {compact ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition cursor-pointer text-xs font-semibold shadow-xs active:scale-95"
          title="Change Language / भाषा बदला"
          aria-expanded={isOpen}
        >
          <span className="text-sm">{currentLang.flag}</span>
          <span className="uppercase text-[11px] font-bold tracking-wider">{currentLang.code}</span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-200 transition cursor-pointer text-xs font-semibold shadow-sm active:scale-95"
          title="Select Language"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span>{currentLang.flag} {currentLang.nativeName}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl backdrop-blur-xl z-50 py-1.5 ring-1 ring-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Select Language / भाषा
          </div>
          {languages.map((l) => {
            const isSelected = l.code === language;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLanguage(l.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs text-left transition cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600/15 text-indigo-300 font-bold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/70 font-medium"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{l.flag}</span>
                  <div>
                    <div className="font-semibold text-xs leading-tight">{l.nativeName}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{l.label}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
