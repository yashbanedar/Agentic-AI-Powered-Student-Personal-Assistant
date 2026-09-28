# Deploying Agentic AI Student Assistant to Render with Live PostgreSQL

This guide provides step-by-step instructions to deploy the application to [Render](https://render.com) with a **Live PostgreSQL Database** and public **HTTPS URL** so any student in the world can register and use the platform, and you can view all their data live in PostgreSQL.

---

## 🚀 Method 1: 1-Click Blueprint with Live PostgreSQL (Recommended)

Because this repository contains a pre-configured `render.yaml` with both the **Web Service** and a **Managed PostgreSQL Database** defined:

### Step 1: Sign In to Render
1. Go to [https://dashboard.render.com](https://dashboard.render.com).
2. Sign in with your **GitHub account** (`yashbanedar`).

### Step 2: Launch Blueprint
1. In the Render Dashboard, click the **New +** button at the top right.
2. Select **Blueprint**.
3. Connect your repository: `yashbanedar/Agentic-AI-Powered-Student-Personal-Assistant`.
4. Render will read `render.yaml` and show:
   * **Web Service**: `student-ai-assistant` (Docker container with React Frontend + FastAPI Backend)
   * **PostgreSQL Database**: `student-ai-db` (Free managed PostgreSQL instance)
   * `DATABASE_URL` will be automatically linked between the web service and database!
5. Click **Apply**.
6. Wait 3–4 minutes while Render compiles the frontend, builds the Docker container, provisions the PostgreSQL database, and starts the system.

Once complete, you get:
* Your **Live Web App URL**: `https://student-ai-assistant.onrender.com`
* Your **Live PostgreSQL Database**: `student-ai-db`

---

## ⚡ Method 2: Manual Web Service + PostgreSQL Setup

If you prefer to configure manually:

### Step 1: Create the PostgreSQL Database
1. In Render Dashboard, click **New +** ➜ **PostgreSQL**.
2. **Name**: `student-ai-db`
3. **Database**: `student_assistant`
4. **User**: `student_admin`
5. **Plan**: Free
6. Click **Create Database**.
7. Once created, copy the **Internal Database URL** (e.g. `postgres://student_admin:...@dpg-...-a/student_assistant`).

### Step 2: Create the Web Service
1. Click **New +** ➜ **Web Service**.
2. Connect `yashbanedar/Agentic-AI-Powered-Student-Personal-Assistant`.
3. Settings:
   * **Runtime**: `Docker`
   * **Plan**: `Free`
   * **Region**: Same region as your database (e.g. `Oregon`)
4. Under **Environment Variables**:
   * Add `DATABASE_URL` ➜ Paste the Internal Database URL from Step 1.
   * Add `SECRET_KEY` ➜ Any random 32-character string.
5. Click **Deploy Web Service**.

---

## 📊 How to View Student Data Live in PostgreSQL

Whenever a new student registers, takes a quiz, sets up an exam, or chats with the AI Tutor, all their data is immediately recorded in PostgreSQL.

### Option A: Render Built-in Web Explorer
1. In Render Dashboard, click on your database: **`student-ai-db`**.
2. Click on the **Connect** or **Access Control** tab.
3. You can use Render's web interface or command line to query the tables:
   ```sql
   -- View all registered students
   SELECT id, email, full_name, preferences, created_at FROM users;

   -- View student subjects and target grades
   SELECT * FROM subjects;

   -- View scheduled exams and countdowns
   SELECT * FROM exams;

   -- View quiz attempts and scores
   SELECT * FROM quiz_attempts;

   -- View live AI agent activity log
   SELECT agent_name, action_type, title, created_at FROM ai_activities ORDER BY created_at DESC;
   ```

### Option B: Connect using pgAdmin / DBeaver / TablePlus
1. In Render Dashboard ➜ **`student-ai-db`** ➜ Look for **External Database URL**.
2. Copy the external connection string:
   `postgresql://student_admin:[PASSWORD]@dpg-....oregon-postgres.render.com/student_assistant`
3. Paste it into your preferred client (**DBeaver**, **pgAdmin**, or **VS Code Database Client**).
4. You can now see real-time updates as students register and interact with the application!

---

## 🎯 Testing Your Live Deployment

1. Visit your live Render URL: `https://student-ai-assistant.onrender.com`.
2. Try registering a new student account with Hindi, Marathi, or English.
3. Complete the onboarding wizard (Primary, 10th Board, HSC, College, Ph.D., MPSC, or UPSC).
4. Check your PostgreSQL database ➜ The new student record and enrolled courses will appear immediately!
