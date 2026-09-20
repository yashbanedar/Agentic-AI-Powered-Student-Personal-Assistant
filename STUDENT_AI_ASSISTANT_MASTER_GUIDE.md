# Agentic AI-Powered Student Personal Assistant
## Master Project Documentation & Examiner Viva Preparation Guide

---

### Executive Summary
The **Agentic AI-Powered Student Personal Assistant** is a production-grade, full-stack educational intelligence platform designed to eliminate academic study chaos, prevent ungrounded AI hallucinations, and provide adaptive, personalized guidance to students. 

Unlike standard single-prompt chatbots (e.g., asking ChatGPT generic questions), this platform utilizes a **10-Agent Multi-Agent Ecosystem** operating on **Grounded Retrieval-Augmented Generation (RAG)**. The platform analyzes a student's uploaded textbooks, syllabi, past year question papers (PYQs), and exam deadlines to dynamically answer the critical question: **"What should I study right now?"**

---

## 1. System Architecture & Infrastructure

### 1.1 High-Level Architecture
The system follows a modern decoupled client-server architecture with an integrated static serving pipeline for cloud deployment:

```
[ Client Browser ] (React 19 + Vite + Tailwind CSS v4)
         │
         │  HTTP / REST (JWT Bearer Token in Headers)
         ▼
[ FastAPI Application Server ] (Python 3.11 / Uvicorn)
         ├── Auth & Security (JWT, PBKDF2 Hashing)
         ├── 10-Agent Multi-Agent Ecosystem (Orchestrator)
         ├── Multi-Modal Ingestion Engine (PyPDF, python-docx, python-pptx)
         ├── Semantic Grounded RAG Pipeline (Chunking & Retrieval)
         └── Fallback Engine (Zero-Downtime Deterministic Algorithms)
         │
         ├── [ Database Layer ] (PostgreSQL Cloud OR SQLite Local Fallback)
         └── [ Static SPA Mount ] (Serving Compiled React Dist Assets)
```

### 1.2 Technology Stack Details

| Layer | Technologies Used | Key Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19, Vite** | Fast SPA rendering, component modularity, instant hot module replacement (HMR). |
| **Styling & Theme** | **Tailwind CSS v4, Custom CSS Variables** | Fluid design system, responsive layouts, dual Light & Dark themes with `localStorage` persistence. |
| **Icons & UI** | **Lucide React, Context API** | Modern aesthetic iconography, global state management (`AuthContext`, `AppContext`, `ThemeContext`). |
| **Backend Framework** | **Python 3.11, FastAPI, Uvicorn** | High-performance asynchronous API execution, automatic OpenAPI Swagger docs (`/docs`), Pydantic validation. |
| **Database ORM** | **SQLAlchemy 2.0** | Object-Relational Mapping, connection pooling, schema migrations, dual DB driver compatibility. |
| **Database Engines** | **PostgreSQL (Production) / SQLite3 (Development)** | Resilient storage for users, courses, documents, roadmaps, quizzes, and analytics. |
| **Document Processors** | **pypdf, python-docx, python-pptx** | Direct binary parsing and text extraction from lecture slides, textbooks, and notes. |
| **Security & Auth** | **python-jose (JWT), passlib (PBKDF2)** | Cryptographic user authentication, secure stateless session tokens, password hashing. |
| **Containerization** | **Docker (Multi-Stage Build)** | Stage 1 (Node:20-alpine) builds React assets; Stage 2 (Python:3.11-slim) serves full application. |
| **Cloud Hosting** | **Render (Web Service Blueprint)** | Automatic CI/CD deployment from GitHub `main` branch with health check endpoint (`/health`). |

---

## 2. The 10-Agent Multi-Agent Ecosystem

The intelligence of the platform is distributed across **10 specialized AI agents**. Rather than overloading a single model with conflicting instructions, each agent has a single, strictly defined responsibility:

