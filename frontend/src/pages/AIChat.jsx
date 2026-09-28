import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  Send,
  Bot,
  User,
  BookOpen,
  FileText,
  ChevronRight,
  Globe
} from "lucide-react";

export default function AIChat() {
  const { selectedSubjectId, selectedSubject, subjects, triggerRefresh } = useApp();
  const { user } = useAuth();
  const { language, studentLevel, t } = useLanguage();

  const [chatLang, setChatLang] = useState(user?.preferences?.ai_language || language || "en");
  const [chatLevel, setChatLevel] = useState(studentLevel || "undergraduate");

  // Keep chatLang synced when global language changes unless overridden
  useEffect(() => {
    if (language) setChatLang(language);
  }, [language]);

  useEffect(() => {
    if (studentLevel) setChatLevel(studentLevel);
  }, [studentLevel]);

  // Initial welcome message localized
  const getInitialMessage = () => {
    if (chatLang === "hi") {
      return "नमस्ते! मैं आपका एआई ट्यूटर एजेंट हूँ। मुझसे अपनी पाठ्यपुस्तकों, नोट्स या पाठ्यक्रम से संबंधित कोई भी सवाल, गणितीय समस्या या शंका पूछें। मैं सीधे संदर्भ सहित सटीक उत्तर दूंगा।";
    }
    if (chatLang === "mr") {
      return "नमस्कार! मी तुमचा एआई ट्यूटर एजंट आहे. तुमच्या पाठ्यपुस्तकातून, नोट्समधून किंवा अभ्यासक्रमातून कोणताही प्रश्न, गणित किंवा शंका विचारा. मी अचूक संदर्भासहित सविस्तर स्पष्टीकरण देईन.";
    }
    return "Hello! I am your AI Tutor Agent. Ask me any doubt, numerical problem, or conceptual question. I answer strictly referencing your uploaded textbooks, lecture slides, notes, and syllabus, providing direct citations.";
  };

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: getInitialMessage(),
      citations: [],
      suggested_followups: [
        chatLang === "hi" ? "इस विषय के मुख्य सिद्धांत और सूत्र क्या हैं?" : chatLang === "mr" ? "या विषयातील मुख्य व्याख्या आणि सूत्रे कोणती?" : "What are the core concepts and definitions for this subject?",
        chatLang === "hi" ? "परीक्षा के लिए पिछले वर्षों के महत्वपूर्ण प्रश्न बताएं।" : chatLang === "mr" ? "परीक्षेसाठी मागील वर्षांचे महत्त्वाचे प्रश्न स्पष्ट करा." : "Explain high-frequency exam questions from past papers.",
        chatLang === "hi" ? "सरल शब्दों में याद रखने के लिए एक उदाहरण दें।" : chatLang === "mr" ? "सोप्या भाषेत लक्षात ठेवण्यासाठी एक व्यावहारिक उदाहरण द्या." : "Give me a simple real-world example to understand this easily."
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
      const response = await api.askTutor(query, selectedSubjectId, historyPayload, chatLang, chatLevel);

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
      {/* Tutor Header with Language and Educational Level Controls */}
      <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              {t("chat.title", "Tutor Agent (RAG Doubt Solver)")}
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 hidden sm:inline-block">
                {t("chat.groundedCitations", "Grounded Citations")}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {t("chat.activeContext", "Active Context")}: <strong className="text-indigo-300">{selectedSubject?.name || t("common.all", "All Subjects")}</strong>
            </p>
          </div>
        </div>

        {/* Response Language Picker */}
        <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 shadow-xs">
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <select
            value={chatLang}
            onChange={(e) => setChatLang(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="en">🇬🇧 English</option>
            <option value="hi">🇮🇳 हिन्दी</option>
            <option value="mr">🇮🇳 मराठी</option>
          </select>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
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

              <div className="space-y-3 max-w-[85vw] sm:max-w-xl">
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
                      <BookOpen className="w-3 h-3" /> {t("chat.citationsTitle", "Verified Course Sources & Citations")} ({msg.citations.length})
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
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {t("chat.suggestedFollowups", "Suggested Follow-up Questions")}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggested_followups.map((fol, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleSend(fol)}
                          className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-indigo-300 border border-slate-700/60 transition flex items-center gap-1 cursor-pointer active:scale-98"
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
              <span className="text-slate-400 ml-1">
                {chatLang === "hi" 
                  ? "एआई ट्यूटर आपकी अध्ययन सामग्री का विश्लेषण कर रहा है..." 
                  : chatLang === "mr" 
                  ? "एआई ट्यूटर अभ्यास साहित्याचा शोध घेत आहे..." 
                  : "Tutor Agent querying indexed course chunks..."}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <input
            type="text"
            placeholder={
              chatLang === "hi"
                ? "अपनी शंका या सवाल पूछें... (उदा. 'न्यूटन के गति नियम उदाहरण सहित समझाएं')"
                : chatLang === "mr"
                ? "तुमचा प्रश्न किंवा शंका विचारा... (उदा. 'न्यूटनचे गतीविषयक नियम स्पष्ट करा')"
                : t("chat.placeholder", "Ask any doubt, concept, formula or exam question...")
            }
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