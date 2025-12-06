# 🚀 Research AI - Complete Deployment Guide

**Step-by-step guide to deploy Research AI on Vercel (Full Stack - Frontend + Backend)**

---

## ✅ Prerequisites Checklist

- [ ] GitHub Account
- [ ] Vercel Account (Free tier works!)
- [ ] Google Gemini API Key
- [ ] Code tested locally ✅ (You've already done this!)

---

## 📝 Step 1: GitHub Repository Setup

### 1.1 Create GitHub Repository

1. **GitHub.com** pe jao aur login karo
2. **"New"** button click karo (ya top right corner pe **"+"** icon)
3. **Repository details fill karo:**
   - **Repository name:** `research-ai` (ya koi bhi naam)
   - **Description:** "AI-powered research paper assistant"
   - **Visibility:** ✅ **Public** (Vercel free tier ke liye required)
   - ❌ **DON'T** initialize with README, .gitignore, or license
4. **"Create repository"** button click karo

### 1.2 Push Code to GitHub

**Terminal mein yeh commands run karo:**

```bash
# Project folder mein jao
cd "C:\Users\dhruv\OneDrive\Desktop\Research AI"

# Git initialize (agar pehle se nahi hai)
git init

# All files add karo
git add .

# Commit karo
git commit -m "Initial commit - Research AI full stack app"

# GitHub repository se connect karo (apna username use karo)
# Format: https://github.com/YOUR_USERNAME/repository-name.git
git remote add origin https://github.com/YOUR_USERNAME/research-ai.git

# Main branch set karo
git branch -M main

# Code push karo
git push -u origin main
```

**Note:** Agar pehle se git setup hai, toh sirf yeh run karo:
```bash
git add .
git commit -m "Ready for deployment"
git push
```

---

## 🌐 Step 2: Vercel Account Setup

### 2.1 Create Vercel Account

1. **https://vercel.com** pe jao
2. **"Sign Up"** button click karo
3. **"Continue with GitHub"** select karo
4. GitHub se authorize karo
5. ✅ Account ready!

---

## 🚀 Step 3: Deploy to Vercel

### 3.1 Import Project

1. **Vercel Dashboard** mein jao (home page)
2. **"Add New..."** button click karo (top right)
3. **"Project"** select karo
4. **"Import Git Repository"** section mein apna GitHub repo dikhega
5. Apna repo select karo (ya search karo)
6. **"Import"** button click karo

### 3.2 Configure Project Settings

**Important Settings:**

1. **Project Name:** 
   - Auto-filled hoga (change kar sakte ho agar chahte ho)
   - Example: `research-ai` ya `research-ai-app`

2. **Root Directory:**
   - ⚠️ **IMPORTANT:** Click on **"Edit"** next to Root Directory
   - **"Set to"** → Type: `main`
   - Ya dropdown se `main` folder select karo
   - ✅ **This is critical!** Root directory `main` hona chahiye

3. **Framework Preset:**
   - Auto-detect: **Next.js** ✅
   - Ya manually select: **Next.js**

4. **Build Command:**
   - Default: `npm run build` ✅ (theek hai)

5. **Output Directory:**
   - Default: `.next` ✅ (theek hai)

6. **Install Command:**
   - Default: `npm install` ✅ (theek hai)

### 3.3 Add Environment Variables

**⚠️ CRITICAL STEP - Don't skip this!**

**"Environment Variables"** section mein yeh add karo:

#### Variable 1: GOOGLE_API_KEY
```
Key: GOOGLE_API_KEY
Value: AIzaSyDWP9VtXdYHtwGIJUrQ39K-g8h_LoOGxUg
(or apna Gemini API key)
```

**How to add:**
1. **"Key"** field: `GOOGLE_API_KEY`
2. **"Value"** field: Apna API key paste karo
3. ✅ **Production** checkbox enable karo
4. ✅ **Preview** checkbox enable karo (optional but recommended)
5. ✅ **Development** checkbox enable karo (optional)
6. **"Add"** button click karo

#### Variable 2 (Optional): PINECONE_API_KEY
```
Key: PINECONE_API_KEY
Value: (agar Pinecone use karna ho)
```

#### Variable 3 (Optional): PINECONE_INDEX_NAME
```
Key: PINECONE_INDEX_NAME
Value: research-papers
```

**⚠️ Important:**
- Har variable ke liye **at least Production** enable karna zaroori hai
- Environment variables deploy ke baad add kar sakte ho, but pehle add karna better hai

### 3.4 Deploy!

1. Sab settings check karo
2. Scroll down karo
3. **"Deploy"** button click karo
4. ⏳ **Wait karo** (2-3 minutes) - Build progress dekh sakte ho

---

## 🎉 Step 4: Deployment Complete!

### 4.1 Get Your URL

1. Deployment complete hone ke baad
2. **"Visit"** button pe click karo
3. Ya URL copy karo: `https://your-project-name.vercel.app`
4. ✅ **App live hai!**

### 4.2 Test Your Deployment

1. **Home Page:** Check karo home page load ho raha hai
2. **Understand Paper:** PDF upload karke test karo
3. **Summary Generation:** Summary generate hoga
4. **Q&A:** Questions pucho
5. **Citations:** Citation generator test karo

---

## 🔍 Step 5: Verify Everything

### 5.1 Health Check Endpoint

Browser mein yeh URL open karo:
```
https://your-project-name.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Research AI Backend API",
  "version": "0.1.0"
}
```

### 5.2 Test All Features

✅ **PDF Upload & Summary:** `/understand` page  
✅ **Q&A:** Questions pucho  
✅ **Ask About Paper:** `/ask-about` page  
✅ **Citations:** `/citations` page  

---

## 🔧 Step 6: Troubleshooting

### Issue 1: Build Fails ❌

**Error:** `GOOGLE_API_KEY not found`

**Solution:**
1. Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Check karo `GOOGLE_API_KEY` add hai ya nahi
3. **Production** environment selected hai?
4. Agar nahi hai, add karo aur **Redeploy** karo

### Issue 2: 404 on API Routes ❌

**Error:** API routes not found

**Solution:**
1. Check karo **Root Directory** `main` set hai ya nahi
2. `main/app/api/` folder exist karta hai
3. Routes properly named hain (`route.ts`)
4. Redeploy karo

### Issue 3: PDF Upload Fails ❌

**Error:** `Failed to extract text from PDF`

**Solution:**
1. Check Vercel logs: Dashboard → Project → **Logs** tab
2. Verify `GOOGLE_API_KEY` correct hai
3. PDF file size < 20MB hai
4. Error message dekh kar specific issue identify karo

### Issue 4: Function Timeout ⏱️

**Error:** Function execution timeout

**Solution:**
1. **Free tier:** 10 seconds limit
2. Large PDFs slow ho sakte hain
3. Try smaller PDF files
4. Ya Vercel Pro upgrade karo (60 seconds limit)

---

## 🔄 Step 7: Updates & Redeploy

### 7.1 Update Code

Agar code update karna ho:

```bash
# Local changes karo
# Phir:

git add .
git commit -m "Your update message"
git push
```

**Vercel automatically redeploy kar degi!** 🎉

### 7.2 Manual Redeploy

Agar auto-deploy nahi hua:

1. Vercel Dashboard → Project
2. **"Deployments"** tab
3. Latest deployment pe **"..."** menu (three dots)
4. **"Redeploy"** click karo

---

## 📊 Step 8: Monitor Your App

### 8.1 View Logs

1. Vercel Dashboard → Project
2. **"Logs"** tab
3. Real-time logs dekh sakte ho
4. Errors debug kar sakte ho

### 8.2 Analytics (Optional)

1. **"Analytics"** tab
2. Traffic, performance metrics
3. User activity tracking

### 8.3 Environment Variables Management

1. **Settings** → **Environment Variables**
2. Add/Edit/Delete variables
3. Different values for Production, Preview, Development

---

## ⚙️ Important Configuration

### Project Structure

```
Research AI/
├── main/                    # Root Directory on Vercel
│   ├── app/
│   │   ├── api/            # API Routes (Backend)
│   │   └── ...             # Frontend Pages
│   ├── lib/                # Utilities
│   └── package.json        # Dependencies
└── vercel.json             # Vercel config (optional)
```

### Environment Variables Required

**Production:**
```
GOOGLE_API_KEY=your-gemini-api-key
```

**Optional:**
```
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=research-papers
```

### Vercel Settings Summary

| Setting | Value |
|---------|-------|
| Root Directory | `main` |
| Framework | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

---

## 💡 Pro Tips

1. **Custom Domain:** Vercel pe custom domain add kar sakte ho (Settings → Domains)
2. **Preview Deployments:** Har PR pe automatic preview deployment
3. **Team Collaboration:** Team members invite kar sakte ho
4. **Environment Variables:** Production, Preview, Development alag alag set kar sakte ho
5. **Analytics:** Enable karo traffic tracking ke liye

---

## ✅ Deployment Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Root Directory set to `main`
- [ ] Environment variables added (`GOOGLE_API_KEY`)
- [ ] Deploy button clicked
- [ ] Deployment successful
- [ ] App tested (all features working)
- [ ] URL saved/bookmarked

---

## 🎯 Quick Reference

**Your Deployment URL:**
```
https://your-project-name.vercel.app
```

**Health Check:**
```
https://your-project-name.vercel.app/api/health
```

**Dashboard:**
```
https://vercel.com/dashboard
```

---

## 🎉 Success!

Agar sab kuch theek hai, aapka app deployed hai aur live hai! 

**Next Steps:**
1. ✅ Share your app URL
2. ✅ Test all features
3. ✅ Monitor logs
4. ✅ Add custom domain (optional)

---

**Created:** 2024-11-27  
**Last Updated:** 2024-11-27

**Happy Deploying! 🚀**

