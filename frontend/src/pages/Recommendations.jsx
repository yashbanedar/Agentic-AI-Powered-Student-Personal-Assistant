import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import {
  Lightbulb,
  Sparkles,
  Flame,
  ArrowRight,
  BrainCircuit,
  Target,
  Clock,
  BookOpen,
  CheckCircle2
} from "lucide-react";

export default function Recommendations() {
  const { setActiveTab } = useApp();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getNextRecommendation()
      .then(setRecommendation)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">AI Personalized Recommendations</h2>
        <p className="text-xs text-slate-400">
          Recommendation Agent decision matrix synthesizing exam dates, PYQ frequencies & weak areas
        </p>
      </div>

      {/* Main Core Recommendation */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/40 shadow-2xl space-y-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <BrainCircuit className="w-4 h-4" /> Recommendation Agent
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Flame className="w-3.5 h-3.5" /> High Priority Decision
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            “What should I study now?”
          </h1>
          <p className="text-lg font-bold text-indigo-300 mt-2">
            {recommendation?.what_to_study_now}
          </p>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-2xl">
            {recommendation?.reason}
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-4">
          <button
            onClick={() => {
              if (recommendation?.action_type === "take_quiz") setActiveTab("quizzes");
              else if (recommendation?.action_type === "review_notes") setActiveTab("notes");
              else setActiveTab("pyq");
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
          >
            <span>{recommendation?.action_label || "Execute Recommended Action"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-5 py-3 rounded-xl border border-slate-700 transition"
          >
            Ask AI Tutor About This Topic
          </button>
        </div>
      </div>

      {/* Decision Factor Formula Breakdown */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm">How the Recommendation Agent Decides:</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
            <div className="text-xs font-bold text-indigo-400">1. Exam Proximity</div>
            <p className="text-xs text-slate-300">
              Nearest exam countdown triggers urgency scaling ($80-100\%$).
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
            <div className="text-xs font-bold text-amber-400">2. PYQ Frequency</div>
            <p className="text-xs text-slate-300">
              Recurring past question weightage flags 10-15 mark core concepts.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
            <div className="text-xs font-bold text-rose-400">3. Diagnostic Weakness</div>
            <p className="text-xs text-slate-300">
              Quiz scores &lt;60% trigger targeted daily remediation slots.
            </p>
          </div>
        </div>
      </div>

      {/* High-Yield Recommendations Queue */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm">Actionable Priority Queue</h3>
        <div className="space-y-3">
          {recommendation?.high_yield_topics?.map((topic, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-mono text-xs font-bold">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">{topic.topic}</h4>
                  <p className="text-[11px] text-slate-400">Expected Exam Marks: ~{topic.expected_marks} marks</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("notes")}
                className="text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-xl transition"
              >
                Study Topic
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}