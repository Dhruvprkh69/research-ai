# 🚀 Complete Deployment Guide - Step by Step
## Vercel (Frontend) + Render (Backend) + Supabase Auth

---

## 📋 **PRE-REQUISITES CHECKLIST**

Before starting, make sure you have:
- [ ] GitHub account (free)
- [ ] Vercel account (free, sign up with GitHub)
- [ ] Render account (free, sign up with GitHub)
- [ ] Supabase account (free)
- [ ] Code ready in your local machine
- [ ] Google Gemini API key (for AI features)

---

## 🔴 **PHASE 1: GitHub Setup (10 minutes)**

### Step 1.1: Create GitHub Repository

1. **Go to GitHub:**
   - Open browser → Go to https://github.com
   - Login to your account (ya sign up karo free mein)

2. **Create New Repository:**
   - Top right corner pe **"+"** button click karo
   - **"New repository"** select karo

3. **Repository Details Fill Karo:**
   ```
   Repository name: research-ai
   Description: Research AI Assistant - AI-powered research paper analysis
   Visibility: Public (or Private - your choice)
   
   ❌ DON'T check:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
   
   (Because you already have code)
   ```

4. **Click "Create repository"**

5. **GitHub will show you commands** - IGNORE them for now, we'll do it differently

---

### Step 1.2: Push Your Code to GitHub

1. **Open Terminal/Command Prompt** in your project folder:
   ```bash
   cd "C:\Users\dhruv\OneDrive\Desktop\Research AI"
   ```

2. **Create .gitignore file FIRST** (Important: Pehle yeh banao):
   - `.gitignore` file already create ki hai maine
   - Agar nahi hai, to yeh content copy karo:
   
   ```
   # Dependencies
   node_modules/
   
   # Python
   __pycache__/
   *.pyc
   .venv/
   venv/
   env/
   
   # Environment variables
   .env
   .env.local
   
   # Next.js
   .next/
   out/
   build/
   
   # IDE
   .vscode/
   .idea/
   
   # OS
   .DS_Store
   Thumbs.db
   ```

3. **Initialize Git (if not already done):**
   ```bash
   git init
   ```

4. **Remove unwanted files from Git cache** (agar pehle add kiya ho):
   ```bash
   git rm -r --cached backend/.venv
   git rm -r --cached backend/__pycache__
   git rm -r --cached node_modules
   git rm -r --cached .next
   git rm -r --cached frontend/node_modules
   ```

5. **Add all files:**
   ```bash
   git add .
   ```

6. **First commit:**
   ```bash
   git commit -m "Initial commit - Research AI project"
   ```

6. **Connect to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/research-ai.git
   ```
   ⚠️ **Replace `YOUR_USERNAME` with your actual GitHub username**

7. **Push to GitHub:**
   ```bash
   git branch -M main
   git push -u origin main
   ```

8. **GitHub pe username/password puch sakta hai:**
   - Use **Personal Access Token** (password nahi kaam karega)
   - How to create token:
     - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
     - Generate new token → Select scopes: `repo` (all)
     - Copy token and use as password

9. **Verify:**
   - GitHub pe jao
   - Apni repository open karo
   - Saare files dikhne chahiye

---

## 🔵 **PHASE 2: Supabase Setup (20 minutes)**

### Step 2.1: Create New Supabase Project

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Login karo

2. **Create New Project:**
   - Top right corner pe **"New Project"** button click karo
   - Ya **"New"** → **"Project"** select karo

3. **Fill Project Details:**
   ```
   Organization: (Select your organization)
   
   Name: research-ai (ya kuch clear naam - example: research-ai-production)
   
   Database Password: (Strong password set karo - IMPORTANT: SAVE KAR LO!)
   - Minimum 12 characters
   - Mix of letters, numbers, symbols
   - Example: MySecurePass123!@#
   
   Region: (Closest region select karo)
   - India ke liye: Southeast Asia (Singapore)
   - US ke liye: US East / US West
   
   Pricing Plan: Free (default)
   ```

4. **Create Project:**
   - **"Create new project"** button click karo
   - Wait karo (2-3 minutes lag sakta hai)
   - Success message aayega: **"Your project is ready"**

5. **⚠️ IMPORTANT - Save These Details:**
   - **Database Password** - Save kar lo (connection string mein use hoga)
   - Project name note kar lo (identification ke liye)

---

### Step 2.2: Get API Keys and Connection Details

1. **Go to Settings:**
   - Left sidebar mein **"Settings"** → **"API"** click karo

2. **Copy API Keys:**
   - **Project URL:** Copy karo (example: `https://xxxxx.supabase.co`)
   - **anon public key:** Copy karo (long string starting with `eyJ...`)
   - **service_role key:** Copy karo (long string - ⚠️ KEEP THIS SECRET!)
   
   **📝 Save these in a text file:**
   ```
   SUPABASE_PROJECT_URL = https://xxxxx.supabase.co
   SUPABASE_ANON_KEY = eyJhbGci...
   SUPABASE_SERVICE_KEY = eyJhbGci... (SECRET!)
   ```

