import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import {
  FileEdit,
  Sparkles,
  BookOpen,
  Plus,
  Copy,
  Check,
  Download,
  Flame
} from "lucide-react";

export default function AINotes() {
  const { selectedSubjectId, selectedSubject, triggerRefresh, setActiveTab } = useApp();
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [topicName, setTopicName] = useState("");
  const [noteType, setNoteType] = useState("Summary");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchNotes = () => {
    setLoading(true);
    api
      .getNotes(selectedSubjectId)
      .then((data) => {
        setNotes(data);
        if (data.length > 0 && !selectedNote) setSelectedNote(data[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotes();
  }, [selectedSubjectId]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topicName.trim() || !selectedSubjectId) return;

    setGenerating(true);
    try {
      const newNote = await api.generateNote({
        subject_id: selectedSubjectId,
        topic_name: topicName,
        note_type: noteType,
      });
      setShowGenerateModal(false);
      setTopicName("");
      fetchNotes();
      setSelectedNote(newNote);
      triggerRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!selectedNote) return;
    navigator.clipboard.writeText(selectedNote.content_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasNotes = notes.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">AI Study Notes & Cheat Sheets</h2>
          <p className="text-xs text-slate-400">
            Synthesized key definitions, equations, and high-yield exam summaries strictly from your course material
          </p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4" /> Generate AI Note
        </button>
      </div>

      {!hasNotes ? (
        /* Empty State */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-10 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white">
              No AI Revision Notes Generated Yet
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI Notes are formulated strictly from your uploaded course materials. Upload lecture slides, chapters, or typed notes in Study Materials first so the AI Document Agent can synthesize grounded revision notes and cheat sheets.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab("materials")}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4" /> Upload Study Materials
            </button>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-5 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Generate Note
            </button>
          </div>
        </div>
      ) : (
        /* Two Column Layout: Notes List vs Note Viewer */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Notes Sidebar */}
          <div className="md:col-span-1 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Saved Notes ({notes.length})
            </h3>
            <div className="space-y-2">
              {notes.map((n) => {
                const isSelected = selectedNote?.id === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNote(n)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500/80 shadow-md"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="font-semibold text-indigo-400 uppercase tracking-wider">
                        {n.note_type}
                      </span>
                      <span className="text-slate-400">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{n.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{n.subject_name}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Note Viewer */}
          <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[500px]">
            {selectedNote ? (
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <span className="text-xs font-semibold text-indigo-400">
                      {selectedNote.subject_name} • {selectedNote.note_type}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">{selectedNote.title}</h3>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-slate-700 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy Markdown"}</span>
                  </button>
                </div>

                <div className="prose prose-invert prose-xs sm:prose-sm max-w-none text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                  {selectedNote.content_markdown}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                Select a note or generate a new one to preview.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generate Note Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Generate AI Study Note</h3>
            <p className="text-xs text-slate-400 mb-4">
              The AI synthesizes course materials into concise summaries, formula cheat sheets, or key definitions.
            </p>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Topic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Concurrency & Deadlocks"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Note Type</label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Summary">Comprehensive Summary</option>
                  <option value="CheatSheet">Formula & Cheat Sheet</option>
                  <option value="ExamTips">High-Yield Exam Tips & Mistakes</option>
                  <option value="Definitions">Key Definitions & Glossary</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg"
                >
                  {generating ? "Synthesizing with AI..." : "Generate Notes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}