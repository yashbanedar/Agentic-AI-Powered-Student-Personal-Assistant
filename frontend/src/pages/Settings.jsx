import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import {
  Settings as SettingsIcon,
  Key,
  Database,
  User,
  CheckCircle2,
  Sparkles,
  Server,
  ShieldCheck
} from "lucide-react";

export default function Settings() {
  const { user, setUser } = useAuth();
  const { triggerRefresh } = useApp();

  const [geminiKey, setGeminiKey] = useState(user?.gemini_api_key || "");
  const [openaiKey, setOpenaiKey] = useState(user?.openai_api_key || "");
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateSettings({
        gemini_api_key: geminiKey,
        openai_api_key: openaiKey,
        full_name: fullName,
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
        <h2 className="text-xl font-bold text-white">System Settings & AI Configuration</h2>
        <p className="text-xs text-slate-400">
          Configure external LLM providers, manage profile settings, and check database status
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            Student Profile Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* AI Model API Keys Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              AI LLM Model Credentials
            </h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Built-in Agent Engine Active
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The platform works 100% out of the box with the built-in intelligent multi-agent engine.
            Optional: Add your Google Gemini or OpenAI key for cloud generative models.
          </p>

          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Google Gemini API Key (Optional)
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
                OpenAI API Key (Optional)
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

        {/* Database & Infrastructure Status */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Database & Multi-Agent Architecture
          </h3>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Database Engine:</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> PostgreSQL & SQLite Fallback
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Document Parser:</span>
              <span className="font-mono text-slate-200">pypdf, python-docx, python-pptx</span>
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
              <CheckCircle2 className="w-4 h-4" /> Settings saved successfully!
            </span>
          ) : (
            <span></span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            {saving ? "Saving Changes..." : "Save Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}