3. **Get Database Connection String:**
   - Left sidebar mein **"Settings"** → **"Database"** click karo
   - Scroll down to **"Connection string"** section
   - **"URI"** tab select karo
   - Copy the connection string:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```
   - **⚠️ Replace `[YOUR-PASSWORD]` with your actual database password**
   - **⚠️ If password has special characters, URL encode them:**
     - `@` → `%40`
     - `#` → `%23`
     - `%` → `%25`
   
   **📝 Save this:**
   ```
   DATABASE_URL = postgresql://postgres:YourPassword@db.xxxxx.supabase.co:5432/postgres
   ```

---

### Step 2.3: Enable Authentication

1. **Go to Authentication:**
   - Left sidebar mein **"Authentication"** click karo
   - Top pe **"Providers"** tab pe jao

2. **Enable Email Provider:**
   - **"Email"** provider ko **ON** karo (toggle button)
   - Scroll down to **"Email Auth Settings"**
   - **"Enable email confirmations"** ko **OFF** karo (testing ke liye - baad mein ON kar sakte ho)
   - **"Save"** button click karo

3. **Verify:**
   - Email provider **"Enabled"** dikhna chahiye

---

### Step 2.4: Create Database Tables

1. **Go to Supabase SQL Editor:**
   - Left sidebar mein **"SQL Editor"** click karo
   - **"New query"** button click karo

2. **Run this SQL to create tables:**

```sql
-- Create papers table
    CREATE TABLE IF NOT EXISTS public.papers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        filename TEXT NOT NULL,
        summary TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_papers_user_id ON public.papers(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_paper_id ON public.questions(paper_id);
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON public.questions(user_id);
```

3. **Click "Run" button** (bottom right)

4. **Enable Row Level Security (RLS):**

```sql
-- Enable RLS on papers table
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;

-- Enable RLS on questions table
    ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create policies for papers (users can only see their own papers)
CREATE POLICY "Users can view own papers"
    ON public.papers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own papers"
    ON public.papers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own papers"
    ON public.papers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own papers"
    ON public.papers FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for questions
CREATE POLICY "Users can view own questions"
    ON public.questions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own questions"
    ON public.questions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

5. **Click "Run" button again**

6. **Verify tables created:**
   - Left sidebar → **"Table Editor"** → Check if `papers` and `questions` tables dikh rahe hain

---

### Step 2.5: Important Notes

**📝 Save All These Details in a Safe Place:**

```
✅ Supabase Project Name: research-ai
✅ Project URL: https://xxxxx.supabase.co
✅ Database Password: (jo create karte waqt diya)
✅ anon public key: eyJhbGci...
✅ service_role key: eyJhbGci... (SECRET!)
✅ Database Connection String: postgresql://postgres:Password@db.xxxxx.supabase.co:5432/postgres
```

**⚠️ Important:**
- Service role key ko **NEVER** frontend mein use karo (sirf backend)
- Database password ko URL encode karo agar special characters hain
- Sab details save kar lo - baad mein use karenge

---

## 🟢 **PHASE 3: Frontend Deployment on Vercel (20 minutes)**

### Step 3.1: Create Vercel Account

1. **Go to Vercel:**
   - https://vercel.com
   - **"Sign Up"** button click karo

2. **Sign up with GitHub:**
   - **"Continue with GitHub"** button click karo
   - GitHub login karne do
   - Authorize Vercel ko access dene do

3. **Welcome screen aayega** - Next/Continue click karte raho

---

### Step 3.2: Import GitHub Repository

1. **Vercel Dashboard:**
   - **"Add New..."** button click karo (top right)
   - **"Project"** select karo

2. **Import Git Repository:**
   - GitHub repositories list mein apna **"research-ai"** repository dikhega
   - **"Import"** button click karo

3. **Configure Project:**
   ```
   Project Name: research-ai (ya kuch bhi naam)
   
   Framework Preset: Next.js (automatically detect ho jayega)
   
   Root Directory: ./frontend
   (IMPORTANT: Yeh change karo kyunki frontend folder hi deploy karna hai)
   
   Build Command: npm run build (default)
   Output Directory: .next (default)
   Install Command: npm install (default)
   ```

4. **Environment Variables Add Karo:**
   - Scroll down to **"Environment Variables"** section
   - **"Add"** button click karo, phir yeh add karo:
   
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: (Yeh woh Project URL hai jo Step 2.2 mein copy kiya - example: https://xxxxx.supabase.co)
   
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: (Yeh woh anon public key hai jo Step 2.2 mein copy kiya tha)
   
   Name: NEXT_PUBLIC_API_URL
   Value: (Abhi skip karo, backend deploy hone ke baad add karenge)
   ```

