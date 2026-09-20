import React from "react";
import { useApp } from "../../context/AppContext";
import { useTheme } from "../../context/ThemeContext";
import { 
  Bot, 
  Sparkles, 
  MessageSquare, 
  ChevronDown, 
  Bell, 
  BookOpen,
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
    selectedSubject,
    showActivityModal,
    setShowActivityModal 
  } = useApp();

  const { theme, toggleTheme, isLight } = useTheme();

  const getTabTitle = (tab) => {
    switch (tab) {
      case "dashboard": return { title: "Student Dashboard", subtitle: "Personalized AI overview, exam countdowns & today's plan" };
      case "subjects": return { title: "Subjects & Courses", subtitle: "Manage your enrolled subjects and target scores" };
      case "materials": return { title: "Study Materials", subtitle: "Upload PDFs, PPT/PPTX, DOCX & notes for AI analysis" };
      case "syllabus": return { title: "Syllabus Analysis", subtitle: "Unit-wise curriculum breakdown & topic mastery tracking" };
      case "exams": return { title: "Exam Timetable", subtitle: "Upcoming deadlines, days remaining & urgency score" };
      case "roadmap": return { title: "Adaptive Study Roadmap", subtitle: "Personalized daily study sessions with dynamic rescheduling" };
      case "notes": return { title: "AI Notes & Summaries", subtitle: "High-yield summaries, formulas and cheat sheets" };
      case "pyq": return { title: "PYQ Analysis", subtitle: "Recurring exam questions & high-yield topic ranking" };
      case "quizzes": return { title: "Quizzes & Mock Tests", subtitle: "Adaptive MCQ practice and automated topic evaluations" };
      case "analytics": return { title: "Performance Analytics", subtitle: "Topic accuracy, weak area detection & score progress" };
      case "recommendations": return { title: "AI Recommendations", subtitle: "Prioritized study queue: What should I study now?" };
      case "chat": return { title: "AI Tutor Assistant", subtitle: "Grounded doubt solving with source material citations" };
      case "settings": return { title: "Settings & Configuration", subtitle: "AI API keys, database connection & preferences" };
      default: return { title: "Student Assistant", subtitle: "Agentic AI learning companion" };
    }
  };

  const currentInfo = getTabTitle(activeTab);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title */}
      <div>
        <h2 className="text-base font-bold text-white tracking-tight">{currentInfo.title}</h2>
        <p className="text-xs text-slate-400 hidden sm:block">{currentInfo.subtitle}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Live Ecosystem Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>10 AI Agents Live</span>
        </div>

        {/* Subject Filter Dropdown */}
        {subjects.length > 0 && (
          <div className="relative">
            <select
              value={selectedSubjectId || ""}
              onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none font-medium cursor-pointer shadow-xs"
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
          className="flex items-center gap-1.5 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-500 border border-indigo-500/30 text-xs px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer active:scale-95"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask Tutor</span>
        </button>

        {/* Light / Dark Mode Toggle Switcher */}
        <button
          onClick={toggleTheme}
          title={isLight ? "Switch to Dark Theme" : "Switch to Light Theme"}
          className="p-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer active:scale-95 flex items-center justify-center"
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
          className={`relative p-2 rounded-xl border transition cursor-pointer active:scale-95 ${
            showActivityModal
              ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
          }`}
          title="Toggle AI Activity Stream"
          aria-label="Toggle AI Activity Feed"
        >
          <Bot className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
        </button>
      </div>
    </header>
  );
}