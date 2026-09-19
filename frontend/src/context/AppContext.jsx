import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

const AppContext = createContext();

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showActivityModal, setShowActivityModal] = useState(false);

  const triggerRefresh = () => setRefreshIndex((prev) => prev + 1);

  useEffect(() => {
    if (user) {
      api
        .getSubjects()
        .then((data) => {
          setSubjects(data);
          if (data.length > 0 && !selectedSubjectId) {
            setSelectedSubjectId(data[0].id);
          }
        })
        .catch(console.error);
    } else {
      setSubjects([]);
      setSelectedSubjectId(null);
    }
  }, [user, refreshIndex]);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0] || null;

  return (
    <AppContext.Provider
      value={{
        subjects,
        selectedSubjectId,
        setSelectedSubjectId,
        selectedSubject,
        activeTab,
        setActiveTab,
        triggerRefresh,
        showActivityModal,
        setShowActivityModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);