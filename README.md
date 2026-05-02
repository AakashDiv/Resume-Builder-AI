# JobScraper + AI Resume Automation

Full-stack resume, job matching, and auto-apply platform.

This project helps a candidate:

- create or upload a profile/resume,
- fetch jobs from JSearch with Python scraper fallback,
- cache job embeddings in MongoDB,
- score jobs against the candidate profile,
- view live ranked matches on the dashboard,
- queue premium auto-apply jobs through Redis + Bull,
- run Puppeteer-based application automation,
- run daily scheduled matching,
- send apply confirmations and daily digest emails.

For deeper implementation notes, read [PROJECT_PROGRESS.md](./PROJECT_PROGRESS.md).

## Current Status

All planned integration modules are implemented locally:

1. Embedding service + job embedding cache
2. JSearch API as primary job source
3. Match service + live dashboard data
4. Redis + Bull queue infrastructure
5. Puppeteer auto-apply bot
6. Daily scheduler with stop/start control
7. Email notifications + daily digest

Latest local verification:

- Backend smoke suite passes.
- Frontend build passes.
- OpenAI real embeddings still require account credits.
- Email is dry-run by default.
- Auto-apply is dry-run by default.

## Architecture

```text
frontend (React + Vite + Tailwind)
    ->
backend API (Node.js + Express + MongoDB)
    ->
JSearch API (RapidAPI)
    ->
Python Selenium scraper fallback
    ->
OpenAI embeddings/chat or local fallback embeddings
    ->
Redis + Bull auto-apply queue
    ->
Puppeteer browser automation
    ->
node-cron daily scheduler
    ->
Nodemailer email service
```

## Tech Stack

- Frontend: React, Vite, React Router, Axios, TailwindCSS
- Backend: Node.js, Express, Mongoose, JWT, Express Validator, Multer
- Database: MongoDB
- Job API: JSearch via RapidAPI
- Scraper fallback: Python, Selenium, BeautifulSoup, OpenPyXL
- AI: OpenAI, with deterministic embedding fallback
- Queue: Redis, Bull, ioredis
- Automation: Puppeteer
- Scheduler: node-cron
- Email: Nodemailer
- Billing: Stripe Checkout + Stripe webhooks

## Folder Structure

```text
backend/
  config/        # env, DB, app, redis, stripe
  controllers/   # route handlers
  middleware/    # auth, plan guard, upload, errors
  models/        # Mongoose schemas
  routes/        # Express routes
  scheduler/     # node-cron jobs
  scripts/       # smoke tests
  services/      # business logic
  utils/         # parser, JWT helpers, errors

frontend/
  src/           # app routes + base styles
  pages/         # screens
  components/    # reusable UI and resume previews
  services/      # API clients
  data/          # resume templates
  layout/        # route/layout wrappers

scraper/
  linkedin_scraper.py
  run_scraper_wrapper.py
  requirements.txt
```

## Main Product Flow

```text
User creates profile/resume
        ->
User searches jobs or daily scheduler runs
        ->
JSearch fetches jobs
        ->
Python scraper fallback runs if needed
        ->
Jobs are deduped and saved
        ->
Embeddings are cached
        ->
Match scores are saved in JobMatch
        ->
Dashboard shows ranked matches
        ->
Pro user enables auto-apply
        ->
High matches become queued Applications
        ->
Bull worker processes queue
        ->
Puppeteer fills supported application forms
        ->
Email service sends confirmations/digests
```

## Important Local Safety Defaults

Use these while testing locally:

```env
OPENAI_EMBEDDING_PROVIDER=fallback
AUTO_APPLY_DRY_RUN=true
AUTO_APPLY_HEADLESS=true
EMAIL_ENABLED=false
SCHEDULER_RUN_ON_START=false
```

These defaults avoid OpenAI token usage, avoid real application submission, and avoid real email sending.

## Environment Variables

Start from [.env.example](./.env.example).

Core:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai_resume_builder
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
CLIENT_BASE_URL=http://localhost:5173
```

OpenAI:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_EMBEDDING_DIMENSIONS=256
OPENAI_EMBEDDING_MAX_CHARS=2000
OPENAI_EMBEDDING_PROVIDER=fallback
```