```
                          ┌───────────────────────────┐
                          │   1. Agent Orchestrator   │
                          │   (Event Router & Logger) │
                          └─────────────┬─────────────┘
                                        │
      ┌───────────────┬─────────────────┼─────────────────┬───────────────┐
      │               │                 │                 │               │
┌─────▼─────┐   ┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐   ┌─────▼─────┐
│ 2. Doc    │   │ 3. Syllabus│    │ 4. Exam   │     │ 5. Study  │   │ 6. PYQ    │
│ Agent     │   │ Agent     │     │ Agent     │     │ Planner   │   │ Agent     │
└───────────┘   └───────────┘     └───────────┘     └───────────┘   └───────────┘
      │               │                 │                 │               │
┌─────▼─────┐   ┌─────▼─────┐     ┌─────▼─────┐           │               │
│ 7. Quiz   │   │ 8. Eval   │     │ 9. Recom- │           │               │
│ Agent     │   │ Agent     │     │ mendation │◄──────────┴───────────────┘
└───────────┘   └───────────┘     └───────────┘
      │                                 │
      └─────────────────┬───────────────┘
                        │
                  ┌─────▼─────┐
                  │ 10. Tutor │ (Grounded RAG Doubt Solver)
                  │ Agent     │
                  └───────────┘
```

### Detailed Agent Breakdown

#### 1. Agent Orchestrator (`orchestrator.py`)
- **Real-World Analogy:** *The Chief of Staff / Project Manager.*
- **Role:** Central nervous system of the platform. Whenever a student acts (uploads a file, completes a quiz, changes an exam date), the Orchestrator receives the event, triggers relevant agents in sequence, and logs the execution to the **Live AI Activity Stream**.
- **Inputs:** Student actions, database states, API events.
- **Outputs:** Event notifications, cascaded agent tasks, live activity log entries.

#### 2. Document Agent (`document_agent.py`)
- **Real-World Analogy:** *The Academic Librarian & Archival Specialist.*
- **Role:** Extracts text from multi-format files (**PDF, PPT/PPTX, DOC/DOCX, TXT**), cleans up formatting, and segments raw text into overlapping semantic chunks (500–1,000 characters with 100-character overlap) for RAG indexing.
- **Inputs:** Uploaded binary files from the user.
- **Outputs:** Extracted document metadata, normalized text chunks stored in the `document_chunks` database table.

#### 3. Syllabus Agent (`syllabus_agent.py`)
- **Real-World Analogy:** *The Dean of Academic Curriculum.*
- **Role:** Parses course outlines and curriculum PDFs into a hierarchical structure of **Units/Modules** and individual **Topics**, estimating required study hours and assigning difficulty levels.
- **Inputs:** Syllabus text, course titles.
- **Outputs:** Structured curriculum tree in `syllabus_units` and `syllabus_topics` tables.

#### 4. Exam Agent (`exam_agent.py`)
- **Real-World Analogy:** *The Countdown Clock & Deadline Strategist.*
- **Role:** Tracks exam schedules, computes live day/hour countdowns, and calculates a dynamic **Preparation Urgency Score** using the formula:
  $$\text{Urgency Score} = \min\left(100, \max\left(10, \frac{\text{Target Score} \times 10}{\max(1, \text{Days Left})}\right)\right)$$
- **Inputs:** Exam dates, target scores (e.g., 90%).
- **Outputs:** Live days left, hours left, and urgency percentages.

#### 5. Adaptive Study Planner Agent (`planner_agent.py`)
- **Real-World Analogy:** *The Personal Academic Coach & Time Manager.*
- **Role:** Synthesizes exam urgency, unmastered syllabus topics, and weak areas to generate a personalized day-by-day study schedule broken down into **Morning, Afternoon, and Evening** sessions. Features **Dynamic Rescheduling** if a student misses a session.
- **Inputs:** Target exam date, syllabus topics, past completed sessions.
- **Outputs:** Structured daily study sessions with topic targets, duration (minutes), and status flags.

#### 6. PYQ Analysis Agent (`pyq_agent.py`)
- **Real-World Analogy:** *The Exam Board Pattern Investigator.*
- **Role:** Examines past 5–10 years of university question papers. Identifies recurring questions, counts question frequency per topic, and flags **"Must-Know / High-Yield"** topics.
- **Inputs:** Uploaded PYQ PDFs and text.
- **Outputs:** High-yield topic rankings, repeat count metrics, and question weightage distribution.

