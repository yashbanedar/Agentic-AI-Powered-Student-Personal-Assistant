import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import {
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Plus,
  Layers,
  Sparkles,
  BookOpen
} from "lucide-react";

export default function StudyMaterials() {
  const { selectedSubjectId, selectedSubject, triggerRefresh } = useApp();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("study_material");
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Note text creator
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  // Chunk view modal
  const [activeDocChunks, setActiveDocChunks] = useState(null);
  const [viewingDocName, setViewingDocName] = useState("");

  const fetchDocs = () => {
    setLoading(true);
    api
      .getDocuments(selectedSubjectId)
      .then(setDocuments)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocs();
  }, [selectedSubjectId]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    if (selectedSubjectId) formData.append("subject_id", selectedSubjectId);
    formData.append("category", category);

    try {
      await api.uploadDocument(formData);
      setSelectedFile(null);
      fetchDocs();
      triggerRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    try {
      await api.createTextNote({
        title: noteTitle,
        content: noteContent,
        subject_id: selectedSubjectId,
        category: "notes"
      });
      setShowNoteModal(false);
      setNoteTitle("");
      setNoteContent("");
      fetchDocs();
      triggerRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewChunks = async (doc) => {
    setViewingDocName(doc.filename);
    try {
      const chunks = await api.getDocumentChunks(doc.id);
      setActiveDocChunks(chunks);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document and its indexed semantic chunks?")) return;
    try {
      await api.deleteDocument(id);
      fetchDocs();
      triggerRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Study Materials & Notes</h2>
          <p className="text-xs text-slate-400">
            Upload PDFs, PPT/PPTX, DOC/DOCX, notes, syllabus, and PYQs for RAG doubt solving
          </p>
        </div>
        <button
          onClick={() => setShowNoteModal(true)}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition"
        >
          <Plus className="w-4 h-4" /> Quick Text Note
        </button>
      </div>

      {/* Upload Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:flex-1">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Select File (PDF, PPT/PPTX, DOC/DOCX, TXT)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 bg-slate-950/60 p-2 border border-slate-800 rounded-xl cursor-pointer"
              />
            </div>

            <div className="w-full sm:w-56">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Document Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="study_material">Study Material / Textbook</option>
                <option value="syllabus">Syllabus Document</option>
                <option value="pyq">Previous Year Questions (PYQ)</option>
                <option value="notes">Lecture Notes / Handouts</option>
              </select>
            </div>

            <div className="w-full sm:w-auto pt-5">
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                {uploading ? "Document Agent Processing..." : "Upload & Analyze"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Document List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Uploaded Documents ({documents.length})
          </h3>
          <span className="text-xs text-slate-400">
            Subject: <strong className="text-indigo-300">{selectedSubject?.name || "All"}</strong>
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No study materials uploaded for this subject yet. Upload lecture notes, syllabus, or past papers above!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 hover:bg-slate-800/30 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0 uppercase font-mono font-bold text-xs">
                    {doc.file_type}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{doc.filename}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {doc.category.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {(doc.file_size / 1024).toFixed(1)} KB
                      </span>
                      <span className="text-[10px] text-indigo-400 flex items-center gap-1 font-mono">
                        <Sparkles className="w-3 h-3" /> {doc.chunk_count} RAG Chunks
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleViewChunks(doc)}
                    className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-slate-700 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Chunks
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chunks Preview Modal */}
      {activeDocChunks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">Semantic Chunks for RAG</h3>
                <p className="text-xs text-indigo-400">{viewingDocName}</p>
              </div>
              <button
                onClick={() => setActiveDocChunks(null)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 px-3 py-1.5 rounded-lg"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeDocChunks.map((chunk) => (
                <div key={chunk.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-mono text-indigo-400">Chunk #{chunk.chunk_index + 1}</span>
                    <span>{chunk.metadata_json?.page_or_slide || "Page 1"}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{chunk.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Add Quick Study Notes</h3>
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Note Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Key Definitions"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Note Content</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Type or paste summary concepts, key formulas, or lecture explanations..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg"
                >
                  Process with Document Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}