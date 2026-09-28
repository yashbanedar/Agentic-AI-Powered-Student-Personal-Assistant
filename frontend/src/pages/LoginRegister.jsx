import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "../components/common/LanguageSelector";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Bot,
  BrainCircuit,
  Lock,
  Mail,
  User,
  Sun,
  Moon,
  Layers
} from "lucide-react";

export default function LoginRegister() {
  const { login, register, loginDemo } = useAuth();
  const { isLight, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password, fullName);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginDemo();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-200">
      {/* Top Bar Language Selector & Theme Toggle */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 flex items-center gap-2">
        <LanguageSelector compact={true} />
        <button
          onClick={toggleTheme}
          title={isLight ? "Switch to Dark Theme" : "Switch to Light Theme"}
          className="p-2 sm:p-2.5 rounded-xl border border-slate-700 bg-slate-900/80 backdrop-blur-md text-slate-300 hover:text-white shadow-md transition cursor-pointer active:scale-95"
          aria-label="Toggle theme"
        >
          {isLight ? (
            <Moon className="w-4 h-4 text-indigo-600" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>
      </div>

      {/* Ambient Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-500/30 text-white">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {t("brand.name", "Student AI")} <span className="text-indigo-400 font-medium">Assistant</span>
          </h1>

          {/* Universal Spectrum Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[11px] font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Std 1st to Ph.D. • MPSC • UPSC • JEE • NEET</span>
          </div>

          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {t("auth.featuresSubtitle", "10 Specialized AI Agents coordinating exams, syllabi, PYQs & notes")}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                !isRegister ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              {t("auth.signIn", "Sign In")}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                isRegister ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              {t("auth.register", "Create Account")}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t("auth.fullNameLabel", "Full Name")}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Student"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t("auth.emailLabel", "Email Address")}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t("auth.passwordLabel", "Password")}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>{t("common.loading", "Loading...")}</span>
              ) : (
                <>
                  <span>{isRegister ? t("auth.registerBtn", "Create Free Account") : t("auth.signInBtn", "Sign In to Workspace")}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-2">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase tracking-widest">
                Quick Access
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t("auth.demoBtn", "Instant One-Click Demo Login")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}