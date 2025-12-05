# Research AI Frontend

Next.js frontend application for Research AI Assistant.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file (copy from `.env.local.example`):
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

3. Run development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Build for Production

```bash
npm run build
npm start
```

## Features

- **Home Page**: Landing page with feature cards
- **Understand Paper**: Upload PDF, get summary, and ask questions
- **Citations**: Generate citations in multiple formats (APA, MLA, Chicago, IEEE)

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Axios for API calls
