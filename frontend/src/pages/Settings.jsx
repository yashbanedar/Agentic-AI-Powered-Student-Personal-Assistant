import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import {
  Settings as SettingsIcon,
  Key,
  Database,
  User,
  CheckCircle2,
  Sparkles,
  Server,
  ShieldCheck,
  Globe,
  GraduationCap,
  Zap
} from "lucide-react";

export default function Settings() {
  const { user, setUser } = useAuth();
  const { triggerRefresh } = useApp();
  const { 
    language, 
    setLanguage, 
    languages, 
    t 
  } = useLanguage();

  const [geminiKey, setGeminiKey] = useState(user?.gemini_api_key || "");
  const [openaiKey, setOpenaiKey] = useState(user?.openai_api_key || "");
  const [fullName, setFullName] = useState(user?.full_name || "");
  
  // Language states
  const [selectedLang, setSelectedLang] = useState(language);
  const [aiLang, setAiLang] = useState(user?.preferences?.ai_language || language);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update frontend LanguageContext
      setLanguage(selectedLang);

      // 2. Persist in Backend
      const updated = await api.updateSettings({
        gemini_api_key: geminiKey,
        openai_api_key: openaiKey,
        full_name: fullName,
        preferences: {
          ...(user?.preferences || {}),
          language: selectedLang,
          ai_language: aiLang
        }
      });
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      triggerRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          {t("settings.title", "System Settings & Preferences")}
        </h2>
        <p className="text-xs text-slate-400">
          {t("settings.subtitle", "Configure language, AI keys, and view system status")}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* =====================================================================
            1. Language & Localization Card
           ===================================================================== */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              {t("settings.languageSection", "Language & Localization")}
            </h3>
            <span className="text-[10px] bg-indigo-500/15 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
              Hindi • Marathi • English
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {t("settings.preferredLanguage", "Interface Language")}
              </label>
              <select
                value={selectedLang}
                onChange={(e) => {
                  setSelectedLang(e.target.value);
                  setLanguage(e.target.value);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-medium"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.nativeName} ({l.label})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {t("settings.aiLanguage", "AI Tutor Response Language")}
              </label>
              <select
                value={aiLang}
                onChange={(e) => setAiLang(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-medium"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.nativeName} ({l.label})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                {t("settings.aiLanguageHint", "Select the language the AI Tutor uses when answering your questions")}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================================
            2. Student Profile Information (Read-only Academic Track)
           ===================================================================== */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            {t("settings.profileSection", "Student Profile Information")}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t("settings.fullName", "Full Name")}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t("settings.email", "Email Address")}
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {user?.preferences?.program_or_major && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Enrolled Program & Goal:</span>
              <span className="font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                {user.preferences.program_or_major}
              </span>
            </div>
          )}
        </div>

        {/* =====================================================================
            3. AI Model API Keys Card
           ===================================================================== */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              {t("settings.aiCredentials", "AI LLM Model Credentials")}
            </h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {t("settings.builtInActive", "Built-in Multi-Agent Engine Active")}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The platform works 100% out of the box with the built-in intelligent multi-agent engine.
            Optional: Add your Google Gemini or OpenAI key for cloud generative models.
          </p>

          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t("settings.geminiKey", "Google Gemini API Key (Optional)")}
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t("settings.openaiKey", "OpenAI API Key (Optional)")}
              </label>
              <input
                type="password"
                placeholder="sk-proj-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* =====================================================================
            4. Ultra-Fast Engine & Architecture Status
           ===================================================================== */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              {t("settings.fastLoadBadge", "Instant Cached UI & Fast Async Engine")}
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              ⚡ Ultra-Fast Load
            </span>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Localization Latency:</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 0ms (In-Memory React Client Cache)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Database Engine:</span>
              <span className="font-mono text-slate-200">PostgreSQL & SQLite Fallback</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">RAG Vector Retrieval:</span>
              <span className="font-mono text-slate-200">Semantic TF-IDF & Cosine Similarity</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Security:</span>
              <span className="font-mono text-slate-200">PBKDF2 Salt Hashing + JWT HS256</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4" /> {t("settings.savedSuccess", "Settings saved successfully!")}
            </span>
          ) : (
            <span></span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            {saving ? t("settings.saving", "Saving Changes...") : t("settings.saveBtn", "Save Settings")}
          </button>
        </div>
      </form>
    </div>
  );
}