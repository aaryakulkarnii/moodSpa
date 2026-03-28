# 🌿 MoodSpa — Complete Setup & Deployment Guide
> AI-powered mental wellness companion · MERN Stack · Gemini AI · Neon PostgreSQL

---

## 📋 WHAT YOU NEED (all free, no credit card)

| Tool | Purpose | Link |
|------|---------|------|
| Node.js v18+ | Run the code | https://nodejs.org |
| Git | Version control | https://git-scm.com |
| Google Account | Gemini API key | https://aistudio.google.com |
| Neon account | Free PostgreSQL DB | https://neon.tech |
| Render account | Host the backend | https://render.com |
| Vercel account | Host the frontend | https://vercel.com |
| GitHub account | Connect to Render/Vercel | https://github.com |

---

## 🔑 STEP 1 — Get Your Free Gemini API Key

1. Open → https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key — it looks like `AIzaSyXXXXXXXXXXXXXXXXX`
5. Save it somewhere safe

---

## 🐘 STEP 2 — Set Up Free Neon PostgreSQL Database

Neon is a free serverless PostgreSQL — no MongoDB Atlas, no credit card needed.

1. Go to → https://neon.tech and click **"Sign Up"** (free)
2. Click **"New Project"**
3. Name it `moodspa` → choose the region closest to you → click **"Create Project"**
4. On the dashboard, click **"Connect"** or find the **"Connection string"** section
5. Copy the connection string — it looks like:
   ```
   postgresql://moodspa_owner:AbCdEfGh@ep-cool-name-123456.us-east-2.aws.neon.tech/moodspa?sslmode=require
   ```
6. Keep this — you'll use it as `DATABASE_URL`

---

## 💻 STEP 3 — Run Locally

### 3a. Set Up the Backend

Open a terminal:

```bash
# Go into the backend folder
cd moodspa/backend

# Install all packages
npm install

# Copy the example env file
cp .env.example .env
```

Now open `backend/.env` in any text editor (Notepad, VS Code, etc.) and fill it in:

```
DATABASE_URL=postgresql://your_neon_connection_string_here
GEMINI_API_KEY=AIzaSyYour_key_here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Back in the terminal:

```bash
# Push the database schema to Neon (creates the tables — run this once)
npx prisma db push

# Start the backend
npm run dev
```

You should see:
```
✅ Neon PostgreSQL connected
🌿 MoodSpa backend on port 5000
```

**Leave this terminal running.**

---

### 3b. Set Up the Frontend

Open a **second terminal**:

```bash
# Go into the frontend folder
cd moodspa/frontend

# Install packages
npm install

# Copy the env file
cp .env.example .env
```

The `.env` file already has the correct local value:
```
VITE_API_URL=http://localhost:5000
```

```bash
# Start the frontend
npm run dev
```

You'll see:
```
  ➜  Local:   http://localhost:5173/
```

Open your browser → go to **http://localhost:5173** 🎉

---

## 🐙 STEP 4 — Push to GitHub

You need your code on GitHub so Render and Vercel can deploy it.

```bash
# Go to the root moodspa folder
cd moodspa

# Initialize git
git init
git add .
git commit -m "Initial MoodSpa commit"
```

Now go to **https://github.com/new**, create a new repository named `moodspa` (keep it public or private — both work), then:

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/moodspa.git
git branch -M main
git push -u origin main
```

---

## 🚀 STEP 5 — Deploy Backend to Render (Free)

1. Go to → https://render.com → Sign up / Log in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect a repository"** → find your `moodspa` repo → click **"Connect"**
4. Fill in these fields:
   - **Name:** `moodspa-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Scroll down to **"Environment Variables"** → click **"Add Environment Variable"** for each:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | your Neon connection string |
   | `GEMINI_API_KEY` | your Gemini API key |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | `https://moodspa.vercel.app` *(update after Step 6)* |

6. Click **"Create Web Service"**
7. Wait 3–5 minutes for the build to finish
8. Copy your backend URL — it looks like: `https://moodspa-backend.onrender.com`

> ⚠️ **Free tier note:** Render free services "sleep" after 15 min of no traffic. The first request after sleeping takes ~30 seconds. This is normal — after that it responds instantly. Upgrade to $7/mo Starter plan to eliminate sleep.