5. **Deploy Button Click Karo:**
   - Bottom pe **"Deploy"** button click karo
   - Build start ho jayega (2-3 minutes lag sakta hai)

6. **Wait for Deployment:**
   - Build logs screen pe dikhenge
   - Success message aayega: **"Congratulations! Your project has been deployed."**
   - **Copy the URL** - Yeh aapka frontend URL hai:
     ```
     https://research-ai-xxxxx.vercel.app
     ```
   - Save kar lo, baad mein use karenge

---

### Step 3.3: Update Frontend Code (If Needed)

Agar deployment mein error aaye, to:

1. **Check Build Logs:**
   - Vercel dashboard mein **"Deployments"** tab
   - Failed deployment click karo
   - Error messages dekho

2. **Common Fixes:**
   - `.env.local` file check karo
   - Dependencies issues ho to fix karo
   - Code push karo GitHub pe, auto-redeploy ho jayega

---

## 🟡 **PHASE 4: Backend Deployment on Render (25 minutes)**

### Step 4.1: Create Render Account

1. **Go to Render:**
   - https://render.com
   - **"Get Started for Free"** button click karo

2. **Sign up with GitHub:**
   - **"Continue with GitHub"** button click karo
   - GitHub login karne do
   - Authorize Render ko access dene do

3. **Email Verification:**
   - Email check karo
   - Verification link click karo

---

### Step 4.2: Create Web Service

1. **Render Dashboard:**
   - **"New +"** button click karo (top right)
   - **"Web Service"** select karo

2. **Connect Repository:**
   - GitHub repositories list mein apna **"research-ai"** repository dikhega
   - **"Connect"** button click karo

