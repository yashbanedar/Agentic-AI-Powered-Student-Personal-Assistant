import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Award,
  Plus
} from "lucide-react";

export default function Quizzes() {
  const { subjects, selectedSubjectId, triggerRefresh, setActiveTab } = useApp();
  const [quizzes, setQuizzes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Quiz taking state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({}); // { question_id: option_index }
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Generate Quiz modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [targetSubjectId, setTargetSubjectId] = useState(selectedSubjectId || "");
  const [quizTitle, setQuizTitle] = useState("");
  const [topicName, setTopicName] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [timeLimit, setTimeLimit] = useState(15);
  const [generating, setGenerating] = useState(false);

  const fetchQuizzesAndHistory = () => {
    setLoading(true);
    Promise.all([
      api.getQuizzes(selectedSubjectId).catch(() => []),
      api.getQuizHistory().catch(() => []),
    ])
      .then(([qData, hData]) => {
        setQuizzes(qData);
        setHistory(hData);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuizzesAndHistory();
    if (selectedSubjectId) setTargetSubjectId(selectedSubjectId);
  }, [selectedSubjectId]);

  const handleStartQuiz = async (quizId) => {
    try {
      const fullQuiz = await api.getQuiz(quizId);
      setActiveQuiz(fullQuiz);
      setUserAnswers({});
      setQuizSubmitted(false);
      setEvalResult(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOptionSelect = (qId, optIdx) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const res = await api.submitQuiz(activeQuiz.id, userAnswers);
      setEvalResult(res);
      setQuizSubmitted(true);
      fetchQuizzesAndHistory();
      triggerRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!targetSubjectId || !quizTitle.trim()) return;

    setGenerating(true);
    try {
      const newQuiz = await api.generateQuiz({
        subject_id: Number(targetSubjectId),
        title: quizTitle,
        topic_name: topicName,
        total_questions: Number(totalQuestions),
        time_limit_minutes: Number(timeLimit),
      });
      setShowGenerateModal(false);
      setQuizTitle("");
      setTopicName("");
      fetchQuizzesAndHistory();
      handleStartQuiz(newQuiz.id);
      triggerRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Quizzes, MCQs & Mock Tests</h2>
          <p className="text-xs text-slate-400">
            Formulated by Quiz Agent and evaluated by Evaluation Agent for weak-topic diagnostics
          </p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Generate Practice Quiz
        </button>
      </div>

      {/* ACTIVE QUIZ RUNNER INTERFACE */}
      {activeQuiz ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-400">
                {activeQuiz.subject_name} • {activeQuiz.quiz_type}
              </span>
              <h3 className="text-lg font-bold text-white mt-1">{activeQuiz.title}</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-4 h-4 text-amber-400" /> {activeQuiz.time_limit_minutes}m
              </span>
              <button
                onClick={() => setActiveQuiz(null)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl transition"
              >
                Exit Test
              </button>
            </div>
          </div>

          {/* Evaluation Results Banner */}
          {quizSubmitted && evalResult && (
            <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-white">Evaluation Agent Diagnostic</h4>
                  <p className="text-xs text-indigo-200 mt-0.5">{evalResult.summary_feedback}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400">
                    {evalResult.percentage}%
                  </div>
                  <span className="text-xs text-slate-400">
                    {evalResult.score} / {evalResult.total} Correct
                  </span>
                </div>
              </div>

              {evalResult.weak_topics?.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-indigo-500/20 text-xs text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>
                    <strong>Flagged Weak Areas:</strong> {evalResult.weak_topics.join(", ")}.
                    Study plan updated adaptively!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-6">
            {activeQuiz.questions.map((q, qIndex) => {
              const selectedOpt = userAnswers[q.id];
              const resultDetail = evalResult?.question_results?.find(
                (r) => String(r.question_id) === String(q.id)
              );

              return (
                <div key={q.id} className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="text-xs font-bold text-white flex items-start gap-2">
                      <span className="font-mono text-indigo-400">Q{qIndex + 1}.</span>
                      <span>{q.question_text}</span>
                    </h4>
                    {q.topic_name && (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full shrink-0">
                        {q.topic_name}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 pt-2">
                    {q.options.map((opt, optIndex) => {
                      const isChosen = selectedOpt === optIndex;
                      let optClass = "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700";

                      if (quizSubmitted && resultDetail) {
                        if (optIndex === resultDetail.correct_option) {
                          optClass = "border-emerald-500 bg-emerald-500/20 text-emerald-200 font-semibold";
                        } else if (isChosen && !resultDetail.is_correct) {
                          optClass = "border-rose-500 bg-rose-500/20 text-rose-200";
                        }
                      } else if (isChosen) {
                        optClass = "border-indigo-500 bg-indigo-600/20 text-white font-semibold";
                      }

                      return (
                        <div
                          key={optIndex}
                          onClick={() => handleOptionSelect(q.id, optIndex)}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${optClass}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center font-mono text-[10px]">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {quizSubmitted && resultDetail && (
                            <div>
                              {optIndex === resultDetail.correct_option && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              )}
                              {isChosen && !resultDetail.is_correct && (
                                <XCircle className="w-4 h-4 text-rose-400" />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {quizSubmitted && resultDetail?.explanation && (
                    <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300">
                      <strong className="text-indigo-400">Explanation: </strong>
                      {resultDetail.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Action */}
          {!quizSubmitted && (
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                {submitting ? "Evaluating with AI..." : "Submit Test & Evaluate"}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* QUIZ LIST & ATTEMPTS VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Quizzes (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Available Practice Quizzes</h3>
              <span className="text-xs text-slate-400">{quizzes.length} tests</span>
            </div>

            {quizzes.length === 0 ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h4 className="text-sm font-bold text-white">No Practice Quizzes Generated Yet</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The Quiz Agent builds diagnostic tests and MCQs strictly from your uploaded course notes or syllabus topics.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <button
                    onClick={() => setActiveTab("materials")}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Upload Study Materials
                  </button>
                  <button
                    onClick={() => setShowGenerateModal(true)}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Generate Quiz
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzes.map((q) => (
                  <div
                    key={q.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-400">
                        {q.subject_name} • {q.quiz_type}
                      </span>
                      <h4 className="text-sm font-bold text-white">{q.title}</h4>
                      {q.topic_name && (
                        <p className="text-xs text-slate-400">Target Topic: {q.topic_name}</p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono">
                        {q.total_questions} Questions • {q.time_limit_minutes}m
                      </span>
                      <button
                        onClick={() => handleStartQuiz(q.id)}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Start
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Attempts History (1 col) */}
          <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Past Test Attempts
            </h3>

            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-xs text-slate-500">No test attempts recorded yet.</p>
              ) : (
                history.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate max-w-[180px]">
                        {att.quiz_title}
                      </h4>
                      <span
                        className={`text-xs font-black ${
                          att.percentage >= 80
                            ? "text-emerald-400"
                            : att.percentage >= 60
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {att.percentage}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{att.score} / {att.total} Correct</span>
                      <span>{new Date(att.completed_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generate Quiz Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Generate Practice Quiz</h3>
            <p className="text-xs text-slate-400 mb-4">
              Quiz Agent formulates custom MCQs with complete explanations and scoring rubrics.
            </p>
            <form onSubmit={handleGenerateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <select
                  value={targetSubjectId}
                  onChange={(e) => setTargetSubjectId(e.target.value)}
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
                <label className="block text-xs font-medium text-slate-300 mb-1">Quiz Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory Management Practice Test"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Paging, Segmentation & Thrashing"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Questions</label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={totalQuestions}
                    onChange={(e) => setTotalQuestions(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Time Limit (mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
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
                  {generating ? "Formulating Questions..." : "Create & Start Quiz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}