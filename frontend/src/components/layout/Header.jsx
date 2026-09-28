import React from "react";
import { useApp } from "../../context/AppContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSelector from "../common/LanguageSelector";
import { 
  Bot, 
  Sparkles, 
  MessageSquare, 
  ChevronDown, 
  Sun, 
  Moon 
} from "lucide-react";

export default function Header() {
  const { 
    activeTab, 
    setActiveTab, 
    subjects, 
    selectedSubjectId, 
    setSelectedSubjectId,
    showActivityModal,
    setShowActivityModal 
  } = useApp();

  const { theme, toggleTheme, isLight } = useTheme();
  const { t } = useLanguage();

  const title = t(`tabInfo.${activeTab}.title`, "Student Assistant");
  const subtitle = t(`tabInfo.${activeTab}.subtitle`, "Agentic AI learning companion");

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title & Subtitle */}
      <div className="overflow-hidden mr-2">
        <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
          {title}
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-400 hidden md:block truncate">
          {subtitle}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Multi-Language Switcher (EN / हिन्दी / मराठी) */}
        <LanguageSelector compact={true} />

        {/* Live Ecosystem Status Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{t("brand.agentsActive", "10 AI Agents Live")}</span>
        </div>

        {/* Subject Filter Dropdown */}
        {subjects.length > 0 && (
          <div className="relative hidden sm:block">
            <select
              value={selectedSubjectId || ""}
              onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none font-medium cursor-pointer shadow-xs max-w-[140px] truncate"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} {sub.code ? `(${sub.code})` : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* Quick Ask AI Button */}
        <button
          onClick={() => setActiveTab("chat")}
          className="flex items-center gap-1.5 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 text-xs px-2.5 sm:px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer active:scale-95 shadow-xs"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t("header.askTutor", "Ask Tutor")}</span>
        </button>

        {/* Light / Dark Mode Toggle Switcher */}
        <button
          onClick={toggleTheme}
          title={isLight ? "Switch to Dark Theme" : "Switch to Light Theme"}
          className="p-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer active:scale-95 flex items-center justify-center shadow-xs"
          aria-label="Toggle light/dark theme"
        >
          {isLight ? (
            <Moon className="w-4 h-4 text-indigo-600 hover:text-indigo-700 transition" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 transition" />
          )}
        </button>

        {/* AI Activity Stream Toggle */}
        <button
          onClick={() => setShowActivityModal(!showActivityModal)}
          className={`relative p-2 rounded-xl border transition cursor-pointer active:scale-95 shadow-xs ${
            showActivityModal
              ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
          }`}
          title={t("header.activityStream", "Toggle AI Activity Stream")}
          aria-label="Toggle AI Activity Feed"
        >
          <Bot className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
        </button>
      </div>
    </header>
  );
}