#### 7. Quiz Generation Agent (`quiz_agent.py`)
- **Real-World Analogy:** *The Question Paper Creator.*
- **Role:** Generates adaptive multiple-choice questions (MCQs) complete with 4 plausible options, the correct answer index, and comprehensive explanations for every option.
- **Inputs:** Subject ID, topic name, desired question count, difficulty tier.
- **Outputs:** Interactive quiz records with questions, options, and answer keys.

#### 8. Evaluation Agent (`evaluation_agent.py`)
- **Real-World Analogy:** *The Diagnostic Examiner & Evaluator.*
- **Role:** Evaluates submitted quiz answers, calculates percentage mastery, and compares accuracy against a 60% threshold. If score on a topic is $<60\%$, the topic is immediately tagged as a **Flagged Weak Area**.
- **Inputs:** Submitted user answer indices, quiz question keys.
- **Outputs:** Score summary, percentage accuracy, flagged weak topics list, and feedback report.

#### 9. Recommendation Agent (`recommendation_agent.py`)
- **Real-World Analogy:** *The Academic GPS ("Recalculating Best Route").*
- **Role:** Answers the core question: **“What should I study now?”** Calculates a Multi-Factor Priority Weight:
  $$\text{Priority Weight} = (0.40 \times \text{Exam Urgency}) + (0.35 \times \text{PYQ Topic Weight}) + (0.25 \times \text{Weakness Metric})$$
- **Inputs:** Aggregate data from Exam Agent, PYQ Agent, and Evaluation Agent.
- **Outputs:** Top recommended task, urgency badge (High/Normal), rationale statement, and 1-click action button.

#### 10. AI Tutor Agent (`tutor_agent.py`)
- **Real-World Analogy:** *The 24/7 Grounded Personal Tutor.*
- **Role:** Provides grounded conversational doubt-solving. Performs semantic keyword and vector retrieval across uploaded course materials, returning answers strictly supported by citations (**Document Name, Page/Slide number, and exact text excerpt**).
- **Inputs:** Student question, active subject ID, conversation history.
- **Outputs:** Grounded answer, source citations list, and 3 suggested follow-up questions.

---

## 3. Grounded Retrieval-Augmented Generation (RAG) Deep Dive

### Why Standard Chatbots Fail Students:
When students ask general LLMs (like standard ChatGPT) university questions, the models frequently **hallucinate** definitions, use different notation than the student's professor, or cite non-existent theorems.

### How Our Grounded RAG Works:
1. **Document Ingestion:** When a student uploads `Unit1_DataStructures.pdf`, the `DocumentAgent` extracts the text and slices it into chunks of 500 characters with 100 characters of overlap to maintain context across boundaries.
2. **Chunk Indexing:** Each chunk is stored in the database with metadata: `document_id`, `page_number`, and `chunk_text`.
3. **Query Retrieval:** When the student asks *"Explain Dijkstra's Algorithm"*, the `TutorAgent` searches the chunks of that specific subject using semantic keyword and term-frequency scoring.
4. **Context Augmentation:** The top-matching chunks are inserted into the prompt template:
   ```
   Context from student's course textbook:
   [Doc: Algorithm_Design.pdf, Page 45]: "Dijkstra's algorithm solves the single-source shortest path..."
   
   Question: Explain Dijkstra's Algorithm.
   Rule: Answer ONLY using the context above. Provide citations.
   ```
5. **Grounded Generation & Citation:** The response includes exact citations so the student can verify the answer against their class textbook with 100% confidence.

---

## 4. Complete Feature Walkthrough

### 1. Stream-Based Onboarding Wizard
- Supports 5 academic streams:
  1. **Computer Science & IT** (DSA, DBMS, OS, Computer Networks)
  2. **Mechanical / Civil / Electrical** (Thermodynamics, Fluid Mechanics, Solid Mechanics, Math)
  3. **Medicine & Life Sciences** (Anatomy, Physiology, Biochemistry, Pathology)
  4. **Business & BBA** (Financial Accounting, Microeconomics, Marketing, Business Statistics)
  5. **High School / Pre-University** (Physics, Chemistry, Mathematics, Biology)
