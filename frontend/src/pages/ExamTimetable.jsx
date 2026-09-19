import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import {
  CalendarDays,
  Clock,
  MapPin,
  Target,
  Plus,
  Trash2,
  Flame,
  AlertCircle
} from "lucide-react";

export default function ExamTimetable() {
  const { subjects, triggerRefresh } = useApp();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [subjectId, setSubjectId] = useState("");
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [location, setLocation] = useState("Main Examination Hall");
  const [targetScore, setTargetScore] = useState(90);

  const fetchExams = () => {
    setLoading(true);
    api
      .getExams()
      .then(setExams)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!subjectId || !examName.trim() || !examDate) return;

    try {
      await api.createExam({
        subject_id: Number(subjectId),
        exam_name: examName,
        exam_date: new Date(examDate).toISOString(),
        location,
        target_score: Number(targetScore),
      });
      setShowAddModal(false);
      setExamName("");
      setExamDate("");
      fetchExams();
      triggerRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this exam schedule?")) return;
    try {
      await api.deleteExam(id);
      fetchExams();
      triggerRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Exam Timetable & Countdowns</h2>
          <p className="text-xs text-slate-400">
            Preparation urgency and countdown analyzed by the Exam Agent
          </p>
        </div>
        <button
          onClick={() => {
            if (subjects.length > 0 && !subjectId) setSubjectId(subjects[0].id);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg transition"
        >
          <Plus className="w-4 h-4" /> Add Exam
        </button>
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exams.map((ex) => (
          <div
            key={ex.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                  {ex.subject_name}
                </span>
                <button
                  onClick={() => handleDelete(ex.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-base font-bold text-white">{ex.exam_name}</h3>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-white">{ex.days_left} Days</div>
                  <div className="text-[10px] text-slate-400">
                    {ex.hours_left} Hours Remaining
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                    ex.prep_urgency >= 80
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : ex.prep_urgency >= 60
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {ex.prep_urgency}% Urgency
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-slate-400">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(ex.exam_date).toLocaleDateString(undefined, { dateStyle: "long" })}</span>
                </div>
                {ex.location && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{ex.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-400">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Target Score: <strong className="text-emerald-400">{ex.target_score}%</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              Exam Agent automatically informs study plan priorities
            </div>
          </div>
        ))}
      </div>

      {/* Add Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Schedule Exam</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Exam Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Semester Exam"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Exam Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hall / Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Score (%)</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg"
                >
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}