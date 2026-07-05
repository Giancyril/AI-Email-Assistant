# AI Email Assistant

Draft replies, summarize long email threads, and suggest follow-ups based on tone and context.

**Stack**: Next.js (App Router) · Express.js · PostgreSQL (Prisma ORM) · Google Gemini API · Gmail API (Google Cloud)

---

## Folder Structure

```
ai-email-assistant/
├── frontend/                   # Next.js App Router project
│   ├── src/
│   │   ├── app/                # App Router pages (inbox, login, callback)
│   │   ├── components/         # Reusable UI components
│   │   └── lib/                # API client (axios) configuration
│
└── backend/                    # Express API
    ├── prisma/                 # Prisma Schema
    └── src/
        ├── config/             # Configuration (Google OAuth)
        ├── middleware/         # Auth verification
        ├── routes/             # API routes (auth, emails, ai)
        └── services/           # Service integrations (gmail, gemini)
```

---

## Setup Instructions

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Copy the environment variables template and configure them:
   ```bash
   cp .env.example .env
   ```
3. Run the Prisma migrations to set up your database schema:
   ```bash
   npx prisma migrate dev
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Copy the environment variables template and configure them:
   ```bash
   cp .env.example .env
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