JSearch:

```env
RAPIDAPI_KEY=
JSEARCH_HOST=jsearch.p.rapidapi.com
JSEARCH_NUM_PAGES=1
```

Redis and queue:

```env
REDIS_URL=redis://127.0.0.1:6379
QUEUE_ENABLED=true
```

Auto-apply:

```env
AUTO_APPLY_DRY_RUN=true
AUTO_APPLY_HEADLESS=true
AUTO_APPLY_DELAY_MS=30000
LINKEDIN_EMAIL=
LINKEDIN_PASSWORD=
NAUKRI_EMAIL=
NAUKRI_PASSWORD=
```

Scheduler:

```env
SCHEDULER_ENABLED=true
SCHEDULER_TIMEZONE=Asia/Kolkata
JOB_MATCHER_CRON=0 9 * * *
DAILY_DIGEST_CRON=0 9 * * *
SCHEDULER_RUN_ON_START=false
```

Email:

```env
EMAIL_ENABLED=false
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=ResumeBuilder AI <no-reply@localhost>
```

Frontend:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB running locally
- Redis on `127.0.0.1:6379`
- RapidAPI key for JSearch

### Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install

cd ../scraper
pip install -r requirements.txt
```

### Start Redis On Windows

A portable Redis binary is used locally under `tools/redis/`.

```powershell
cd E:\Aakash\ResumeBuilder-jobscrapper\JobScraper-main
Start-Process -FilePath ".\tools\redis\redis-server.exe" -ArgumentList "--bind 127.0.0.1 --port 6379" -WindowStyle Hidden
```

Check Redis:

```powershell
.\tools\redis\redis-cli.exe -h 127.0.0.1 -p 6379 ping
```

Expected:

```text
PONG
```

### Run App

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## Smoke Tests

Run from `backend/`:

```bash
npm run smoke:embedding
npm run smoke:jsearch
npm run smoke:match
npm run smoke:queue
npm run smoke:autoapply
npm run smoke:scheduler
npm run smoke:email
```

Recommended local command when OpenAI credits are unavailable:

```powershell
$env:OPENAI_EMBEDDING_PROVIDER='fallback'
npm run smoke:embedding
npm run smoke:match
Remove-Item Env:\OPENAI_EMBEDDING_PROVIDER
```

Frontend build:

```bash
cd frontend
npm run build
```

## API Overview

Auth:

```http
POST /api/auth/register
POST /api/auth/login
GET /api/protected/me
```

Scraper:

```http
POST /api/scraper/run
```

Matching:

```http
GET /api/match/jobs
POST /api/match/run
GET /api/match/job/:jobId
```

Auto-apply and applications:

```http
POST /api/apply/enable
POST /api/apply/manual/:jobId
GET /api/apply/queue-status
GET /api/applications
PATCH /api/applications/:id/status
```

Scheduler:

```http
GET /api/scheduler/status
POST /api/scheduler/enable
POST /api/scheduler/disable
POST /api/scheduler/run-now
POST /api/scheduler/digest-now
```

Resume:

```http
POST /api/resume/generate
POST /api/resume/improve
POST /api/resume/score
POST /api/resume/tailor
```

Billing:

```http
POST /api/billing/create-checkout-session
POST /api/billing/webhook
```

Health:

```http
GET /api/health
```

## What Still Needs Live Validation

The modules are implemented and locally tested. Before production use:

- Add OpenAI credits and test real embeddings.
- Configure production Redis and SMTP.
- Test real LinkedIn/Naukri flows with:

```env
AUTO_APPLY_DRY_RUN=true
AUTO_APPLY_HEADLESS=false
```

- Review third-party platform terms before enabling real auto-submit.
- Enable real auto-submit only after manual dry-run validation:

```env
AUTO_APPLY_DRY_RUN=false
```

- Consider adding formal unit/integration tests beyond smoke scripts.
- Consider splitting frontend bundles; Vite currently reports a chunk-size warning.