- Initializes pre-configured subjects, target grades, and sample roadmap in one click.

### 2. Student Dashboard
- **Hero Banner:** Displays the live recommendation from the Recommendation Agent ("What should I study now?").
- **Exam Countdowns:** Urgent deadlines highlighted in red/amber with days remaining.
- **Overall Mastery Metric:** Visual donut indicator of average test accuracy.
- **Today's Action Items:** Morning, afternoon, and evening tasks with completion checkboxes.

### 3. Study Materials Repository
- Multi-format file uploader supporting `.pdf`, `.pptx`, `.docx`, and `.txt`.
- Status indicators for text extraction, chunking, and index readiness.

### 4. Syllabus & Topic Mastery Tracker
- Unit-wise accordion breakdown.
- Topic mastery toggles allowing students to mark topics as "Mastered" or "Needs Revision".

### 5. Exam Timetable & Urgency Radar
- Exam date configuration, target score specification (e.g., 95%), and dynamic calculation of preparation urgency.

### 6. Adaptive Study Roadmap
- Displays structured daily study sessions.
- **"Reschedule Missed Sessions" Button:** Automatically reorganizes pending tasks without causing exam preparation backlog.

### 7. AI Notes & Formula Cheat Sheets
- Generates high-yield study summaries, key formulas, and cheat sheets for rapid revision before tests.

### 8. PYQ Frequency Analyzer
- Ranks exam topics by recurring frequency (e.g., "Appeared 4 times in last 3 years").
- Distinguishes between 2-mark, 5-mark, and 10-mark recurring questions.

### 9. Quizzes & Mock Test Runner
- Adaptive MCQ generator with custom question count and time limits.
- Interactive test runner with option selection, countdown clock, and immediate score diagnostics.

### 10. Performance Analytics
- Tracks study streaks, weekly study hours, and topic-by-topic accuracy meters.
- Identifies specific areas needing immediate remedial focus.

### 11. AI Tutor RAG Chat
- Interactive conversation interface with source citations and suggested follow-up questions.

### 12. Dual Theme Engine
- Polished **Light Theme** (clean slate canvas, pure white floating cards, slate-200 borders, deep slate-900 typography).
- Full **Dark Theme** with smooth transition and `localStorage` persistence.
- Sun ☀️ / Moon 🌙 toggles in Header, Sidebar, and Login screen.

---

## 5. Complete REST API Reference

All protected routes require the header: `Authorization: Bearer <access_token>`.

| Route | Method | Description | Key Request / Response |
| :--- | :---: | :--- | :--- |
| `/api/v1/auth/register` | `POST` | Register new student account | `{email, password, full_name}` -> User object & JWT |
| `/api/v1/auth/login` | `POST` | Authenticate student | `{email, password}` -> User object & JWT |
| `/api/v1/auth/me` | `GET` | Get current logged-in user profile | Requires Bearer Token -> User profile |
| `/api/v1/auth/settings` | `PUT` | Update API keys or profile details | `{gemini_api_key, openai_api_key, full_name}` |
| `/api/v1/onboarding/stream` | `POST` | Initialize stream preset subjects | `{stream_id: "cs"}` -> Created subjects |
| `/api/v1/subjects/` | `GET` | Retrieve enrolled subjects | Returns list of subjects with target grades |
| `/api/v1/subjects/` | `POST` | Create a new course/subject | `{name, code, target_grade, color}` |
| `/api/v1/documents/upload` | `POST` | Upload study file (PDF/DOCX/PPTX) | Multipart Form `file`, `subject_id` |
| `/api/v1/documents/` | `GET` | List uploaded documents | Returns document extraction status & chunks count |
| `/api/v1/syllabus/{subject_id}` | `GET` | Get unit & topic breakdown | Returns hierarchical unit/topic tree |
| `/api/v1/exams/` | `GET` | List scheduled exams & urgencies | Returns exams with calculated `days_left` |
| `/api/v1/exams/` | `POST` | Add exam target date | `{subject_id, exam_name, exam_date, target_score}` |
| `/api/v1/study-plan/today` | `GET` | Get today's scheduled sessions | Returns Morning, Afternoon, Evening sessions |
| `/api/v1/study-plan/reschedule` | `POST` | Reschedule missed sessions | Auto-adjusts pending tasks forward |
| `/api/v1/pyq/analysis/{subject_id}`| `GET` | Get recurring topic rankings | Returns high-frequency topic statistics |
| `/api/v1/quizzes/generate` | `POST` | Generate adaptive MCQ practice test | `{subject_id, title, total_questions, time_limit}` |
| `/api/v1/quizzes/{id}/submit` | `POST` | Submit test answers & evaluate | `{question_id: selected_option}` -> Score & feedback |
| `/api/v1/analytics/` | `GET` | Get performance overview | Streak days, study hours, accuracy rate |
| `/api/v1/recommendations/next` | `GET` | Get "What to study now?" advice | Action label, action type, urgency, rationale |
| `/api/v1/tutor/ask` | `POST` | Grounded doubt solving query | `{query, subject_id, history}` -> Answer + Citations |
| `/api/v1/activity/stream` | `GET` | Live multi-agent activity stream | Returns real-time decision logs of all 10 agents |
| `/health` | `GET` | Service & DB connectivity check | `{status: "healthy", database: "..."}` |

