# JobScraper + AI Resume Studio

Full-stack project that combines:
- Job scraping and export
- AI-assisted resume creation/improvement
- ATS scoring and resume tailoring
- Auth + subscription (Free/Pro) flow

The goal is to help a user find jobs and quickly adapt their resume to a target role in one product.

## Project Purpose

This project solves three problems in one pipeline:
- Find relevant jobs from selected platforms and export them.
- Improve resume quality for ATS/recruiter readability.
- Tailor resume content to a specific job description, with Pro feature gating.

## High-Level Architecture

```text
frontend (React + Vite + Tailwind)
    -> backend API (Node.js + Express + MongoDB)
        -> Python scraper wrapper (Selenium-based scraper)
        -> OpenAI (resume generation/improvement/tailoring when key is set)
        -> Stripe (subscription checkout + webhook plan updates)
```

## Tech Stack

- Frontend: React, Vite, React Router, Axios, TailwindCSS
- Backend: Node.js, Express, Mongoose, JWT, Express Validator, Multer
- AI: OpenAI Chat Completions API
- Billing: Stripe Checkout + Webhooks
- Scraper: Python, Selenium, BeautifulSoup, OpenPyXL
- Database: MongoDB

## Folder Structure

```text
backend/
  config/        # env, DB, app bootstrap, stripe config
  controllers/   # route handlers
  middleware/    # auth, plan guard, upload, errors
  models/        # Mongoose schemas (User)
  routes/        # auth, resume, scraper, billing, protected
  services/      # business logic (AI, scoring, scraper, billing)
  utils/         # parser, JWT helpers, async wrapper, errors

frontend/
  src/           # app routes + base styles
  pages/         # feature screens
  components/    # reusable UI and resume previews
  services/      # API client and feature API calls
  data/          # resume template metadata
  layout/        # route/layout wrappers

scraper/
  linkedin_scraper.py
  run_scraper_wrapper.py
  requirements.txt
```

## Main Features

- User authentication (register/login) with JWT.
- Protected app area under `/app/*`.
- Job search via scraper API with Excel output + downloadable file.
- Resume generator (`/resume/generate`).
- Resume improvement from uploaded PDF/DOCX (`/resume/improve`).
- ATS score against job description (`/resume/score`).
- Resume tailoring to a job description (`/resume/tailor`, Pro-only).
- Stripe subscription checkout and webhook-driven plan updates.

## Project Flow

1. User signs up or logs in.
2. Frontend stores JWT and sends it in API Authorization headers.
3. User searches jobs:
   - Frontend calls `/api/scraper/run`.
   - Backend runs Python wrapper (`run_scraper_wrapper.py`).
   - Scraper creates an `.xlsx` in `backend/tmp`.
   - API returns parsed jobs + download URL.
4. User works on resume:
   - Generate: input form -> AI markdown resume output.
   - Improve: upload resume file -> text extraction + AI rewrite suggestions.
   - ATS score: rule-based scoring + missing keywords + top fixes.
   - Tailor: Pro users only -> AI rewrites summary/top bullets + rescoring.
5. User upgrades plan:
   - Frontend calls `/api/billing/create-checkout-session`.
   - Stripe Checkout completes subscription.
   - Stripe webhook updates `User.plan` to `pro`.

## API Overview

- Auth
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/protected/me`
- Scraper
  - `POST /api/scraper/run`
- Resume
  - `POST /api/resume/generate`
  - `POST /api/resume/improve` (multipart upload, auth)
  - `POST /api/resume/score` (auth)
  - `POST /api/resume/tailor` (auth + Pro)
- Billing
  - `POST /api/billing/create-checkout-session` (auth)
  - `POST /api/billing/webhook` (Stripe)
- Utility
  - `GET /api/health`

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB running locally
- Browser/driver support for Selenium scraper

### 1) Configure environment

Use `.env.example` values and create actual `.env` files as needed.

Required backend keys:
- `MONGO_URI`
- `JWT_SECRET`

Optional but recommended:
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `PYTHON_BIN`

Frontend key:
- `VITE_API_BASE_URL` (default `http://localhost:5000/api`)

### 2) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../scraper && pip install -r requirements.txt
```

### 3) Run services

```bash
cd backend && npm run dev
cd ../frontend && npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

## Notes

- If `OPENAI_API_KEY` is missing, resume services fall back to deterministic non-AI behavior where implemented.
- Tailor Resume is gated by `requireProPlan` middleware.
- Scraper output files are served from `/downloads/*` via `backend/tmp`.

## Optional: Puppeteer PDF Export Config

If you move resume export to backend Puppeteer, use this page setup for A4 consistency:

```js
await page.pdf({
  format: "A4",
  printBackground: true,
  margin: {
    top: "10mm",
    bottom: "10mm",
    left: "10mm",
    right: "10mm"
  }
});
```
