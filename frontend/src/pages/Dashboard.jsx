import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import AIActivityFeed from "../components/common/AIActivityFeed";
import {
  Sparkles,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  BookOpen,
  HelpCircle,
  TrendingUp,
  BrainCircuit,
  Play
} from "lucide-react";

export default function Dashboard() {
  const { setActiveTab, subjects, selectedSubject, triggerRefresh } = useApp();
  const [recommendation, setRecommendation] = useState(null);
  const [exams, setExams] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getNextRecommendation().catch(() => null),
      api.getExams().catch(() => []),
      api.getTodayTasks().catch(() => []),
      api.getAnalytics().catch(() => null),
    ])
      .then(([recData, examData, taskData, analyticsData]) => {
        setRecommendation(recData);
        setExams(examData);
        setTodayTasks(taskData);
        setAnalytics(analyticsData);
      })
      .finally(() => setLoading(false));
  }, [selectedSubject]);

  const handleToggleTask = async (taskId) => {
    try {
      await api.toggleTask(taskId);
      setTodayTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
      );
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRecommendationAction = () => {
    if (!recommendation) return;
    if (recommendation.action_type === "take_quiz") {
      setActiveTab("quizzes");
    } else if (recommendation.action_type === "review_notes") {
      setActiveTab("notes");
    } else if (recommendation.action_type === "upload_material") {
      setActiveTab("materials");
    } else {
      setActiveTab("pyq");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HERO BANNER: "What should I study now?" AI Recommendation */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/80 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <BrainCircuit className="w-3.5 h-3.5" />
                AI Recommendation Agent
              </span>
              {recommendation?.urgency_level === "HIGH" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Flame className="w-3 h-3" /> High Priority
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              What should I study now?
            </h1>
            <p className="text-base font-semibold text-indigo-200">
              {recommendation?.what_to_study_now || "Select or enroll in a subject to begin your study plan."}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              {recommendation?.reason ||
                "Synthesized from your upcoming exam dates, past year question weightage, and latest quiz accuracy."}
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={handleRecommendationAction}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{recommendation?.action_label || "Start Focused Session"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS & EXAM COUNTDOWN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Upcoming Exams Countdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-400" />
              Upcoming Exams
            </h3>
            <button
              onClick={() => setActiveTab("exams")}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {exams.length === 0 ? (
              <div className="py-3 text-center space-y-2">
                <p className="text-xs text-slate-400">No exams scheduled yet.</p>
                <button
                  onClick={() => setActiveTab("exams")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1"
                >
                  + Add Exam Target <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              exams.slice(0, 2).map((ex) => (
                <div
                  key={ex.id}
                  className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between"
                >
                  <div className="overflow-hidden pr-2">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{ex.exam_name}</h4>
                    <p className="text-[11px] text-slate-400">Target: {ex.target_score}%</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block text-xs font-black px-2.5 py-1 rounded-lg ${
                        ex.days_left <= 5
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {ex.days_left} Days Left
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Urgency: {ex.prep_urgency}%</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overall Performance Stat */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Overall Performance
            </h3>
            <button
              onClick={() => setActiveTab("analytics")}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
            >
              Analytics <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {analytics && analytics.total_quizzes_completed > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-black text-white">
                    {analytics.overall_accuracy}%
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Average Test Mastery</p>
                </div>
                <div className="h-14 w-14 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 flex items-center justify-center font-bold text-xs text-emerald-400">
                  {analytics.total_quizzes_completed} Tests
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Streak: {analytics.study_streak_days} Day{analytics.study_streak_days !== 1 ? "s" : ""} 🔥</span>
                <span>Study Time: {analytics.hours_studied_this_week} hrs</span>
              </div>
            </>
          ) : (
            <>
              <div className="py-2 text-center space-y-1.5">
                <p className="text-xs text-slate-300 font-semibold">Diagnostic Tests Pending</p>
                <p className="text-[11px] text-slate-500">Take your first quiz to calculate accuracy & topic mastery.</p>
                <button
                  onClick={() => setActiveTab("quizzes")}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1 pt-1"
                >
                  Start Practice Quiz <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Streak: 1 Day Active 🔥</span>
                <span>Ready to test</span>
              </div>
            </>
          )}
        </div>

        {/* Subject Enrolled */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              Enrolled Courses
            </h3>
            <button
              onClick={() => setActiveTab("subjects")}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {subjects.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No subjects added yet.</p>
            ) : (
              subjects.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2 bg-slate-950/50 rounded-xl border border-slate-800/70"
                >
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                    <span className="font-medium text-xs text-slate-300 truncate">{s.name}</span>
                  </div>
                  <span className="text-[10px] text-indigo-300 font-mono font-bold shrink-0 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Grade {s.target_grade || "A"}
                  </span>
                </div>
              ))
            )}
          </div>

          <p className="text-[11px] text-slate-500 mt-2">
            {subjects.length} active courses enrolled
          </p>
        </div>
      </div>

      {/* 3. MAIN WORKFLOW SECTION: TODAY'S PLAN vs LIVE AI ACTIVITY STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Adaptive Study Plan (2 columns) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Today's Adaptive Preparation Plan
              </h3>
              <p className="text-xs text-slate-400">
                Generated by Study Planner Agent based on exam urgency
              </p>
            </div>
            <button
              onClick={() => setActiveTab("roadmap")}
              className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-indigo-300 font-medium transition"
            >
              Full Roadmap
            </button>
          </div>

          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs text-slate-400">No study tasks scheduled for today.</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Provide your syllabus or lecture notes so the AI Study Planner can generate your daily preparation schedule.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab("syllabus")}
                    className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow transition cursor-pointer"
                  >
                    + Provide Course Materials
                  </button>
                </div>
              </div>
            ) : (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    task.completed
                      ? "bg-slate-950/40 border-slate-800/60 opacity-60 line-through"
                      : "bg-slate-950/90 border-slate-800 hover:border-indigo-500/50 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        task.completed
                          ? "bg-emerald-500 border-emerald-400 text-white"
                          : "border-slate-600 bg-slate-800"
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                          {task.time_slot} ({task.duration_minutes}m)
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                          {task.subject_name}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-100 mt-0.5">{task.title}</h4>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      task.priority === "High"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live AI Activity Feed Section */}
        <div className="lg:col-span-1">
          <AIActivityFeed compact={true} />
        </div>
      </div>

      {/* 4. WEAK TOPICS & IMPORTANT HIGH-YIELD PYQ TOPICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weak Topics Detected */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Weak Topics Detected
            </h3>
            <button
              onClick={() => setActiveTab("quizzes")}
              className="text-xs text-indigo-400 hover:underline"
            >
              Practice Drills
            </button>
          </div>

          <div className="space-y-2.5">
            {analytics?.weak_topics && analytics.weak_topics.length > 0 ? (
              analytics.weak_topics.slice(0, 3).map((w, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{w.topic}</h4>
                    <p className="text-[11px] text-rose-400 mt-0.5">
                      Accuracy: {w.accuracy}% • {w.action}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("quizzes")}
                    className="text-[11px] font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg transition"
                  >
                    Drill Now
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No critical weak topics flagged.</p>
            )}
          </div>
        </div>

        {/* High-Yield PYQ Topics */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              High-Yield PYQ Topics
            </h3>
            <button
              onClick={() => setActiveTab("pyq")}
              className="text-xs text-indigo-400 hover:underline"
            >
              Explore Papers
            </button>
          </div>

          <div className="space-y-2.5">
            {recommendation?.high_yield_topics && recommendation.high_yield_topics.length > 0 ? (
              recommendation.high_yield_topics.slice(0, 3).map((t, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{t.topic}</h4>
                    <p className="text-[11px] text-amber-400/90 mt-0.5">
                      Expected Weight: ~{t.expected_marks} marks • {t.priority} Priority
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("notes")}
                    className="text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg transition"
                  >
                    Read Notes
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">Upload past papers to view frequency analysis.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}