---

## 🌐 STEP 6 — Deploy Frontend to Vercel (Free)

1. Go to → https://vercel.com → Sign up / Log in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Find your `moodspa` repo → click **"Import"**
4. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** click **"Edit"** → type `frontend` → click **"Continue"**
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
5. Expand **"Environment Variables"** → add:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://moodspa-backend.onrender.com` *(your Render URL, no trailing slash)* |

6. Click **"Deploy"**
7. Wait ~1–2 minutes → your app is live! 🎉

Your URL will look like: `https://moodspa-abc123.vercel.app`

---

## 🔗 STEP 7 — Link Frontend ↔ Backend (Final Step)

Now update the backend to know your real frontend URL:

1. Go to **Render** → your `moodspa-backend` service → **"Environment"**
2. Update `FRONTEND_URL` to your actual Vercel URL (e.g., `https://moodspa-abc123.vercel.app`)
3. Click **"Save Changes"** — Render redeploys automatically in ~2 min

---

## ✅ TEST EVERYTHING

After deploying, verify:

- [ ] Open your Vercel URL → welcome screen with mood buttons appears
- [ ] Click a mood button → message sends → AI responds (streaming)
- [ ] Type "latest mental health research" → scraper activates
- [ ] Refresh the page → your conversation history loads (Neon DB working ✅)
- [ ] Click "Clear" → chat resets
- [ ] Open on mobile → layout looks good

---

## 🛠️ TROUBLESHOOTING

**"Something went wrong" error:**
- Check `VITE_API_URL` in Vercel env vars — no trailing slash
- Open browser DevTools (F12) → Network tab → look at the failed request URL

**AI not responding:**
- Check `GEMINI_API_KEY` in Render env vars is correct
- Visit https://aistudio.google.com/app/apikey to verify the key is active

**History not loading / DB errors:**
- Double-check `DATABASE_URL` in Render env vars matches your Neon connection string exactly
- Make sure you ran `npx prisma db push` locally at least once (it creates the tables in Neon)

**Backend not starting on Render:**
- Check the Render build logs — usually a missing env var
- Make sure Root Directory is set to `backend`

**First message is slow (~30s):**
- This is the Render free tier waking up — totally normal. Subsequent messages are fast.

---

## 📁 PROJECT STRUCTURE

```
moodspa/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       ← DB schema (Conversation + Message)
│   ├── src/
│   │   ├── server.ts           ← Express entry point
│   │   ├── lib/
│   │   │   └── prisma.ts       ← Prisma client singleton
│   │   ├── controllers/
│   │   │   └── chat.controller.ts  ← AI chat + DB logic
│   │   ├── routes/
│   │   │   └── index.ts        ← API routes
│   │   ├── services/
│   │   │   └── scraper.service.ts  ← News scraper
│   │   └── middleware/
│   │       └── validate.ts     ← Input validation
│   ├── .env.example
│   ├── render.yaml
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.tsx             ← Root component
    │   ├── main.tsx            ← Entry point
    │   ├── index.css           ← Global styles + glassmorphism
    │   ├── components/
    │   │   ├── Header.tsx
    │   │   ├── MessageBubble.tsx
    │   │   ├── MessageFeed.tsx
    │   │   ├── PromptInputBox.tsx
    │   │   └── WelcomeScreen.tsx
    │   ├── hooks/
    │   │   └── useChat.ts      ← Chat state + streaming logic
    │   └── lib/
    │       ├── api.ts          ← Fetch helpers
    │       └── types.ts        ← TypeScript types
    ├── .env.example
    ├── vercel.json
    └── package.json
```

---

## 💡 FREE TIER LIMITS

| Service | Free Limit | Notes |
|---------|-----------|-------|
| **Gemini API** | 15 req/min · 1M tokens/day | More than enough |
| **Neon PostgreSQL** | 512MB storage · 10GB transfer/month | Serverless, always-on |
| **Render** | 750 hrs/month · sleeps after 15min idle | Free is fine for demos |
| **Vercel** | 100GB bandwidth/month | Frontend never sleeps |
| **GitHub** | Unlimited public repos | — |

---

Built with 💚 — MoodSpa
