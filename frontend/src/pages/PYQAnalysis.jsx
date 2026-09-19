import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import {
  HelpCircle,
  Sparkles,
  Flame,
  Award,
  UploadCloud,
  FileText,
  BarChart,
  CheckCircle2
} from "lucide-react";

export default function PYQAnalysis() {
  const { selectedSubjectId, selectedSubject, triggerRefresh, setActiveTab } = useApp();
  const [pyqData, setPyqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);
  const [paperText, setPaperText] = useState("");
  const [examName, setExamName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const fetchPYQ = () => {
    setLoading(true);
    api
      .getPYQ(selectedSubjectId)
      .then(setPyqData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPYQ();
  }, [selectedSubjectId]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!paperText.trim() || !selectedSubjectId) return;

    setAnalyzing(true);
    try {
      await api.analyzePYQ(selectedSubjectId, paperText, examName || "Recent Year Exam Paper");
      setShowAnalyzeModal(false);
      setPaperText("");
      setExamName("");
      fetchPYQ();
      triggerRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const hasPYQ = pyqData.length > 0;
  const activeAnalysis = pyqData[0]?.analysis || null;
  const highYieldTopics = activeAnalysis?.high_yield_topics || [];
  const sampleQuestions = activeAnalysis?.sample_questions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Previous Year Questions (PYQ) Analysis</h2>
          <p className="text-xs text-slate-400">
            High-frequency topics and recurring question patterns identified by the PYQ Agent
          </p>
        </div>
        <button
          onClick={() => setShowAnalyzeModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg transition cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" /> {hasPYQ ? "Analyze New Question Paper" : "Provide Question Paper"}
        </button>
      </div>

      {!hasPYQ ? (
        /* Empty State */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-10 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white">
              No Past Year Questions Analyzed Yet
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload past examination papers or paste previous question sets for {selectedSubject?.name || "your course"}. 
              The PYQ Agent will rank high-yield topics, compute question recurrence, and flag Must-Know topics based strictly on your papers.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowAnalyzeModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" /> Paste & Analyze Paper
            </button>
            <button
              onClick={() => setActiveTab("materials")}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-5 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <FileText className="w-4 h-4" /> Upload PYQ Document
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Overview Insight Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  PYQ Agent Strategic Insight
                </span>
                <h3 className="text-base font-bold text-white">
                  {pyqData[0]?.exam_name || `${selectedSubject?.name} Examination Series`}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {activeAnalysis?.overall_pyq_insight ||
                    "Analyzed past examination papers. Topics with high historical recurrence and marks density have been flagged as Must-Know."}
                </p>
              </div>
            </div>
          </div>

      {/* High-Yield Topics Ranked */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          High-Yield Recurring Topics Ranking
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {highYieldTopics.map((topic, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center text-[10px] font-mono">
                      #{idx + 1}
                    </span>
                    {topic.topic}
                  </span>
                  {topic.must_know && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      MUST KNOW
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {topic.recommendation}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400">
                  {topic.occurrences_past_5_years}x in Past 5 Years
                </span>
                <span className="text-emerald-400">~{topic.expected_marks} Marks Weight</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Repeated Questions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          Frequently Tested Question Formats
        </h3>
        <div className="space-y-2">
          {sampleQuestions.map((q, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-start gap-3"
            >
              <span className="text-xs font-mono font-bold text-indigo-400 shrink-0 mt-0.5">
                Q{idx + 1}.
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      </div>
      </>
      )}

      {/* Analyze Modal */}
      {showAnalyzeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Analyze Previous Year Paper</h3>
            <p className="text-xs text-slate-400 mb-4">
              Paste questions or full question papers. The PYQ Agent will compute recurrence frequency, marks distribution, and high-yield priorities.
            </p>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Exam Title / Year</label>
                <input
                  type="text"
                  placeholder="e.g. End-Semester Exam 2024"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Question Paper Content</label>
                <textarea
                  rows={8}
                  required
                  placeholder="1. Explain the differences between...&#10;2. Derive the equation for...&#10;3. Short note on..."
                  value={paperText}
                  onChange={(e) => setPaperText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnalyzeModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={analyzing}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg"
                >
                  {analyzing ? "Analyzing Patterns..." : "Run PYQ Analysis"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}