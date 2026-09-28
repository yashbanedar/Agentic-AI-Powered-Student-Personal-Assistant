import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { useLanguage } from "../../context/LanguageContext";
import { api } from "../../services/api";
import LanguageSelector from "../common/LanguageSelector";
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
  BrainCircuit
} from "lucide-react";

// Expanded universal streams supporting Standard 1st to PhD and Competitive Exams
const STREAMS = [
  // 1. Primary School (1st to 5th)
  {
    id: "primary",
    level: "primary",
    name: "Class 1st - 5th (Primary School)",
    nameHi: "कक्षा 1 से 5 (प्राथमिक विद्यालय)",
    nameMr: "इयत्ता १ ली ते ५ वी (प्राथमिक शाळा)",
    icon: "🎒",
    badge: "Std 1st - 5th",
    defaultMajor: "Primary School (Class 1-5)",
    defaultYear: "Primary Standard",
    presets: [
      { name: "Mathematics & Numbers", code: "MATH-P", color: "indigo", target_grade: "A+" },
      { name: "Environmental Studies (EVS)", code: "EVS-P", color: "emerald", target_grade: "A" },
      { name: "English Language & Phonics", code: "ENG-P", color: "amber", target_grade: "A+" },
      { name: "General Science & Nature", code: "SCI-P", color: "sky", target_grade: "A" }
    ]
  },
  // 2. Middle School (6th to 8th)
  {
    id: "middle",
    level: "middle",
    name: "Class 6th - 8th (Middle School)",
    nameHi: "कक्षा 6 से 8 (उच्च प्राथमिक / मिडिल)",
    nameMr: "इयत्ता ६ वी ते ८ वी (पूर्व माध्यमिक)",
    icon: "📘",
    badge: "Std 6th - 8th",
    defaultMajor: "Middle School (Class 6-8)",
    defaultYear: "8th Standard",
    presets: [
      { name: "General Science", code: "SCI-M", color: "emerald", target_grade: "A" },
      { name: "Mathematics (Algebra & Geometry)", code: "MATH-M", color: "indigo", target_grade: "A+" },
      { name: "Social Science (History, Civics, Geography)", code: "SST-M", color: "amber", target_grade: "A" },
      { name: "English & Communication", code: "ENG-M", color: "purple", target_grade: "A" }
    ]
  },
  // 3. Secondary School (9th & 10th Board)
  {
    id: "secondary",
    level: "secondary",
    name: "Class 9th & 10th (10th Board / SSC / CBSE)",
    nameHi: "कक्षा 9 और 10 (10वीं बोर्ड / SSC / CBSE)",
    nameMr: "इयत्ता ९ वी व १० वी (१० वी बोर्ड / SSC / CBSE)",
    icon: "📚",
    badge: "10th Board",
    defaultMajor: "10th Board Examination (CBSE / State / ICSE)",
    defaultYear: "10th Standard",
    presets: [
      { name: "Science & Technology (Physics, Chem, Bio)", code: "SCI-10", color: "emerald", target_grade: "A+" },
      { name: "Mathematics (Part 1 & 2)", code: "MATH-10", color: "indigo", target_grade: "A+" },
      { name: "Social Sciences (History, Pol Sci, Geography)", code: "SST-10", color: "amber", target_grade: "A" },
      { name: "English Language & Literature", code: "ENG-10", color: "purple", target_grade: "A" }
    ]
  },
  // 4. Higher Secondary Science (11th & 12th HSC)
  {
    id: "hsc_science",
    level: "higher_secondary",
    name: "Class 11th & 12th (HSC Science / Pre-Uni)",
    nameHi: "कक्षा 11 और 12 (12वीं विज्ञान / HSC Science)",
    nameMr: "इयत्ता ११ वी व १२ वी (१२ वी विज्ञान / HSC Science)",
    icon: "🔬",
    badge: "11th-12th Science",
    defaultMajor: "12th Higher Secondary (Science Stream)",
    defaultYear: "12th Standard",
    presets: [
      { name: "Physics", code: "PHY12", color: "indigo", target_grade: "A+" },
      { name: "Chemistry", code: "CHEM12", color: "rose", target_grade: "A" },
      { name: "Mathematics", code: "MATH12", color: "emerald", target_grade: "A+" },
      { name: "Biology / Computer Science", code: "BIO12", color: "teal", target_grade: "A" }
    ]
  },
  // 5. Higher Secondary Commerce & Arts
  {
    id: "hsc_commerce",
    level: "higher_secondary",
    name: "Class 11th & 12th (HSC Commerce / Arts)",
    nameHi: "कक्षा 11 और 12 (वाणिज्य एवं कला / Commerce & Arts)",
    nameMr: "इयत्ता ११ वी व १२ वी (वाणिज्य व कला / Commerce & Arts)",
    icon: "📊",
    badge: "11th-12th Comm/Arts",
    defaultMajor: "12th Higher Secondary (Commerce / Arts)",
    defaultYear: "12th Standard",
    presets: [
      { name: "Book Keeping & Accountancy", code: "ACC12", color: "emerald", target_grade: "A+" },
      { name: "Economics", code: "ECO12", color: "indigo", target_grade: "A" },
      { name: "Organization of Commerce / History", code: "OCM12", color: "amber", target_grade: "A" },
      { name: "Secretarial Practice / Mathematics", code: "SP12", color: "sky", target_grade: "A" }
    ]
  },
  // 6. Computer Science & IT (B.Tech / BCA)
  {
    id: "cs",
    level: "undergraduate",
    name: "Computer Science & Engineering (B.Tech / BCA)",
    nameHi: "कंप्यूटर साइंस एवं इंजीनियरिंग (B.Tech / BCA)",
    nameMr: "संगणक अभियांत्रिकी आणि माहिती तंत्रज्ञान (B.Tech / BCA)",
    icon: "💻",
    badge: "B.Tech CSE",
    defaultMajor: "B.Tech Computer Science & Engineering",
    defaultYear: "3rd Year",
    presets: [
      { name: "Data Structures & Algorithms", code: "CS201", color: "indigo", target_grade: "A+" },
      { name: "Database Management Systems", code: "CS202", color: "emerald", target_grade: "A" },
      { name: "Operating Systems", code: "CS203", color: "amber", target_grade: "A" },
      { name: "Computer Networks", code: "CS204", color: "purple", target_grade: "A" }
    ]
  },
  // 7. Mechanical / Civil / Electrical Engineering
  {
    id: "eng",
    level: "undergraduate",
    name: "Mechanical / Civil / Electrical Engineering",
    nameHi: "मैकेनिकल / सिविल / इलेक्ट्रिकल इंजीनियरिंग",
    nameMr: "यांत्रिक / स्थापत्य / विद्युत अभियांत्रिकी",
    icon: "⚙️",
    badge: "B.Tech Core",
    defaultMajor: "B.Tech Mechanical / Civil Engineering",
    defaultYear: "2nd Year",
    presets: [
      { name: "Engineering Thermodynamics", code: "ME201", color: "rose", target_grade: "A" },
      { name: "Fluid Mechanics", code: "ME202", color: "sky", target_grade: "A" },
      { name: "Mechanics of Solids", code: "ME203", color: "amber", target_grade: "B+" },
      { name: "Engineering Mathematics", code: "ME204", color: "indigo", target_grade: "A+" }
    ]
  },
  // 8. Medicine & Life Sciences (MBBS / B.Sc)
  {
    id: "med",
    level: "undergraduate",
    name: "Medicine & Life Sciences (MBBS / Pharmacy)",
    nameHi: "चिकित्सा एवं जीवन विज्ञान (MBBS / Pharmacy)",
    nameMr: "वैद्यकीय आणि जीवशास्त्र (MBBS / B.Pharm)",
    icon: "🧬",
    badge: "MBBS / Pre-Med",
    defaultMajor: "MBBS / Bio-Sciences & Medicine",
    defaultYear: "2nd Prof",
    presets: [
      { name: "Human Anatomy", code: "MED101", color: "rose", target_grade: "A" },
      { name: "Human Physiology", code: "MED102", color: "emerald", target_grade: "A+" },
      { name: "Biochemistry", code: "MED103", color: "purple", target_grade: "A" },
      { name: "General Pathology", code: "MED104", color: "amber", target_grade: "A" }
    ]
  },
  // 9. MPSC (Maharashtra Public Service Commission)
  {
    id: "mpsc",
    level: "competitive",
    name: "MPSC (महाराष्ट्र राज्यसेवा, PSI, STI, गट ब/क)",
    nameHi: "MPSC (महाराष्ट्र राज्यसेवा, PSI, STI परीक्षा)",
    nameMr: "MPSC (महाराष्ट्र राज्यसेवा, PSI, STI, ASO, गट ब व क)",
    icon: "🏛️",
    badge: "MPSC Aspirant",
    defaultMajor: "MPSC State Services & Combined Group B/C",
    defaultYear: "Aspirant Track",
    presets: [
      { name: "भारतीय राज्यघटना व राज्यव्यवस्था (Polity)", code: "MPSC-POL", color: "indigo", target_grade: "A+" },
      { name: "महाराष्ट्राचा इतिहास व भूगोल (History & Geo)", code: "MPSC-HG", color: "amber", target_grade: "A" },
      { name: "चालू घडामोडी व सामान्य विज्ञान (CA & Science)", code: "MPSC-SCI", color: "emerald", target_grade: "A+" },
      { name: "CSAT, गणित व बुद्धिमत्ता चाचणी (Mental Ability)", code: "MPSC-CSAT", color: "purple", target_grade: "A+" }
    ]
  },
  // 10. UPSC Civil Services (IAS / IPS / IFS)
  {
    id: "upsc",
    level: "competitive",
    name: "UPSC Civil Services (IAS, IPS, IFS)",
    nameHi: "UPSC सिविल सेवा (IAS, IPS, IFS परीक्षा)",
    nameMr: "UPSC नागरी सेवा (IAS, IPS, IFS परीक्षा)",
    icon: "🎯",
    badge: "UPSC CSE",
    defaultMajor: "UPSC Civil Services Examination (CSE)",
    defaultYear: "Prelims & Mains Track",
    presets: [
      { name: "General Studies I (History, Art & Geo)", code: "UPSC-GS1", color: "amber", target_grade: "A+" },
      { name: "General Studies II (Polity, Governance, IR)", code: "UPSC-GS2", color: "indigo", target_grade: "A+" },
      { name: "General Studies III (Economy, Tech & Env)", code: "UPSC-GS3", color: "emerald", target_grade: "A+" },
      { name: "General Studies IV & CSAT (Ethics & Aptitude)", code: "UPSC-GS4", color: "purple", target_grade: "A+" }
    ]
  },
  // 11. Engineering & Medical Entrance (JEE / NEET / MHT-CET)
  {
    id: "jee_neet",
    level: "competitive",
    name: "JEE Main / NEET-UG / MHT-CET Entrances",
    nameHi: "JEE Main / NEET / MHT-CET प्रवेश परीक्षा",
    nameMr: "JEE Main / NEET-UG / MHT-CET प्रवेश परीक्षा",
    icon: "🚀",
    badge: "JEE / NEET",
    defaultMajor: "National & State Engineering/Medical Entrances",
    defaultYear: "Entrance Aspirant",
    presets: [
      { name: "Mechanics & Modern Physics", code: "ENT-PHY", color: "indigo", target_grade: "A+" },
      { name: "Organic, Physical & Inorganic Chemistry", code: "ENT-CHEM", color: "rose", target_grade: "A+" },
      { name: "Calculus & Algebra / Human Physiology", code: "ENT-CORE", color: "emerald", target_grade: "A+" },
      { name: "PYQ High-Yield Test Series", code: "ENT-PYQ", color: "purple", target_grade: "A+" }
    ]
  },
  // 12. Ph.D. & Doctoral Research Scholar
  {
    id: "phd",
    level: "phd",
    name: "Doctorate / Ph.D. (Research Scholar)",
    nameHi: "विद्यावाचस्पति / पीएचडी (शोधार्थी / रिसर्च स्कॉलर)",
    nameMr: "विद्यावाचस्पती / पीएचडी (संशोधक विद्यार्थी)",
    icon: "🔍",
    badge: "Ph.D. Scholar",
    defaultMajor: "Doctor of Philosophy (Ph.D.) Research",
    defaultYear: "Doctoral Candidate",
    presets: [
      { name: "Research Methodology & Design", code: "PHD901", color: "indigo", target_grade: "A+" },
      { name: "Literature Review & Meta-Analysis", code: "PHD902", color: "emerald", target_grade: "A+" },
      { name: "Statistical Modeling & Empirical Tools", code: "PHD903", color: "amber", target_grade: "A" },
      { name: "Dissertation Writing & Peer Review", code: "PHD904", color: "purple", target_grade: "A+" }
    ]
  },
  // 13. Other Specialized Studies
  {
    id: "custom",
    level: "undergraduate",
    name: "Other Custom / Specialized Studies",
    nameHi: "अन्य विशिष्ट अध्ययन / कस्टम पाठ्यक्रम",
    nameMr: "इतर सानुकूल / विशेष अभ्यासक्रम",
    icon: "🎓",
    badge: "Custom Track",
    defaultMajor: "General Higher Education",
    defaultYear: "Current Year",
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
  const { t, language, setStudentLevel } = useLanguage();

  const [step, setStep] = useState(1);
  const [selectedStream, setSelectedStream] = useState("cs");
  const [major, setMajor] = useState("B.Tech Computer Science & Engineering");
  const [academicLevel, setAcademicLevel] = useState("undergraduate");
  const [academicYear, setAcademicYear] = useState("3rd Year");
  const [studyHours, setStudyHours] = useState(3.0);

  // Step 2: Subjects
  const [subjects, setSubjects] = useState(STREAMS.find(s => s.id === "cs").presets);
  const [newSubName, setNewSubName] = useState("");
  const [newSubCode, setNewSubCode] = useState("");
  const [newSubColor, setNewSubColor] = useState("indigo");
  const [newSubGrade, setNewSubGrade] = useState("A");

  // Step 3: Initial Exam
  const [hasExam, setHasExam] = useState(true);
  const [examSubject, setExamSubject] = useState("");
  const [examName, setExamName] = useState("Semester / Target Examination");
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
    setAcademicLevel(stream.level);
    setAcademicYear(stream.defaultYear);
    setSubjects(stream.presets);
    setStudentLevel(stream.level);
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
      language === "hi" 
        ? "एजेंट ऑर्केस्ट्रेटर आपका व्यक्तिगत छात्र परिवेश तैयार कर रहा है..." 
        : language === "mr" 
        ? "एआय ऑर्केस्ट्रेटर तुमचा वैयक्तिक अभ्यास कक्ष तयार करत आहे..." 
        : "Agent Orchestrator configuring personalized student ecosystem...",
      
      language === "hi" 
        ? "विषय प्रबंधक आपके नामांकित विषयों और ग्रेड लक्ष्यों को व्यवस्थित कर रहा है..." 
        : language === "mr" 
        ? "विषय व्यवस्थापक नोंदणीकृत विषय आणि ध्येय गुण ठरवत आहे..." 
        : "Subject Manager structuring enrolled courses & grading targets...",
      
      language === "hi" 
        ? "परीक्षा एजेंट काउंटडाउन और तात्कालिकता स्कोर की गणना कर रहा है..." 
        : language === "mr" 
        ? "परीक्षा एजंट अंतिम मुदत आणि काउंटडाउन घड्याळांचे नियोजन करत आहे..." 
        : "Exam Agent calculating urgency matrix & countdown clocks...",
      
      language === "hi" 
        ? "स्टडी प्लानर एजेंट अनुकूलित दैनिक अध्ययन समय-सारणी बना रहा है..." 
        : language === "mr" 
        ? "स्टडी प्लॅनर एजंट अनुकूलित दैनिक अभ्यास सत्रे तयार करत आहे..." 
        : "Study Planner Agent synthesizing adaptive daily roadmap...",
      
      language === "hi" 
        ? "ट्यूटर एवं क्विज़ एजंट्स संदर्भ सहित सहायता के लिए तैयार हैं..." 
        : language === "mr" 
        ? "ट्यूटर आणि चाचणी एजंट्स शंका निरसनासाठी सज्ज आहेत..." 
        : "Tutor & Quiz Agents standing by for grounded RAG assistance..."
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

      await api.completeOnboarding(payload);
      clearInterval(interval);

      // Update AuthContext user state & LanguageContext level
      setStudentLevel(academicLevel);
      const updatedUser = {
        ...user,
        preferences: {
          ...(user?.preferences || {}),
          onboarding_completed: true,
          program_or_major: major,
          academic_level: academicLevel,
          academic_year: academicYear,
          language: language
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

  const getStreamTitle = (stream) => {
    if (language === "hi" && stream.nameHi) return stream.nameHi;
    if (language === "mr" && stream.nameMr) return stream.nameMr;
    return stream.name;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-200">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar with Language Selector */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-white">{t("brand.name", "Student AI")}</span>
        </div>
        <LanguageSelector compact={false} />
      </div>

      <div className="max-w-4xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Wizard Header */}
        <div className="text-center space-y-2 pb-2 border-b border-slate-800/80">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("onboarding.badge", "One-Time Fast Setup")} • Std 1st to Ph.D. & Competitive</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {t("onboarding.title", "Configure Your Personal AI Student Assistant")}
          </h1>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            {t("onboarding.subtitle", "Tailored for any academic stage: Standard 1st, 10th Board, College, Ph.D. or Competitive Exams (UPSC, MPSC, JEE, NEET).")}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between max-w-md mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                step === s
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-4 ring-slate-900"
                  : step > s
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* =========================================================================
            STEP 1: Stream & Degree Configuration (Std 1st to PhD & Competitive)
           ========================================================================= */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                {t("onboarding.step1Title", "Academic Profile & Level")}
              </h2>
              <p className="text-xs text-slate-400">
                {t("onboarding.step1Desc", "Select your educational level and study goal")}
              </p>
            </div>

            {/* Stream Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                {t("onboarding.streamSelectLabel", "Select Curriculum or Exam Stream")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {STREAMS.map((st) => {
                  const isSelected = selectedStream === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleStreamSelect(st)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? "bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500 text-white shadow-md shadow-indigo-600/20"
                          : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-2xl shrink-0 mt-0.5">{st.icon}</span>
                      <div className="overflow-hidden">
                        <div className="font-bold text-xs truncate">{getStreamTitle(st)}</div>
                        <div className="text-[10px] text-indigo-400 font-semibold">{st.badge}</div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {st.presets.length} {t("nav.subjects", "Subjects")}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Program / Class & Daily Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t("onboarding.programLabel", "Class / Degree / Exam Target")}
                </label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t("onboarding.hoursLabel", "Daily Planned Study Hours")}: <strong className="text-indigo-400">{studyHours} {t("onboarding.hoursValue", "hrs / day")}</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={studyHours}
                  onChange={(e) => setStudyHours(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer mt-2"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <span>{t("onboarding.nextStep", "Continue")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: Subjects & Target Scores
           ========================================================================= */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                {t("onboarding.step2Title", "Courses & Subjects")}
              </h2>
              <p className="text-xs text-slate-400">
                {t("onboarding.step2Desc", "Configure enrolled subjects and target scores")}
              </p>
            </div>

            {/* Subject List */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                {t("onboarding.subjectsTitle", "Enrolled Subjects & Topics")} ({subjects.length})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {subjects.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="overflow-hidden">
                      <div className="font-semibold text-xs text-white truncate">{s.name}</div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        {s.code && <span className="font-mono bg-slate-700 px-1 rounded">{s.code}</span>}
                        <span>{t("common.grade", "Grade")}: <strong className="text-emerald-400">{s.target_grade}</strong></span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      title={t("common.delete", "Delete")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Custom Subject */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-400" /> {t("onboarding.addSubject", "Add Subject")}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder={t("onboarding.subjectNamePlaceholder", "Subject Name")}
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="sm:col-span-6 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder={t("onboarding.subjectCodePlaceholder", "Code (Optional)")}
                  value={newSubCode}
                  onChange={(e) => setNewSubCode(e.target.value)}
                  className="sm:col-span-3 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <select
                  value={newSubGrade}
                  onChange={(e) => setNewSubGrade(e.target.value)}
                  className="sm:col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="A+">A+ (90%+)</option>
                  <option value="A">A (80%+)</option>
                  <option value="B+">B+ (70%+)</option>
                  <option value="B">B (60%+)</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="sm:col-span-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t("onboarding.prevStep", "Back")}</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <span>{t("onboarding.nextStep", "Continue")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: Exam Target & Launch
           ========================================================================= */}
        {step === 3 && !isGenerating && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-400" />
                {t("onboarding.step3Title", "Exam & Deadlines")}
              </h2>
              <p className="text-xs text-slate-400">
                {t("onboarding.step3Desc", "Set your target exam for countdown and roadmap")}
              </p>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  {t("onboarding.hasExamPrompt", "Do you have an upcoming exam or test to prepare for?")}
                </span>
                <input
                  type="checkbox"
                  checked={hasExam}
                  onChange={(e) => setHasExam(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </div>

              {hasExam && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      {t("nav.subjects", "Subject")}
                    </label>
                    <select
                      value={examSubject}
                      onChange={(e) => setExamSubject(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {subjects.map((sub, i) => (
                        <option key={i} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      {t("nav.exams", "Exam Name")}
                    </label>
                    <input
                      type="text"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      placeholder={t("onboarding.examNamePlaceholder", "Exam Name")}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      {t("onboarding.examDateLabel", "Exam Date")}
                    </label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      {t("onboarding.targetScoreLabel", "Target Score (%)")}: <strong className="text-emerald-400">{targetScore}%</strong>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={targetScore}
                      onChange={(e) => setTargetScore(e.target.value)}
                      className="w-full accent-indigo-500 cursor-pointer mt-2"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t("onboarding.prevStep", "Back")}</span>
              </button>
              <button
                type="button"
                onClick={handleComplete}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t("onboarding.finishSetup", "Launch My AI Workspace")}</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            Generating Loading Animation State
           ========================================================================= */}
        {isGenerating && (
          <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-300">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
              <BrainCircuit className="w-7 h-7 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="font-bold text-base text-white">
                {t("onboarding.generatingWorkspace", "Configuring personalized student ecosystem...")}
              </h3>
              <p className="text-xs text-indigo-300 font-mono">
                {generationStep === 0 && "Agent Orchestrator configuring personalized student ecosystem..."}
                {generationStep === 1 && "Subject Manager structuring enrolled courses & grading targets..."}
                {generationStep === 2 && "Exam Agent calculating urgency matrix & countdown clocks..."}
                {generationStep === 3 && "Study Planner Agent synthesizing adaptive daily roadmap..."}
                {generationStep >= 4 && "Tutor & Quiz Agents standing by for grounded RAG assistance..."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
