import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";
import {
  GraduationCap,
  BookOpen,
  CalendarDays,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  BrainCircuit,
  Clock,
  Target,
  Award,
  Cpu,
  Layers,
  CheckCircle2
} from "lucide-react";

const STREAMS = [
  {
    id: "cs",
    name: "Computer Science & IT",
    icon: "💻",
    defaultMajor: "B.Tech Computer Science & Engineering",
    presets: [
      { name: "Data Structures & Algorithms", code: "CS201", color: "indigo", target_grade: "A+" },
      { name: "Database Management Systems", code: "CS202", color: "emerald", target_grade: "A" },
      { name: "Operating Systems", code: "CS203", color: "amber", target_grade: "A" },
      { name: "Computer Networks", code: "CS204", color: "purple", target_grade: "A" }
    ]
  },
  {
    id: "eng",
    name: "Mechanical / Civil / Electrical",
    icon: "⚙️",
    defaultMajor: "B.Tech Mechanical Engineering",
    presets: [
      { name: "Engineering Thermodynamics", code: "ME201", color: "rose", target_grade: "A" },
      { name: "Fluid Mechanics", code: "ME202", color: "sky", target_grade: "A" },
      { name: "Mechanics of Solids", code: "ME203", color: "amber", target_grade: "B+" },
      { name: "Engineering Mathematics", code: "ME204", color: "indigo", target_grade: "A+" }
    ]
  },
  {
    id: "med",
    name: "Medicine & Life Sciences",
    icon: "🧬",
    defaultMajor: "MBBS / Pre-Med / Bio-Sciences",
    presets: [
      { name: "Human Anatomy", code: "MED101", color: "rose", target_grade: "A" },
      { name: "Human Physiology", code: "MED102", color: "emerald", target_grade: "A+" },
      { name: "Biochemistry", code: "MED103", color: "purple", target_grade: "A" },
      { name: "General Pathology", code: "MED104", color: "amber", target_grade: "A" }
    ]
  },
  {
    id: "biz",
    name: "Business, Finance & BBA",
    icon: "📈",
    defaultMajor: "Bachelor of Business Administration (BBA)",
    presets: [
      { name: "Financial Accounting", code: "BBA101", color: "emerald", target_grade: "A+" },
      { name: "Microeconomics", code: "BBA102", color: "indigo", target_grade: "A" },
      { name: "Principles of Marketing", code: "BBA103", color: "amber", target_grade: "A" },
      { name: "Business Statistics", code: "BBA104", color: "sky", target_grade: "A" }
    ]
  },
  {
    id: "school",
    name: "High School / Pre-University",
    icon: "📚",
    defaultMajor: "Senior High School (Science Stream)",
    presets: [
      { name: "Physics", code: "PHY12", color: "indigo", target_grade: "A+" },
      { name: "Chemistry", code: "CHEM12", color: "rose", target_grade: "A" },
      { name: "Mathematics", code: "MATH12", color: "emerald", target_grade: "A+" },
      { name: "Biology", code: "BIO12", color: "teal", target_grade: "A" }
    ]
  },
  {
    id: "custom",
    name: "Other Specialized Studies",
    icon: "🎓",
    defaultMajor: "General Higher Education",
    presets: [
      { name: "Core Module 1", code: "MOD1", color: "indigo", target_grade: "A" },
      { name: "Core Module 2", code: "MOD2", color: "emerald", target_grade: "A" },
      { name: "Elective Subject", code: "ELEC1", color: "amber", target_grade: "A" }
    ]
  }
];

const COLORS = ["indigo", "emerald", "amber", "rose", "sky", "purple", "teal"];

