# Research AI - Full Stack Next.js Application

Complete Next.js application with integrated API routes (Frontend + Backend in one repo).

**Note:** This is the main application folder. It contains both frontend pages and backend API routes.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create `.env.local` file in `main/` folder:

```env
GOOGLE_API_KEY=your-gemini-api-key-here
PINECONE_API_KEY=your-pinecone-key-here (optional)
PINECONE_INDEX_NAME=research-papers (optional)
```

### 3. Run Development Server

```bash
npm run dev
```

App will be available at `http://localhost:3000`

## 📁 Project Structure

```
main/
├── app/
│   ├── api/              # Next.js API Routes (Backend)
│   │   ├── papers/       # Paper upload & Q&A
│   │   ├── ask-about/    # Full text Q&A
│   │   ├── citations/    # Citation generation
│   │   └── health/       # Health check
│   ├── understand/       # PDF understanding page
│   ├── ask-about/        # Ask about paper page
│   ├── citations/        # Citation generator page
│   └── page.tsx          # Home page
├── lib/                  # Shared utilities
│   ├── paperProcessing.ts    # PDF processing & AI
│   ├── jobStore.ts          # In-memory job storage
│   └── citations.ts         # Citation logic
└── ...
```

## ✨ Features

- **📄 Understand Paper**: Upload PDF, get AI-generated summary, ask questions
- **💬 Ask About Paper**: Full-text Q&A (5 questions per document)
- **📚 Generate Citations**: APA, MLA, Chicago, IEEE formats
- **🤖 AI-Powered**: Uses Google Gemini 2.0 Flash model

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Backend:** Next.js API Routes (serverless functions)
- **AI:** Google Generative AI (Gemini 2.0 Flash)
- **PDF Processing:** pdf-parse
- **Deployment:** Vercel

## 🌐 Deployment

See `VERCEL_DEPLOYMENT_GUIDE.md` for complete deployment instructions.

**Quick Deploy:**
1. Push code to GitHub
2. Import to Vercel
3. Set Root Directory: `frontend`
4. Add environment variables
5. Deploy!

## 📝 API Endpoints

All API routes are at `/api/*`:

- `POST /api/papers/upload` - Upload PDF and get summary
- `POST /api/papers/[jobId]/qa` - Ask questions about paper
- `POST /api/ask-about/upload` - Upload PDF for full-text Q&A
- `POST /api/ask-about/[jobId]/qa` - Ask questions (5 max)
- `POST /api/citations` - Generate citation
- `GET /api/health` - Health check

## 🔧 Development

### Build for Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run lint
```

## 📚 Documentation

- **Deployment Guide:** See `VERCEL_DEPLOYMENT_GUIDE.md`
- **API Documentation:** Check `app/api/` routes
- **Components:** See `app/` pages

## ⚠️ Notes

- **Job Storage:** Currently in-memory (resets on server restart)
- **File Size Limit:** 20MB for PDF uploads
- **API Timeout:** Vercel free tier has 10s timeout
- **Environment Variables:** Required for production deployment
