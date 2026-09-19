# Deploying Agentic AI Student Assistant to Render

This guide provides step-by-step instructions to deploy the application to [Render](https://render.com) so you can get a public **live HTTPS URL** that anyone in the world can access.

---

## ⚡ Method 1: 1-Click Docker Web Service (Recommended)

This method deploys both the React Frontend and FastAPI Backend into a single high-performance container on Render's Free tier, giving you **one clean URL** (e.g. `https://student-ai-assistant.onrender.com`).

### Step 1: Sign In to Render
1. Go to [https://dashboard.render.com](https://dashboard.render.com).
2. Sign in or create a free account with your **GitHub account**.

### Step 2: Create a New Web Service
1. In the Render Dashboard, click the **New +** button at the top right.
2. Select **Web Service**.
3. Under *Connect a repository*, choose your repository:
   `yashbanedar/Agentic-AI-Powered-Student-Personal-Assistant`
   *(If you don't see it, click "Configure account" to grant Render access to the repository).*
4. Click **Connect**.

### Step 3: Configure Deployment Settings
Fill in the following values in the configuration form:

| Field | Setting |
| :--- | :--- |
| **Name** | `student-ai-assistant` (or any custom name) |
| **Region** | Oregon (US West) or Singapore / Frankfurt |
| **Branch** | `main` |
| **Root Directory** | *(Leave blank)* |
| **Runtime** | **Docker** *(Render detects the root `Dockerfile` automatically)* |
| **Instance Type** | **Free** |

### Step 4: Environment Variables (Optional)
Under the **Environment Variables** section, you can optionally configure:
- `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API key if you want live external AI LLM calls.
- `OPENAI_API_KEY`: *(Optional)* Your OpenAI API key if you want OpenAI models.
- `SECRET_KEY`: *(Optional)* Any random string for JWT encryption.

> [!NOTE]
> Even without entering any API keys, the built-in multi-agent heuristic engine and demo mode will work 100% out of the box!

### Step 5: Click Deploy
1. Scroll down and click **Deploy Web Service** (or **Create Web Service**).
2. Render will build the React frontend, package the FastAPI backend, and start the application.
3. Once the logs show `Application startup complete`, your **live public URL** will be displayed right under the service title (e.g., `https://student-ai-assistant.onrender.com`).
4. Click the URL or share it with anyone!

---

## 🚀 Method 2: Deploy Using Render Blueprint (`render.yaml`)

Because this repository includes a pre-configured `render.yaml` blueprint:

1. Go to [https://dashboard.render.com](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Connect `yashbanedar/Agentic-AI-Powered-Student-Personal-Assistant`.
4. Render reads `render.yaml`, configures health checks, dynamic port bindings, and auto-generates your secret keys.
5. Click **Apply**.
6. Wait 2-3 minutes for the build to complete, and access your live URL!

---

## 🎯 Testing Your Live Deployed App

Once your Render URL is live:
1. Open your URL in any web browser: `https://your-service-name.onrender.com`.
2. On the login screen, click **“1-Click Demo Student Login”**.
3. The platform will immediately authenticate into the demo student dashboard with preloaded subjects, syllabus tree, PYQ analysis, countdown timers, and active quizzes!
4. You can also view interactive Swagger API documentation at:
   `https://your-service-name.onrender.com/docs`
5. Health check is available at:
   `https://your-service-name.onrender.com/health`

---

## 💡 Free Tier Tips
- Render Free Tier web services automatically spin down after 15 minutes of inactivity.
- When someone visits your URL after it has spun down, the first request may take ~30-45 seconds to spin back up ("Cold Start"). Subsequent requests will be instant!
