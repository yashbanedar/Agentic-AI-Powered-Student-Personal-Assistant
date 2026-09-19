import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import {
  Route,
  Calendar,
  Clock,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Flame,
  Sun,
  Sunset,
  Moon
} from "lucide-react";

export default function StudyRoadmap() {
  const { triggerRefresh, setActiveTab } = useApp();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replanning, setReplanning] = useState(false);

  const fetchRoadmap = () => {
    setLoading(true);
    api
      .getRoadmap()
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggleTask = async (taskId) => {
    try {
      await api.toggleTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
      );
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReplan = async () => {
    setReplanning(true);
    try {
      await api.replan();
      fetchRoadmap();
      triggerRefresh();
    } catch (e) {
      alert(e.message);
    } finally {
      setReplanning(false);
    }
  };

  // Group tasks by date
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {});

  const getSlotIcon = (slot) => {
    switch (slot) {
      case "Morning": return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case "Afternoon": return <Sunset className="w-3.5 h-3.5 text-orange-400" />;
      default: return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const hasTasks = tasks.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Adaptive Study Roadmap</h2>
          <p className="text-xs text-slate-400">
            Dynamically synthesized based on remaining exam days, PYQ weights, and weak topics
          </p>
        </div>
        <button
          onClick={handleReplan}
          disabled={replanning}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${replanning ? "animate-spin" : ""}`} />
          {replanning ? "Re-Optimizing Roadmap..." : "Adaptive Re-Plan"}
        </button>
      </div>

      {!hasTasks ? (
        /* Empty State */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-10 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Route className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white">
              No Study Roadmap Generated Yet
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your preparation roadmap is constructed strictly from your provided course syllabus, notes, and exam deadlines.
            </p>
            <div className="pt-2 text-left bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Provide syllabus or lecture notes in <strong>Curriculum</strong> or <strong>Study Materials</strong>.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Add your upcoming exam target dates in <strong>Exams</strong>.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Click <strong>Adaptive Re-Plan</strong> to synthesize your daily preparation schedule.</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab("syllabus")}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Calendar className="w-4 h-4" /> Provide Syllabus
            </button>
            <button
              onClick={() => setActiveTab("exams")}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-5 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <Clock className="w-4 h-4" /> Add Exam Target
            </button>
          </div>
        </div>
      ) : (
        /* Days Roadmap List */
        <div className="space-y-6">
        {Object.entries(groupedTasks).map(([date, dayTasks]) => (
          <div key={date} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">
                  {new Date(date).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {dayTasks.filter((t) => t.completed).length} / {dayTasks.length} Completed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    task.completed
                      ? "bg-slate-950/40 border-slate-800/60 opacity-60 line-through"
                      : "bg-slate-950/90 border-slate-800 hover:border-indigo-500/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        {getSlotIcon(task.time_slot)}
                        {task.time_slot}
                      </span>
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

                    <h4 className="text-xs font-semibold text-white leading-snug">{task.title}</h4>
                    <p className="text-[11px] text-indigo-400 font-medium">{task.subject_name}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {task.duration_minutes} mins
                    </span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        task.completed
                          ? "bg-emerald-500 border-emerald-400 text-white"
                          : "border-slate-600 bg-slate-800"
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}