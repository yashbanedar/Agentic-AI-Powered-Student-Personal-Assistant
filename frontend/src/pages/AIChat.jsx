import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  FileText,
  HelpCircle,
  CornerDownLeft,
  ChevronRight
} from "lucide-react";

export default function AIChat() {
  const { selectedSubjectId, selectedSubject, subjects, triggerRefresh } = useApp();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am your AI Tutor Agent. Ask me any doubt, numerical problem, or conceptual question. I answer strictly referencing your uploaded textbooks, lecture slides, notes, and syllabus, providing direct citations.",
      citations: [],
      suggested_followups: [
        "What are the core concepts and definitions for this subject?",
        "Explain the high-frequency exam questions from past papers.",
        "What is the trade-off between throughput and latency?"
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText = null) => {
    const query = (messageText || input).trim();
    if (!query || loading) return;

    const userMsg = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await api.askTutor(query, selectedSubjectId, historyPayload);

      const botMsg = {
        role: "assistant",
        content: response.answer,
        citations: response.citations || [],
        suggested_followups: response.suggested_followups || [],
      };
      setMessages((prev) => [...prev, botMsg]);
      triggerRefresh();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${err.message}. Please check your connection or uploaded materials.`,
          citations: [],
          suggested_followups: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
      {/* Tutor Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              Tutor Agent (RAG Doubt Solver)
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                Grounded Citations
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Active Context: <strong className="text-indigo-300">{selectedSubject?.name || "All Subjects"}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              className={`flex gap-3 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 border border-slate-700 text-indigo-400"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-3">
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20"
                      : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md"
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>
                </div>

                {/* Grounded Document Citations */}
                {!isUser && msg.citations?.length > 0 && (
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3" /> Grounded Source Citations ({msg.citations.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((cit, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px]"
                        >
                          <div className="flex items-center justify-between text-slate-400 font-semibold mb-1">
                            <span className="text-white truncate max-w-[140px] flex items-center gap-1">
                              <FileText className="w-3 h-3 text-indigo-400" />
                              {cit.document_name}
                            </span>
                            <span className="text-indigo-400 font-mono text-[10px]">{cit.page_or_slide}</span>
                          </div>
                          <p className="text-slate-400 text-[10px] italic line-clamp-2">
                            "{cit.snippet}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Followup Questions */}
                {!isUser && msg.suggested_followups?.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold">Suggested Questions:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggested_followups.map((fol, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleSend(fol)}
                          className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-indigo-300 border border-slate-700/60 transition flex items-center gap-1"
                        >
                          <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span>{fol}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 mr-auto items-center text-xs text-indigo-400">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-100"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-200"></span>
              <span className="text-slate-400 ml-1">Tutor Agent querying indexed chunks...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            placeholder="Ask your doubt... (e.g. 'Explain page replacement algorithms with citations')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}