---

## 6. Examiner & Viva Preparation: Top 25 Questions & Model Answers

### Q1. What is the core problem your project solves?
**Answer:** Traditional self-study causes students to struggle with exam scheduling, identifying high-yield topics, and avoiding generic, hallucinated AI answers. Our project solves this through an autonomous **10-agent multi-agent ecosystem** that ingests actual university course materials and provides **grounded RAG doubt solving**, **PYQ frequency analysis**, and **adaptive dynamic study rescheduling**.

### Q2. Why did you use an Agentic Architecture instead of a single LLM prompt?
**Answer:** A single LLM prompt suffers from context window degradation, high hallucination rates, and lack of state persistence. In our agentic architecture, each agent is a specialized micro-service (e.g., `ExamAgent` only computes dates and urgencies, `PYQAgent` only ranks historical questions). This modularity guarantees deterministic mathematical accuracy where needed and focused generative quality where required.

### Q3. How does Grounded RAG work in your project, and what prevents hallucinations?
**Answer:** Our RAG pipeline slices uploaded textbooks into 500-character chunks with 100-character overlap. When a student asks a question, the `TutorAgent` performs semantic retrieval over these chunks. The LLM is instructed via system prompt to answer **strictly** using the retrieved snippets and return source citations (document name, page number, excerpt). If the textbook does not contain the answer, the model explicitly admits it rather than inventing facts.

### Q4. How do you parse PDF, PPTX, and DOCX files?
**Answer:** We use dedicated Python binary parser libraries:
- `pypdf` for extracting text layer streams from PDF pages.
- `python-pptx` for iterating over slide shapes, text frames, and bullet paragraphs in PowerPoint presentations.
- `python-docx` for reading document body paragraphs and table cells from Word documents.
All extracted text is cleaned, normalized, and indexed into database chunks.

### Q5. What is the formula used by the Exam Agent to compute Urgency?
**Answer:**
$$\text{Urgency} = \min\left(100, \max\left(10, \frac{\text{Target Score} \times 10}{\max(1, \text{Days Left})}\right)\right)$$
This ensures that as an exam date approaches (e.g., $<5$ days left) or if the student's target score is high (e.g., $95\%$), the urgency score automatically scales toward $100\%$, triggering high-priority alerts in the UI.

### Q6. How does the dynamic study planner reschedule missed study sessions?
**Answer:** When a student misses planned sessions (e.g., due to illness or events), clicking the **Reschedule** button triggers the `StudyPlannerAgent`. It queries incomplete past sessions, re-evaluates the remaining days until the exam, sorts topics by PYQ weightage, and reallocates the pending topics into upcoming Morning, Afternoon, and Evening slots without exceeding maximum daily study capacity.

