import React from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  FolderKanban,
  UploadCloud,
  BookOpen,
  CalendarDays,
  Route,
  FileEdit,
  HelpCircle,
  Sparkles,
  BarChart3,
  Lightbulb,
  MessageSquare,
  Settings as SettingsIcon,
  LogOut,
  GraduationCap,
  Bot
} from "lucide-react";

export default function Sidebar() {
  const { activeTab, setActiveTab } = useApp();
  const { user, logout } = useAuth();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "subjects", label: "Subjects", icon: FolderKanban },
    { id: "materials", label: "Study Materials", icon: UploadCloud },
    { id: "syllabus", label: "Syllabus", icon: BookOpen },
    { id: "exams", label: "Exam Timetable", icon: CalendarDays },
    { id: "roadmap", label: "Study Roadmap", icon: Route },
    { id: "notes", label: "AI Notes", icon: FileEdit },
    { id: "pyq", label: "PYQ Analysis", icon: HelpCircle },
    { id: "quizzes", label: "Quiz & Tests", icon: Sparkles },
    { id: "analytics", label: "Performance Analytics", icon: BarChart3 },
    { id: "recommendations", label: "AI Recommendations", icon: Lightbulb },
    { id: "chat", label: "AI Chat Assistant", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
            Student AI <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">Agentic</span>
          </h1>
          <p className="text-[11px] text-slate-400">Personal Assistant</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Core Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Multi-Agent System Status */}
      <div className="px-4 py-3 mx-3 mb-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-semibold text-slate-300">10 Agents Active</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Orchestrator monitoring deadlines, PYQs & performance
        </p>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-300 shrink-0">
            {user?.full_name ? user.full_name[0].toUpperCase() : "S"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.full_name || "Student"}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}