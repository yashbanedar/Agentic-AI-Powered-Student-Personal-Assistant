# Agentic AI-Powered Student Personal Assistant

A full-stack, production-grade agentic educational web platform that helps students analyze study materials, plan preparation roadmaps adaptively, identify high-yield exam topics from PYQs, practice targeted quizzes, solve doubts with grounded RAG citations, and diagnose weak topics.

---

## 🌟 10-Agent Multi-Agent Ecosystem

1. **Document Agent:** Extracts text from multi-format files (**PDF, PPT/PPTX, DOC/DOCX, TXT/Notes**), creates semantic overlapping chunks, and prepares vector indexes for RAG doubt solving.
2. **Syllabus Agent:** Parses syllabi into structured Units/Modules and Topics, assigns estimated study hours and difficulty levels.
3. **PYQ Agent:** Analyzes Previous Year Question papers to compute historical topic frequency, marks distribution, and flag "Must-Know" questions.
4. **Exam Agent:** Manages exam dates, computes live days & hours countdowns, and calculates preparation urgency scores.
5. **Study Planner Agent:** Synthesizes exam urgency, syllabus weightage, and weak areas into an adaptive day-by-day plan (Morning, Afternoon, Evening slots).
6. **Tutor Agent:** Answers student doubts using grounded RAG chunk retrieval, returning step-by-step explanations, citations (Document Name, Page/Slide, Snippet), and conceptual follow-up questions.
7. **Quiz Agent:** Generates customized MCQs with 4 options, correct answer keys, and detailed explanations.
8. **Evaluation Agent:** Grades tests, tracks topic-by-topic accuracy, and flags topics with `<60%` accuracy as "Weak Topics".
9. **Recommendation Agent:** Answers the primary question: **“What should I study now?”** using multi-factor decision weighting (Exam Urgency × PYQ Frequency × Topic Weakness).
10. **Agent Orchestrator:** Coordinates all agents, triggers downstream workflows upon actions, and records real-time logs to the **Live AI Activity Stream**.

---

## 💻 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons.
- **Backend:** Python FastAPI, Uvicorn, SQLAlchemy 2.0 ORM, Pydantic V2, Python-Jose (JWT Auth), PBKDF2 Password Hashing.
- **File Processors:** `pypdf`, `python-docx`, `python-pptx`.
- **Database:** PostgreSQL with auto-fallback to SQLite for zero-downtime execution.
- **AI & RAG:** Built-in intelligent multi-agent semantic engine + Google Gemini & OpenAI API support.

---

## 🚀 Running the Application

### Option 1: Quick Start (Windows)
Double click `start_servers.bat` in the project root:
```cmd
start_servers.bat
```

### Option 2: Manual Start

**Backend (Terminal 1):**
```cmd
cd backend
venv\Scripts\activate
python -m uvicorn main:app --host 127.0.0.1 --port 8005 --reload
```
API Documentation: [http://localhost:8005/docs](http://localhost:8005/docs)

**Frontend (Terminal 2):**
```cmd
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
Access Frontend at: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Demo Access
On the Login screen, click **“1-Click Demo Student Login”** to immediately load the pre-configured academic profile with demo subjects, syllabus, exams, notes, and activity feed!