### Q7. How does the system handle database connectivity in production vs development?
**Answer:** We implemented a dual-engine architecture in `backend/app/core/database.py`. In production on Render, it automatically connects to a hosted **PostgreSQL** database using the `DATABASE_URL` environment variable. If `DATABASE_URL` is absent or PostgreSQL fails to connect, the system automatically falls back to an embedded **SQLite3** database (`student_ai.db`), ensuring zero downtime during testing and offline evaluation.

### Q8. What security mechanisms protect user passwords and API endpoints?
**Answer:**
1. **Password Hashing:** Passwords are never stored in plaintext. We use the cryptographic **PBKDF2-HMAC-SHA256** algorithm with 100,000 salt iterations.
2. **Stateless JWT Tokens:** Authentication returns an industry-standard signed JSON Web Token containing the user's `sub` ID and expiration timestamp.
3. **Route Protection:** FastAPI dependency `get_current_user` decodes and verifies the token signature on every protected API call.

### Q9. Why did you choose FastAPI over Flask or Django?
**Answer:**
- **FastAPI** is built on Starlette and Pydantic, making it one of the fastest Python web frameworks available (comparable to NodeJS and Go).
- It provides native `async/await` support for non-blocking I/O operations (crucial for LLM calls and file processing).
- It automatically generates interactive OpenAPI Swagger documentation at `/docs`.
- Flask is synchronous by default, and Django introduces heavy boilerplate that is unnecessary for a decoupled API backend.

### Q10. Why React 19 + Vite + Tailwind CSS instead of traditional HTML/CSS/JS?
**Answer:**
- **React 19** provides declarative component-driven UI architecture, efficient virtual DOM diffing, and seamless state reactivity.
- **Vite** leverages native ES modules in the browser, compiling and bundling 1,900+ modules in under 900 milliseconds.
- **Tailwind CSS v4** allows us to implement a complete, maintainable Design System with instant Light/Dark mode transitions using CSS custom variables.

### Q11. How do you deploy the application on Render using Docker?
**Answer:** We use a **Multi-Stage Dockerfile**:
- **Stage 1 (Build):** Uses `node:20-alpine` to install frontend dependencies and run `npm run build`, producing optimized static HTML/CSS/JS assets in `frontend/dist`.
- **Stage 2 (Runtime):** Uses lightweight `python:3.11-slim`, installs Python packages from `requirements.txt`, copies the compiled frontend assets from Stage 1, and starts Uvicorn.
The backend serves both the API endpoints and the static frontend SPA on the single port assigned by Render (`${PORT:-8000}`).

### Q12. What happens if a user does not have a Google Gemini or OpenAI API key?
**Answer:** The system features a built-in **Deterministic Fallback Engine**. All agents can operate autonomously using keyword heuristics, rule-based question parsing, and pre-compiled question banks. External cloud API keys are completely optional and only serve to enhance generative variety.

### Q13. How does the Evaluation Agent diagnose weak topics?
**Answer:** When a quiz is submitted, the `EvaluationAgent` matches the user's answers against the answer key. It aggregates scores on a per-topic basis. Any topic with an accuracy below **60%** is added to the user's flagged weak topics list, which immediately boosts that topic's priority in the Recommendation Agent.

### Q14. What is the formula used by the Recommendation Agent to decide "What to study now"?
**Answer:**
$$\text{Priority} = (0.40 \times \text{Exam Urgency}) + (0.35 \times \text{PYQ Topic Frequency}) + (0.25 \times \text{Diagnostic Weakness})$$
The topic with the highest aggregate priority score is placed at the top of the student's dashboard with an immediate action button (e.g., "Take Quiz", "Review Notes", "Upload Material").

### Q15. How is CORS handled?
**Answer:** FastAPI includes `CORSMiddleware` configured to allow credentials, all HTTP methods (`GET`, `POST`, `PUT`, `DELETE`), and all headers. In production, because FastAPI directly mounts and serves the compiled React frontend from the same origin, CORS issues are completely avoided.

---
*Document prepared for Academic Project Review, Viva Voce & Technical Demonstrations.*