3. **Configure Service:**
   ```
   Name: research-ai-backend (ya kuch bhi naam)
   
   Region: Singapore (ya closest region)
   
   Branch: main (default)
   
   Root Directory: backend
   (IMPORTANT: Backend folder hi deploy karna hai)
   
   Runtime: Python 3
   
   Build Command: pip install -r requirements.txt
   
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

4. **Select Plan:**
   - **"Free"** plan select karo
   - Scroll down

5. **Environment Variables Add Karo:**
   - **"Add Environment Variable"** button click karo
   - Har variable ke liye separately add karo:
   
   ```
   SUPABASE_URL = (Yeh woh Project URL hai jo Step 2.2 mein copy kiya - example: https://xxxxx.supabase.co)
   
   SUPABASE_SERVICE_KEY = (Yeh woh service_role key hai jo Step 2.2 mein copy kiya - SECRET!)
   
   DATABASE_URL = (Yeh woh connection string hai jo Step 2.2 mein banaya - with actual password)
   Example: postgresql://postgres:YourPassword@db.xxxxx.supabase.co:5432/postgres
   ⚠️ Remember: Special characters ko URL encode karo!
   
   GOOGLE_API_KEY = (Yeh woh Gemini API key hai jo pehle se use kar rahe ho)
   
   PORT = 10000
   (Render automatically PORT set karta hai, but explicitly bhi set kar sakte ho)
   ```

6. **Advanced Settings (Optional):**
   - **"Auto-Deploy"** - ON rakh do (default)
   - Baaki settings default rahne do

7. **Create Web Service Button:**
   - Bottom pe **"Create Web Service"** click karo
   - Build start ho jayega (5-10 minutes lag sakta hai first time)

8. **Wait for Deployment:**
   - Build logs screen pe dikhenge
   - Success message aayega: **"Your service is live"**
   - **Copy the URL** - Yeh aapka backend URL hai:
     ```
     https://research-ai-backend-xxxxx.onrender.com
     ```
   - Save kar lo!

---

### Step 4.3: Update Backend CORS

1. **Backend Code Update Karo:**
   - Local machine pe `backend/app/main.py` file open karo
   - CORS origins update karo:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://research-ai-xxxxx.vercel.app",  # Yeh apna Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

2. **Code Push Karo GitHub Pe:**
   ```bash
   git add backend/app/main.py
   git commit -m "Update CORS for production"
   git push
   ```

3. **Render Auto-Redeploy:**
   - Render automatically naya code detect karega
   - Redeploy start ho jayega

---

### Step 4.4: Update Frontend API URL

1. **Vercel Dashboard:**
   - Apna project open karo
   - **"Settings"** tab click karo
   - **"Environment Variables"** section mein jao

2. **Update API URL:**
   - `NEXT_PUBLIC_API_URL` variable edit karo
   - Value: `https://research-ai-backend-xxxxx.onrender.com` (apna Render URL)
   - **"Save"** button click karo

3. **Redeploy Frontend:**
   - **"Deployments"** tab mein jao
   - Latest deployment ke right side pe **"..."** (three dots) click karo
   - **"Redeploy"** select karo
   - Confirm karo

---

## 🟣 **PHASE 5: Keep Backend Alive (Optional - 5 minutes)**

Render free tier sleeps after 15 minutes. Keep it awake:

1. **Go to UptimeRobot:**
   - https://uptimerobot.com
   - Sign up (free)

2. **Add New Monitor:**
   - **"Add New Monitor"** button
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** Research AI Backend
   - **URL:** `https://research-ai-backend-xxxxx.onrender.com/api/health`
   - **Monitoring Interval:** 5 minutes
   - **"Create Monitor"** click karo

3. **Done!** Backend awake rahega

---

## ✅ **PHASE 6: Testing (10 minutes)**

### Step 6.1: Test Frontend

1. **Open Frontend URL:**
   - Browser mein `https://research-ai-xxxxx.vercel.app` open karo
   - Homepage load hona chahiye

### Step 6.2: Test Backend

1. **Open Backend Health Check:**
   - Browser mein `https://research-ai-backend-xxxxx.onrender.com/api/health` open karo
   - Response: `{"status":"ok"}` aana chahiye

### Step 6.3: Test Complete Flow

1. **Frontend pe jao**
2. **Login/Register page test karo** (agar auth setup ho)
3. **PDF upload test karo**
4. **Everything check karo**

---

## 🎉 **DEPLOYMENT COMPLETE!**

### Your Live URLs:
- **Frontend:** `https://research-ai-xxxxx.vercel.app`
- **Backend:** `https://research-ai-backend-xxxxx.onrender.com`

### Share Karo:
- Friends ko frontend URL share karo
- Sab access kar sakte hain!

---

## 🐛 **TROUBLESHOOTING**

### Frontend Build Fails:
- Check build logs in Vercel
- Common issues: Missing dependencies, syntax errors
- Fix locally, push to GitHub, auto-redeploy

### Backend Build Fails:
- Check build logs in Render
- Common issues: Missing requirements.txt, wrong start command
- Check environment variables are correct

### Backend Sleeps:
- First request after sleep takes 30-60 seconds
- Use UptimeRobot to keep awake
- Or upgrade to paid plan

### CORS Errors:
- Check backend CORS origins include frontend URL
- Check frontend API URL is correct

### Database Connection Errors:
- Check DATABASE_URL in Render environment variables
- Verify Supabase project is active
- Check network restrictions in Supabase

---

## 📝 **QUICK REFERENCE**

### Environment Variables Checklist:

**Frontend (Vercel):**
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_API_URL`

**Backend (Render):**
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_KEY`
- ✅ `DATABASE_URL`
- ✅ `GOOGLE_API_KEY`
- ✅ `PORT`

---

## 🎯 **NEXT STEPS**

After deployment:
1. ✅ Test everything
2. ✅ Share with friends
3. ✅ Monitor usage
4. ✅ Add authentication (if not done)
5. ✅ Set up custom domain (optional)

---

**Happy Deploying! 🚀**

Agar kisi step mein problem aaye, to error message share karo!

