# Project Progress And Architecture Notes

Last updated: 2026-05-26

## What We Are Building

This project is an AI resume and job automation platform. The product lets a candidate create or upload a profile/resume, search for jobs, rank those jobs against the candidate profile, and for premium users queue automatic applications. It also includes subscription billing, application tracking, scheduled daily matching, and email notifications.

The intended product flow is:

```text
Candidate creates profile/resume
        ->
System fetches jobs from JSearch, with Python scraper fallback
        ->
Jobs are deduped, embedded, and saved in MongoDB
        ->
Match service scores jobs against the candidate profile
        ->
Dashboard shows live ranked matches
        ->
Premium users can queue auto-apply
        ->
Bull + Redis process queued applications
        ->
Puppeteer fills supported application flows
        ->
Daily scheduler refreshes matches and sends digest emails
```

## High-Level Stack

- Frontend: React, Vite, TailwindCSS, React Router, Axios
- Backend: Node.js, Express, Mongoose, JWT auth
- Database: MongoDB
- Job source: JSearch via RapidAPI, with Python Selenium scraper fallback
- AI: OpenAI embeddings/chat where quota is available, deterministic fallback for local embeddings
- Queue: Redis + Bull
- Browser automation: Puppeteer
- Scheduler: node-cron
- Email: Nodemailer
- Billing: Stripe Checkout + webhook plan updates

## Resume Builder Rendering Architecture

The resume builder now uses a universal rendering engine so live preview, modal preview, print layout, PDF export, and template thumbnails all render from the same component tree.

### Resume Builder Flow

```text
Template selected from frontend/data/resumeTemplates.js
        ->
ResumeBuilderPage stores selectedTemplateId and designSettings
        ->
resume data is normalized through normalizeResumeForPdf()
        ->
DesignableResumePreview receives selectedTemplate + resumeData + designSettings
        ->
DesignableResumePreview calls ResumeRenderer
        ->
ResumeRenderer resolves visual config from resume-engine/templates/templateRegistry.js
        ->
resume-engine/utils/resumeContent.js builds renderable sections
        ->
SectionRenderer dispatches shared section components
        ->
PageRenderer renders exact A4 pages
        ->
The same pages are used for live preview, print, PDF capture, and thumbnails
```

### Engine Files

```text
frontend/components/resume-engine/
  ResumeRenderer.jsx
  PageRenderer.jsx
  SectionRenderer.jsx
  constants.js
  templates/templateRegistry.js
  styles/resume-engine.css
  utils/resumeContent.js
  sections/
    ResumeHeader.jsx
    ResumeSummary.jsx
    ResumeExperience.jsx
    ResumeEducation.jsx
    ResumeProjects.jsx
    ResumeSkills.jsx
    AdditionalSections.jsx
    RichText.jsx
```

### Rendering Rules

- A4 is fixed at `210mm x 297mm`.
- Browser capture size is approximately `794 x 1123px`.
- Blank bottom space on short resumes is expected; the page must remain A4 and should not be cropped.
- `ResumeBuilderPage.downloadPdf()` captures each `[data-resume-page="true"]` page separately with `html2canvas`, then adds each page to `jsPDF`.
- Resume sections are shared components, not separate preview/PDF implementations.
- Experience, education, and projects paginate at entry level so long sections do not clip.
- Print-safe CSS lives in `resume-engine/styles/resume-engine.css` with `@page`, exact A4 dimensions, and `break-inside` rules.

### Template Model

Each template has public metadata in `frontend/data/resumeTemplates.js` and engine identity in `frontend/components/resume-engine/templates/templateRegistry.js`.

Template registry supports:

- `layout`: `single`, `accent-rail`, `soft-panel`
- `headerStyle`: `band`, `line`, `line-centered`, `minimal`, `split`, `editorial`
- `sectionStyle`: `rule`, `underline`, `plain`, `accent-left`, `pill`, `tech`, `gold-rule`
- `skillStyle`: `boxed`, `plain`, `inline`, `pill`
- `colors`: `accent`, `headerBg`, `surface`, `text`, `muted`, `subtle`, `border`, `inverse`

Current templates:

- `sharp-classic`
- `classic-pro`
- `modern-edge`
- `executive-lite`
- `creative-grid`
- `minimal-clean`
- `simple-professional`
- `tech-focus`
- `modern-isabel`

### Adding A New Template

1. Add the template card metadata to `frontend/data/resumeTemplates.js`.
2. Add visual identity to `resume-engine/templates/templateRegistry.js`.
3. Prefer existing layout/header/section/skill styles first.
4. Add CSS under `.resume-template-{id}` or the renderer data attributes only when needed.
5. Test the builder route:

```text
http://127.0.0.1:5173/builder?template={template-id}
```

6. Run:

```bash
cd frontend
npm run build
```

### Verified Behavior

- All current templates render as visually distinct.
- Short resumes stay one exact A4 page with expected whitespace.
- Longer resumes paginate without overflow in tested cases.
- Frontend build passes.
- Vite still warns about a large JS chunk; this is unrelated to resume rendering.

## Important Runtime Modes

