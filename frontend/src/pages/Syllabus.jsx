import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Edit3,
  Bot,
  Sparkles,
  ChevronDown,
  Layers,
  Award
} from "lucide-react";

export default function Syllabus() {
  const { selectedSubjectId, selectedSubject, triggerRefresh, setActiveTab } = useApp();
  const [syllabus, setSyllabus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [rawText, setRawText] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchSyllabus = () => {
    if (!selectedSubjectId) return;
    setLoading(true);
    api
      .getSyllabus(selectedSubjectId)
      .then(setSyllabus)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSyllabus();
  }, [selectedSubjectId]);

  const handleToggleTopic = async (topicId) => {
    try {
      const res = await api.toggleTopic(topicId);
      setSyllabus((prev) => {
        if (!prev) return prev;
        const newUnits = prev.units.map((u) => ({
          ...u,
          topics: u.topics.map((t) =>
            t.id === topicId ? { ...t, completed: res.completed, mastery_level: res.mastery_level } : t
          ),
        }));
        return { ...prev, units: newUnits };
      });
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSyllabus = async (e) => {
    e.preventDefault();
    if (!rawText.trim() || !selectedSubjectId) return;
    setUpdating(true);
    try {
      await api.updateSyllabus(selectedSubjectId, rawText, `${selectedSubject?.name} Syllabus`);
      setShowEditModal(false);
      setRawText("");
      fetchSyllabus();
      triggerRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Calculate completion percentage
  const allTopics = syllabus?.units?.flatMap((u) => u.topics) || [];
  const completedCount = allTopics.filter((t) => t.completed).length;
  const progressPct = allTopics.length > 0 ? Math.round((completedCount / allTopics.length) * 100) : 0;
  const hasUnits = syllabus?.units && syllabus.units.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Curriculum & Syllabus Breakdown</h2>
          <p className="text-xs text-slate-400">
            Units and topics structured by the Syllabus Agent for{" "}
            <strong className="text-indigo-300">{selectedSubject?.name || "Subject"}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg transition cursor-pointer"
          >
            <Edit3 className="w-4 h-4" /> {hasUnits ? "Update Syllabus" : "Provide Syllabus"}
          </button>
        </div>
      </div>

      {!hasUnits ? (
        /* Clean Empty State when no syllabus has been provided */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-10 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white">
              No Syllabus Provided Yet for {selectedSubject?.name || "this Course"}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Syllabus Agent extracts units, calculates weightages, and builds your study schedule only after you provide your course curriculum.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4" /> Paste Syllabus Text
            </button>
            <button
              onClick={() => setActiveTab("materials")}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-5 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <Layers className="w-4 h-4" /> Upload Syllabus Document
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Progress Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Syllabus Completion
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400">
                {completedCount} / {allTopics.length} Topics ({progressPct}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
          </div>

          {/* Units List */}
          <div className="space-y-4">
            {syllabus?.units?.map((unit) => (
          <div
            key={unit.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-400">
                  Unit {unit.unit_number} • {unit.weightage_pct}% Weightage
                </span>
                <h3 className="text-sm font-bold text-white">{unit.title}</h3>
                {unit.description && <p className="text-xs text-slate-400">{unit.description}</p>}
              </div>
              <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                {unit.topics.length} Topics
              </span>
            </div>

            <div className="space-y-2">
              {unit.topics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => handleToggleTopic(topic.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    topic.completed
                      ? "bg-slate-950/40 border-slate-800/60 opacity-60 line-through"
                      : "bg-slate-950/90 border-slate-800 hover:border-indigo-500/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        topic.completed
                          ? "bg-emerald-500 border-emerald-400 text-white"
                          : "border-slate-600 bg-slate-800"
                      }`}
                    >
                      {topic.completed && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                    <span className="text-xs font-medium text-slate-200">{topic.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {topic.estimated_hours}h
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        topic.difficulty === "Hard"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : topic.difficulty === "Easy"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {topic.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      </>
      )}

      {/* Edit Syllabus Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Update Syllabus Curriculum</h3>
            <p className="text-xs text-slate-400 mb-4">
              Paste course modules or units. The Syllabus Agent will automatically parse units,
              topics, difficulty levels, and hours.
            </p>
            <form onSubmit={handleUpdateSyllabus} className="space-y-4">
              <textarea
                rows={8}
                required
                placeholder="Unit 1: Foundations...&#10;- Topic 1&#10;- Topic 2&#10;&#10;Unit 2: Advanced Concepts..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg"
                >
                  {updating ? "Structuring with AI..." : "Parse with Syllabus Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}