export default function OnboardingWizard() {
  const { user, setUser } = useAuth();
  const { triggerRefresh } = useApp();

  const [step, setStep] = useState(1);
  const [selectedStream, setSelectedStream] = useState("cs");
  const [major, setMajor] = useState("B.Tech Computer Science & Engineering");
  const [academicLevel, setAcademicLevel] = useState("Undergraduate");
  const [academicYear, setAcademicYear] = useState("3rd Year");
  const [studyHours, setStudyHours] = useState(3.0);

  // Step 2: Subjects
  const [subjects, setSubjects] = useState(STREAMS[0].presets);
  const [newSubName, setNewSubName] = useState("");
  const [newSubCode, setNewSubCode] = useState("");
  const [newSubColor, setNewSubColor] = useState("indigo");
  const [newSubGrade, setNewSubGrade] = useState("A");

  // Step 3: Initial Exam
  const [hasExam, setHasExam] = useState(true);
  const [examSubject, setExamSubject] = useState("");
  const [examName, setExamName] = useState("Mid-Semester Examination");
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().split("T")[0];
  });
  const [targetScore, setTargetScore] = useState(85);

  // Loading & Generating state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [error, setError] = useState("");

  const handleStreamSelect = (stream) => {
    setSelectedStream(stream.id);
    setMajor(stream.defaultMajor);
    setSubjects(stream.presets);
    if (stream.presets.length > 0) {
      setExamSubject(stream.presets[0].name);
    }
  };

  const handleAddSubject = () => {
    if (!newSubName.trim()) return;
    setSubjects([
      ...subjects,
      {
        name: newSubName.trim(),
        code: newSubCode.trim() || null,
        color: newSubColor,
        target_grade: newSubGrade
      }
    ]);
    if (!examSubject) {
      setExamSubject(newSubName.trim());
    }
    setNewSubName("");
    setNewSubCode("");
  };

  const handleRemoveSubject = (idx) => {
    const updated = subjects.filter((_, i) => i !== idx);
    setSubjects(updated);
    if (updated.length > 0 && (!examSubject || examSubject === subjects[idx]?.name)) {
      setExamSubject(updated[0].name);
    }
  };

  const handleComplete = async () => {
    if (subjects.length === 0) {
      setError("Please add at least one subject to set up your workspace.");
      return;
    }
    setError("");
    setIsGenerating(true);

    const steps = [
      "Agent Orchestrator configuring personalized student ecosystem...",
      "Subject Manager structuring enrolled courses & grading targets...",
      "Exam Agent calculating urgency matrix & countdown clocks...",
      "Study Planner Agent synthesizing adaptive daily roadmap...",
      "Tutor & Quiz Agents standing by for grounded RAG assistance..."
    ];

    let currentS = 0;
    const interval = setInterval(() => {
      currentS++;
      if (currentS < steps.length) {
        setGenerationStep(currentS);
      }
    }, 700);

    try {
      const payload = {
        academic_level: academicLevel,
        program_or_major: major,
        academic_year: academicYear,
        daily_study_hours: parseFloat(studyHours),
        subjects: subjects.map((s) => ({
          name: s.name,
          code: s.code || null,
          color: s.color || "indigo",
          target_grade: s.target_grade || "A"
        })),
        initial_exam: hasExam && examSubject ? {
          subject_name: examSubject,
          exam_name: examName,
          exam_date: examDate,
          target_score: parseInt(targetScore, 10)
        } : null
      };

      const res = await api.completeOnboarding(payload);
      clearInterval(interval);

      // Update AuthContext user state
      const updatedUser = {
        ...user,
        preferences: {
          ...(user?.preferences || {}),
          onboarding_completed: true,
          program_or_major: major,
          academic_level: academicLevel,
          academic_year: academicYear
        }
      };
      setUser(updatedUser);
      triggerRefresh();
    } catch (err) {
      clearInterval(interval);
      setIsGenerating(false);
      setError(err.message || "Failed to complete onboarding. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl w-full relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-500/30 text-white mb-1">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Welcome, {user?.full_name || "Student"}!
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Let's personalize your AI study assistant. Tell us what you're studying so our 10 AI agents can generate your customized workspace.
          </p>
        </div>

        {/* Wizard Container Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Step Indicator */}
          {!isGenerating && (
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
              {[
                { num: 1, title: "Academic Program", icon: BookOpen },
                { num: 2, title: "Your Subjects", icon: Layers },
                { num: 3, title: "Exams & Routine", icon: Target }
              ].map((s) => {
                const Icon = s.icon;
                const isCurrent = step === s.num;
                const isDone = step > s.num;
                return (
                  <div key={s.num} className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : isCurrent
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/40"
                          : "bg-slate-800 text-slate-500 border border-slate-700/60"
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
                    </div>
                    <span
                      className={`hidden sm:inline text-xs font-semibold ${
                        isCurrent ? "text-white" : isDone ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* GENERATING SCREEN */}
          {isGenerating ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                <BrainCircuit className="w-8 h-8 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-base font-bold text-white">Synthesizing Your AI Workspace</h3>
                <p className="text-xs text-indigo-300 font-mono transition-all duration-300">
                  {
                    [
                      "Agent Orchestrator configuring personalized student ecosystem...",
                      "Subject Manager structuring enrolled courses & grading targets...",
                      "Exam Agent calculating urgency matrix & countdown clocks...",
                      "Study Planner Agent synthesizing adaptive daily roadmap...",
                      "Tutor & Quiz Agents standing by for grounded RAG assistance..."
                    ][generationStep]
                  }
                </p>
              </div>
              <div className="w-full max-w-xs bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (generationStep + 1) * 25)}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: ACADEMIC PROGRAM */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-white mb-1">What is your field of study?</h2>
                    <p className="text-xs text-slate-400">
                      Select your general field to preload relevant course templates.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {STREAMS.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleStreamSelect(st)}
                        className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                          selectedStream === st.id
                            ? "bg-indigo-600/20 border-indigo-500/80 shadow-md shadow-indigo-600/10 ring-1 ring-indigo-500"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        <span className="text-xl">{st.icon}</span>
                        <span className="text-xs font-bold leading-tight text-white">{st.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Degree / Program Name
                      </label>
                      <input
                        type="text"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        placeholder="e.g. B.Tech Computer Science, BBA, Class 12 Science"
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Academic Level
                        </label>
                        <select
                          value={academicLevel}
                          onChange={(e) => setAcademicLevel(e.target.value)}
                          className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Undergraduate">Undergraduate (College)</option>
                          <option value="Postgraduate">Postgraduate (Masters/PhD)</option>
                          <option value="High School">High School / K-12</option>
                          <option value="Professional Exam">Competitive / Professional</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Current Year / Grade
                        </label>
                        <select
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="1st Year">1st Year / Freshman</option>
                          <option value="2nd Year">2nd Year / Sophomore</option>
                          <option value="3rd Year">3rd Year / Junior</option>
                          <option value="Final Year">Final Year / Senior</option>
                          <option value="Grade 11">Grade 11</option>
                          <option value="Grade 12">Grade 12</option>
                          <option value="Entrance Exam">Aspirant / Preparatory</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Daily Study Time
                        </label>
                        <select
                          value={studyHours}
                          onChange={(e) => setStudyHours(e.target.value)}
                          className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="1.5">1.5 hours / day</option>
                          <option value="3.0">3.0 hours / day</option>
                          <option value="4.5">4.5 hours / day</option>
                          <option value="6.0">6+ hours / day (Intensive)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>Next: Add Your Subjects</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ENROLLED SUBJECTS */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-white mb-1">Confirm your enrolled subjects</h2>
                    <p className="text-xs text-slate-400">
                      These are the subjects our AI agents will track, generate quizzes for, and organize in your study timetable.
                    </p>
                  </div>

                  {/* Added Subjects List */}
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {subjects.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-4 text-center">
                        No subjects added yet. Add your current courses below.
                      </p>
                    ) : (
                      subjects.map((sub, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-3 h-3 rounded-full bg-${sub.color || "indigo"}-500 shadow-sm`}
                            ></span>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                {sub.name}
                                {sub.code && (
                                  <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                                    {sub.code}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-indigo-300">
                                Target Grade: {sub.target_grade || "A"}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add New Subject Form */}
                  <div className="p-3.5 bg-slate-950/50 border border-slate-800/80 rounded-2xl space-y-3">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                      + Add Subject
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <input
                        type="text"
                        placeholder="Subject Name (e.g. Organic Chemistry)"
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        className="sm:col-span-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Code (optional, e.g. CH101)"
                        value={newSubCode}
                        onChange={(e) => setNewSubCode(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">Target Grade:</span>
                        <select
                          value={newSubGrade}
                          onChange={(e) => setNewSubGrade(e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                        >
                          <option value="A+">A+ (Distinction)</option>
                          <option value="A">A (Excellent)</option>
                          <option value="B+">B+ (Very Good)</option>
                          <option value="B">B (Good)</option>
                          <option value="Pass">Pass</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddSubject}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Course</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (subjects.length === 0) {
                          setError("Please add at least one subject.");
                          return;
                        }
                        setError("");
                        if (!examSubject && subjects.length > 0) {
                          setExamSubject(subjects[0].name);
                        }
                        setStep(3);
                      }}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>Next: Upcoming Exam</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: EXAM & TARGET GOAL */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-white mb-1">Set your upcoming exam target</h2>
                    <p className="text-xs text-slate-400">
                      Our Exam Agent and Recommendation Agent use your exam date to calculate study urgency and distribute daily study hours.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <input
                      type="checkbox"
                      id="hasExam"
                      checked={hasExam}
                      onChange={(e) => setHasExam(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-700 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="hasExam" className="text-xs text-slate-300 font-medium cursor-pointer">
                      I have an upcoming exam scheduled in the next 1-2 months
                    </label>
                  </div>

                  {hasExam && (
                    <div className="space-y-4 p-4 bg-slate-950/40 border border-slate-800 rounded-2xl">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Exam Subject
                        </label>
                        <select
                          value={examSubject}
                          onChange={(e) => setExamSubject(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {subjects.map((s, idx) => (
                            <option key={idx} value={s.name}>
                              {s.name} {s.code ? `(${s.code})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Exam Name
                          </label>
                          <input
                            type="text"
                            value={examName}
                            onChange={(e) => setExamName(e.target.value)}
                            placeholder="e.g. Midterm 1, Final Semester Exam"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Exam Date
                          </label>
                          <input
                            type="date"
                            value={examDate}
                            onChange={(e) => setExamDate(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="font-semibold text-slate-300">Target Score Goal:</span>
                          <span className="font-mono font-bold text-indigo-400 text-sm">{targetScore}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          step="5"
                          value={targetScore}
                          onChange={(e) => setTargetScore(e.target.value)}
                          className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-300 space-y-1">
                      <p className="font-bold text-white">Ready to activate your Multi-Agent workspace?</p>
                      <p className="text-slate-400 leading-relaxed">
                        We will generate your personalized timetable, calibrate urgency scores, and setup RAG doubt solving for {subjects.length} subjects.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleComplete}
                      className="px-7 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-xl shadow-xl shadow-indigo-600/30 transition active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      <BrainCircuit className="w-4 h-4" />
                      <span>Build My Workspace</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