Local testing is intentionally safe and low-cost:

```env
OPENAI_EMBEDDING_PROVIDER=fallback
AUTO_APPLY_DRY_RUN=true
EMAIL_ENABLED=false
SCHEDULER_RUN_ON_START=false
ALLOW_TEST_PRO_UPGRADE=true
```

Live mode can later use:

```env
OPENAI_EMBEDDING_PROVIDER=openai
AUTO_APPLY_DRY_RUN=false
EMAIL_ENABLED=true
SCHEDULER_ENABLED=true
```

## Completed Modules

### Module 1: Embedding Service And Job Embedding Cache

Status: implemented and smoke-tested.

Files:

- `backend/services/embedding.service.js`
- `backend/models/Job.js`
- `backend/services/match.service.js`
- `backend/scripts/smokeEmbeddingModule.js`

What it does:

- Provides `getEmbedding()`, `cosineSimilarity()`, `toPercentageScore()`.
- Adds reusable job embedding text builder.
- Stores embeddings in `Job.embedding`.
- Reuses cached embeddings when the same job is saved again.
- Backfills missing job/profile embeddings during matching.
- Supports OpenAI embeddings or deterministic fallback.
- Supports smaller OpenAI vectors through `OPENAI_EMBEDDING_DIMENSIONS`.
- Supports token/cost control through `OPENAI_EMBEDDING_MAX_CHARS`.

Test:

```bash
cd backend
npm run smoke:embedding
```

Known note:

- OpenAI real embeddings require account credits. With no credits, fallback embeddings work locally.

### Module 2: JSearch API As Primary Job Source

Status: implemented and smoke-tested.

Files:

- `backend/services/scraper.service.js`
- `backend/controllers/scraper.controller.js`
- `backend/config/env.js`
- `backend/scripts/smokeJSearch.js`

What it does:

- Calls JSearch via RapidAPI first.
- Uses `RAPIDAPI_KEY`, `JSEARCH_HOST`, and `JSEARCH_NUM_PAGES`.
- Normalizes JSearch rows into the existing job shape.
- Dedupes jobs before saving.
- Falls back to the Python scraper if JSearch is missing, fails, or returns no jobs.
- Returns response metadata: `source`, `jsearch`, and `fallback`.

Test:

```bash
cd backend
npm run smoke:jsearch
```

### Module 3: Match Service And Live Dashboard Data

Status: implemented and smoke-tested.

Files:

- `backend/services/match.service.js`
- `backend/models/JobMatch.js`
- `backend/controllers/match.controller.js`
- `backend/routes/match.routes.js`
- `frontend/pages/DashboardPage.jsx`
- `frontend/services/matchApi.js`
- `backend/scripts/smokeMatchModule.js`

What it does:

- Saves job scores in `JobMatch`.
- Calculates match score from semantic embedding similarity and skill overlap.
- Runs matching after scrape/save.
- `GET /api/match/jobs` returns Mongo-backed scored jobs.
- Free users see top 10 matches.
- Pro users see all matches.
- Dashboard loads real matched jobs instead of static data.

Test:

```bash
cd backend
npm run smoke:match
```

### Module 4: Redis + Bull Queue Infrastructure

Status: implemented and smoke-tested.

Files:

- `backend/config/redis.js`
- `backend/services/queueService.js`
- `backend/scripts/smokeQueueModule.js`
- `backend/server.js`
- `backend/services/application.service.js`
- `backend/services/match.service.js`

What it does:

- Adds Redis connection support through `REDIS_URL`.
- Adds Bull `auto-apply` queue.
- Enqueues `Application` records when premium auto-apply creates queued jobs.
- Starts a queue worker when the backend starts.
- Adds queue status into apply queue status response.
- Supports queue disable through `QUEUE_ENABLED=false`.

Local Redis:

- Portable Redis exists under `tools/redis/`.
- `tools/` is ignored by git.
- Start local Redis:

```powershell
cd E:\Aakash\ResumeBuilder-jobscrapper\JobScraper-main
Start-Process -FilePath ".\tools\redis\redis-server.exe" -ArgumentList "--bind 127.0.0.1 --port 6379" -WindowStyle Hidden
```

Test:

```bash
cd backend
npm run smoke:queue
```

### Module 5: Puppeteer Auto-Apply Bot

Status: implemented and locally smoke-tested with a mock LinkedIn-style page.

Files:

- `backend/services/autoApplyService.js`
- `backend/services/queueService.js`
- `backend/scripts/smokeAutoApplyModule.js`

What it does:

- Adds `autoApplyToJob()`.
- Adds `fillLinkedInEasyApply()`.
- Adds `fillNaukriForm()`.
- Detects CAPTCHA/recaptcha and marks application `failed`.
- Marks dry-run successful form reaches as `viewed`.
- Marks real successful submits as `applied`.
- Sends apply confirmation after real successful submit.
- Supports optional LinkedIn/Naukri credentials through env.
- Queue worker now calls Puppeteer service instead of only logging.
- Bull limiter enforces delay between applications through `AUTO_APPLY_DELAY_MS`.

Test:

```bash
cd backend
npm run smoke:autoapply
```

