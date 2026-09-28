const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.endsWith("/api/v1") ? envUrl : `${envUrl.replace(/\/$/, "")}/api/v1`;
  }
  // Use relative /api/v1 so Vite's proxy automatically routes to http://127.0.0.1:8000
  // and production FastAPI serves directly without CORS or port mismatch
  return "/api/v1";
};

const API_BASE = getApiBase();

export const getAuthToken = () => localStorage.getItem("token");
export const setAuthToken = (token) => localStorage.setItem("token", token);
export const removeAuthToken = () => localStorage.removeItem("token");

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Handle FormData vs JSON
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeAuthToken();
    window.location.reload();
    throw new Error("Session expired, please log in again.");
  }

  if (!response.ok) {
    let errorMsg = "Request failed";
    try {
      const err = await response.json();
      errorMsg = err.detail || JSON.stringify(err);
    } catch (e) {
      errorMsg = await response.text();
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email, password, full_name) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name }),
    }),
  getMe: () => request("/auth/me"),
  updateSettings: (data) =>
    request("/auth/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  completeOnboarding: (data) =>
    request("/onboarding", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Subjects
  getSubjects: () => request("/subjects/"),
  createSubject: (data) =>
    request("/subjects/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteSubject: (id) =>
    request(`/subjects/${id}`, {
      method: "DELETE",
    }),

  // Documents
  getDocuments: (subject_id = null, category = null) => {
    let url = "/documents/?";
    if (subject_id) url += `subject_id=${subject_id}&`;
    if (category) url += `category=${category}&`;
    return request(url);
  },
  uploadDocument: (formData) =>
    request("/documents/upload", {
      method: "POST",
      body: formData,
    }),
  createTextNote: (data) =>
    request("/documents/text-note", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getDocumentChunks: (id) => request(`/documents/${id}/chunks`),
  deleteDocument: (id) =>
    request(`/documents/${id}`, {
      method: "DELETE",
    }),

  // Syllabus
  getSyllabus: (subject_id) => request(`/syllabus/${subject_id}`),
  updateSyllabus: (subject_id, raw_text, title) =>
    request(`/syllabus/${subject_id}/update`, {
      method: "POST",
      body: JSON.stringify({ raw_text, title }),
    }),
  toggleTopic: (topic_id) =>
    request(`/syllabus/topic/${topic_id}/toggle`, {
      method: "POST",
    }),

  // PYQ
  getPYQ: (subject_id = null) => {
    const url = subject_id ? `/pyq/?subject_id=${subject_id}` : "/pyq/";
    return request(url);
  },
  analyzePYQ: (subject_id, text, exam_name) =>
    request("/pyq/analyze", {
      method: "POST",
      body: JSON.stringify({ subject_id, text, exam_name }),
    }),

  // Exams
  getExams: () => request("/exams/"),
  createExam: (data) =>
    request("/exams/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteExam: (id) =>
    request(`/exams/${id}`, {
      method: "DELETE",
    }),

  // Study Plan
  getTodayTasks: () => request("/study-plan/today"),
  getRoadmap: () => request("/study-plan/roadmap"),
  toggleTask: (task_id) =>
    request(`/study-plan/task/${task_id}/toggle`, {
      method: "POST",
    }),
  replan: () =>
    request("/study-plan/replan", {
      method: "POST",
    }),

  // AI Tutor RAG Chat
  askTutor: (message, subject_id = null, chat_history = [], language = "en", student_level = null) =>
    request("/tutor/chat", {
      method: "POST",
      body: JSON.stringify({ message, subject_id, chat_history, language, student_level }),
    }),

  // Quizzes
  getQuizzes: (subject_id = null) => {
    const url = subject_id ? `/quizzes/?subject_id=${subject_id}` : "/quizzes/";
    return request(url);
  },
  getQuiz: (id) => request(`/quizzes/${id}`),
  generateQuiz: (data) =>
    request("/quizzes/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  submitQuiz: (id, answers) =>
    request(`/quizzes/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
  getQuizHistory: () => request("/quizzes/attempts/history"),

  // Analytics
  getAnalytics: () => request("/analytics/summary"),

  // Recommendations
  getNextRecommendation: () => request("/recommendations/next"),

  // AI Notes
  getNotes: (subject_id = null) => {
    const url = subject_id ? `/notes/?subject_id=${subject_id}` : "/notes/";
    return request(url);
  },
  generateNote: (data) =>
    request("/notes/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // AI Activity Stream
  getActivityStream: (limit = 20) => request(`/activity/?limit=${limit}`),
};
