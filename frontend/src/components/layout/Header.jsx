import React from "react";
import { useApp } from "../../context/AppContext";
import { 
  Bot, 
  Sparkles, 
  MessageSquare, 
  ChevronDown, 
  Bell, 
  BookOpen 
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
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title */}
      <div>
        <h2 className="text-base font-bold text-white tracking-tight">{currentInfo.title}</h2>
        <p className="text-xs text-slate-400 hidden sm:block">{currentInfo.subtitle}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Subject Filter Dropdown */}
        {subjects.length > 0 && (
          <div className="relative">
            <select
              value={selectedSubjectId || ""}
              onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none font-medium cursor-pointer"
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
          className="flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs px-3 py-1.5 rounded-xl font-medium transition"
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ask Tutor</span>
        </button>

        {/* AI Activity Stream Toggle */}
        <button
          onClick={() => setShowActivityModal(!showActivityModal)}
          className={`relative p-2 rounded-xl border transition ${
            showActivityModal
              ? "bg-indigo-600 text-white border-indigo-500"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
          }`}
          title="Toggle AI Activity Stream"
        >
          <Bot className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
        </button>
      </div>
    </header>
  );
}