Known note:

- Real LinkedIn/Naukri pages still need careful manual live testing with `AUTO_APPLY_DRY_RUN=true` and `AUTO_APPLY_HEADLESS=false` before enabling submit.

### Module 6: Daily Scheduler And Automatic Work Stop/Start

Status: implemented and smoke-tested.

Files:

- `backend/scheduler/jobMatcher.js`
- `backend/models/AutomationSettings.js`
- `backend/services/automationSettings.service.js`
- `backend/controllers/scheduler.controller.js`
- `backend/routes/scheduler.routes.js`
- `frontend/services/schedulerApi.js`
- `frontend/pages/DashboardPage.jsx`
- `backend/scripts/smokeSchedulerModule.js`

What it does:

- Uses `node-cron`.
- Runs daily by default, not hourly.
- Default job matcher cron: `0 9 * * *`.
- Default daily digest cron: `0 9 * * *`.
- Finds candidate profiles, fetches fresh jobs from JSearch, saves jobs, runs matching, and queues premium auto-apply matches.
- Daily digest cron calls email service.
- Adds Mongo-backed automation settings so stop/start survives server restart.
- Adds frontend dashboard button for Pro users to stop/start automatic daily work.

Scheduler APIs:

```http
GET /api/scheduler/status
POST /api/scheduler/enable
POST /api/scheduler/disable
POST /api/scheduler/run-now
POST /api/scheduler/digest-now
```

Test:

```bash
cd backend
npm run smoke:scheduler
```

### Module 7: Email Notifications And Daily Digest

Status: implemented and smoke-tested in local dry-run mode.

Files:

- `backend/services/emailService.js`
- `backend/services/autoApplyService.js`
- `backend/scheduler/jobMatcher.js`
- `backend/scripts/smokeEmailModule.js`

What it does:

- Uses Nodemailer.
- Sends apply confirmation after a real successful auto-apply.
- Sends daily digest to premium users with `notifyEmail=true`.
- In local/default mode with `EMAIL_ENABLED=false`, logs/skips email instead of sending.

Test:

```bash
cd backend
npm run smoke:email
```

## Current API Surface Added By Integration

Match:

```http
GET /api/match/jobs
POST /api/match/run
GET /api/match/job/:jobId
```

Apply and queue:

```http
POST /api/apply/enable
POST /api/apply/manual/:jobId
GET /api/apply/queue-status
```

Scheduler:

```http
GET /api/scheduler/status
POST /api/scheduler/enable
POST /api/scheduler/disable
POST /api/scheduler/run-now
POST /api/scheduler/digest-now
```

Scraper:

```http
POST /api/scraper/run
```

## Smoke Test Suite

Run Redis first if testing queue/auto-apply:

```powershell
cd E:\Aakash\ResumeBuilder-jobscrapper\JobScraper-main
Start-Process -FilePath ".\tools\redis\redis-server.exe" -ArgumentList "--bind 127.0.0.1 --port 6379" -WindowStyle Hidden
```

Then:

```bash
cd backend
npm run smoke:embedding
npm run smoke:jsearch
npm run smoke:match
npm run smoke:queue
npm run smoke:autoapply
npm run smoke:scheduler
npm run smoke:email
```

Frontend build:

```bash
cd frontend
npm run build
```

Latest verified result:

- All backend smoke tests pass.
- Frontend build passes.
- Vite reports only a chunk-size warning.

## Pending Work And Live-Hardening

The planned modules are implemented, but these items remain before production/live use:

1. Add OpenAI credits and switch `OPENAI_EMBEDDING_PROVIDER=openai`.
2. Test real LinkedIn/Naukri flows manually in dry-run visible-browser mode:

```env
AUTO_APPLY_DRY_RUN=true
AUTO_APPLY_HEADLESS=false
```

3. Only after real-site dry-run testing, enable real submit:

```env
AUTO_APPLY_DRY_RUN=false
```

4. Configure SMTP for real email sending:

```env
EMAIL_ENABLED=true
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

5. Add production Redis provider and set `REDIS_URL`.
6. Review legal/terms implications of automated applying on third-party job platforms.
7. Consider a user-facing audit log for every automatic action.
8. Consider splitting frontend bundle because Vite warns that one chunk is larger than 500 kB.
9. Consider adding formal tests beyond smoke scripts.

## Guidance For Future Developers Or AI Agents

- Do not hardcode API keys.
- Keep `AUTO_APPLY_DRY_RUN=true` unless explicitly testing real submit.
- Use `OPENAI_EMBEDDING_PROVIDER=fallback` when OpenAI credits are unavailable.
- Do not remove Python scraper fallback; it is still useful when JSearch fails.
- The scheduler is intentionally daily, not hourly, to save tokens/API usage.
- The dashboard Stop/Start button controls automatic work through Mongo-backed `AutomationSettings`.
- The Subscription page has a local-only `Activate Test Pro` button guarded by `ALLOW_TEST_PRO_UPGRADE` and disabled in production.
- `tools/redis/` is local-only and ignored by git.
- When adding new automation, update this file and add a smoke script.
