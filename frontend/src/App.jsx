import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider, useApp } from "./context/AppContext";
import Layout from "./components/layout/Layout";
import LoginRegister from "./pages/LoginRegister";
import OnboardingWizard from "./components/onboarding/OnboardingWizard";

import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import StudyMaterials from "./pages/StudyMaterials";
import Syllabus from "./pages/Syllabus";
import ExamTimetable from "./pages/ExamTimetable";
import StudyRoadmap from "./pages/StudyRoadmap";
import AINotes from "./pages/AINotes";
import PYQAnalysis from "./pages/PYQAnalysis";
import Quizzes from "./pages/Quizzes";
import Analytics from "./pages/Analytics";
import Recommendations from "./pages/Recommendations";
import AIChat from "./pages/AIChat";
import Settings from "./pages/Settings";

function MainApp() {
  const { user, loading } = useAuth();
  const { activeTab } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono">Initializing Multi-Agent Ecosystem...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginRegister />;
  }

  const needsOnboarding = user.email !== "student@university.edu" && !user.preferences?.onboarding_completed;
  if (needsOnboarding) {
    return <OnboardingWizard />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case "dashboard": return <Dashboard />;
      case "subjects": return <Subjects />;
      case "materials": return <StudyMaterials />;
      case "syllabus": return <Syllabus />;
      case "exams": return <ExamTimetable />;
      case "roadmap": return <StudyRoadmap />;
      case "notes": return <AINotes />;
      case "pyq": return <PYQAnalysis />;
      case "quizzes": return <Quizzes />;
      case "analytics": return <Analytics />;
      case "recommendations": return <Recommendations />;
      case "chat": return <AIChat />;
      case "settings": return <Settings />;
      default: return <Dashboard />;
    }
  };

  return <Layout>{renderActivePage()}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </AuthProvider>
  );
}