# Project Progress Tracker

**Project:** AI Resume & Job Automation Platform
**Last Updated:** 2026-05-26

---

## Overall Status

| Area | Status |
|------|--------|
| Backend core (auth, profile, resume) | Done |
| Job scraping pipeline | Done |
| AI embedding + match scoring | Done |
| Redis + Bull queue | Done |
| Puppeteer auto-apply bot | Done (dry-run only) |
| Daily scheduler | Done |
| Email notifications | Done |
| Stripe billing | Done |
| Resume Builder UI | Done |
| Resume Templates | Done (shared renderer + distinct templates) |
| Resume rendering engine (preview/PDF/print) | Done |
| Form input visibility fix | Done |
| Cover letter → auto-apply integration | Pending |
| Applications tracker page | Pending |
| Onboarding/profile-completion gate | Pending |
| Live OpenAI embeddings | Pending (needs credits) |
| Production Redis + SMTP | Pending (env config) |
| Real LinkedIn/Naukri auto-apply | Pending (needs live testing) |
| Frontend bundle split | Pending |
| Formal test suite | Pending |

---

## Completed Work Log

### 2026-05-02 — Backend Automation Pipeline (Modules 1–7)

**Module 1: Embedding Service**
- `backend/services/embedding.service.js`
- `getEmbedding()`, `cosineSimilarity()`, `toPercentageScore()`
- OpenAI embeddings + deterministic fallback
- Embeddings cached in `Job.embedding`
- Smoke test: `npm run smoke:embedding`

**Module 2: JSearch API Job Source**
- `backend/services/scraper.service.js`
- JSearch via RapidAPI as primary source
- Python Selenium scraper as fallback
- Deduplication before save
- Smoke test: `npm run smoke:jsearch`

**Module 3: Match Service + Dashboard**
- `backend/services/match.service.js`, `backend/models/JobMatch.js`
- Scoring: semantic similarity + skill overlap
- Free users: top 10 matches. Pro users: all matches
- Dashboard loads real matched jobs
- Smoke test: `npm run smoke:match`

**Module 4: Redis + Bull Queue**
- `backend/config/redis.js`, `backend/services/queueService.js`
- Bull `auto-apply` queue
- Applications enqueued on premium auto-apply trigger
- Queue worker starts with server
- Local Redis: `tools/redis/redis-server.exe`
- Smoke test: `npm run smoke:queue`

**Module 5: Puppeteer Auto-Apply Bot**
- `backend/services/autoApplyService.js`
- LinkedIn EasyApply + Naukri form fill
- CAPTCHA detection → marks application `failed`
- Dry-run mode: marks as `viewed`, no real submit
- Real submit: marks as `applied`, sends email
- Smoke test: `npm run smoke:autoapply`

**Module 6: Daily Scheduler**
- `backend/scheduler/jobMatcher.js`
- node-cron: job matcher at 8 AM, digest at 9 AM (Asia/Kolkata)
- Mongo-backed AutomationSettings (survives restart)
- Dashboard Stop/Start button for Pro users
- Smoke test: `npm run smoke:scheduler`

**Module 7: Email Notifications**
- `backend/services/emailService.js`
- Apply confirmation after real auto-apply
- Daily digest for premium users with `notifyEmail=true`
- `EMAIL_ENABLED=false` in local mode (logs instead of sends)
- Smoke test: `npm run smoke:email`

---

### 2026-05-20 — Resume Template Redesign

**Problem:** Templates looked unpolished, spacing broken, text not visible on inputs.

**Files changed:**

| File | What Changed |
|------|-------------|
| `frontend/components/ResumePdf/templates/resume-template.css` | Full CSS overhaul — name 30px, section titles 9px/0.2em tracking, contact bar flex-wrap, skill tags/chips, `.rich-bullets` for HTML content, print break rules |
| `frontend/components/ResumePdf/templates/ResumeHeader.jsx` | LinkedIn URL cleanup, flex-wrap contact bar, conditional headline |
| `frontend/components/ResumePdf/templates/ResumeSummary.jsx` | Added HTML rich-text support (`sanitizeRichHtml`) |
| `frontend/components/ResumePdf/templates/ResumeExperience.jsx` | Job title + company on separate lines, HTML bullet support, en-dash date |
| `frontend/components/ResumePdf/templates/ResumeSkills.jsx` | Replaced `<ul>` with skill tag chips (`skill-tag` class) |
| `frontend/components/ResumePdf/templates/ResumeEducation.jsx` | Degree / institution / field on separate lines, HTML detail support |
| `frontend/components/ResumePdf/templates/ResumeProjects.jsx` | Proper `name|type|year|desc` parsing, year right-aligned |
| `frontend/components/ResumePdf/Simple/SimplePreview.jsx` | Summary section added, "OTHER" → "Skills & More", better contact/date layout |
| `frontend/components/ResumePdf/Creative/CreativePreview.jsx` | Shows ALL experience + education (was capped at 1 each), better layout |

---

### 2026-05-20 — Form Input Text Visibility Fix

**Problem:** Body CSS sets `color: #F0F4FF` (near-white) for dark theme. Form inputs in the white resume builder container inherited this, making typed text invisible.

**Files changed:**

| File | What Changed |
|------|-------------|
| `frontend/src/index.css` | Added global rule: all non-`.input-dark` inputs get `color: #111827; background-color: #ffffff` |
| `frontend/pages/ResumeBuilderPage.jsx` | `Input` component: added `bg-white text-slate-900 placeholder:text-slate-400` |
| `frontend/pages/ResumeBuilderPage.jsx` | `RichTextEditor` contentEditable div: added `bg-white text-slate-900` |
| `frontend/pages/ResumeBuilderPage.jsx` | All inline `<input>`, `<select>`, `<textarea>` in form steps: added `text-slate-900 bg-white` |

---

### 2026-05-26 - Resume Builder Rendering Engine

**Problem:** Live preview, template thumbnails, print view, and exported PDF could drift apart because older templates used separate preview components and PDF export sliced one tall canvas. Template thumbnails also began looking identical after moving to a shared renderer because generic design settings were overriding template identity.

**Goal:** Professional resume-builder behavior like Resume.io/Canva-style builders: one rendering system for preview, print, and PDF export, exact A4 pages, consistent typography, page-safe rendering, and scalable template variants.

**Current resume builder flow:**

```text
User selects template
        ->
frontend/data/resumeTemplates.js identifies template id/name/category
        ->
ResumeBuilderPage normalizes resume data for PDF safety
        ->
DesignableResumePreview adapter calls ResumeRenderer
        ->
ResumeRenderer resolves template config from resume-engine/templates/templateRegistry.js
        ->
resumeContent.js converts draft data into renderable sections
        ->
SectionRenderer renders shared section components
        ->
PageRenderer renders exact A4 pages
        ->
Live preview, modal preview, hidden PDF export, print, and thumbnails use same component tree
```

**New engine folder:**

```text
frontend/components/resume-engine/
  ResumeRenderer.jsx        # main engine, template resolution, pagination
  PageRenderer.jsx          # exact A4 page shell
  SectionRenderer.jsx       # shared section dispatcher
  constants.js              # A4, font, spacing, density tokens
  templates/
    templateRegistry.js     # visual identity for every template
  styles/
    resume-engine.css       # print-safe A4 CSS and template variants
  utils/
    resumeContent.js        # converts draft data into renderable sections
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

**Important files changed:**

| File | What Changed |
|------|-------------|
| `frontend/components/ResumePdf/common/DesignableResumePreview.jsx` | Now acts as adapter into `ResumeRenderer` |
| `frontend/pages/ResumeBuilderPage.jsx` | PDF export captures rendered A4 pages one by one instead of slicing one tall image |
| `frontend/components/TemplateThumbnail.jsx` | Thumbnails render real engine templates using template registry defaults |
| `frontend/components/resume-engine/templates/templateRegistry.js` | Defines each template's layout, header style, section style, skill style, and colors |
| `frontend/components/resume-engine/styles/resume-engine.css` | Adds exact A4 sizing, print rules, page safety, and visual variants |

**Template system now supports:**

- `layout`: `single`, `accent-rail`, `soft-panel`
- `headerStyle`: `band`, `line`, `line-centered`, `minimal`, `split`, `editorial`
- `sectionStyle`: `rule`, `underline`, `plain`, `accent-left`, `pill`, `tech`, `gold-rule`
- `skillStyle`: `boxed`, `plain`, `inline`, `pill`
- `colors`: accent, header background, page surface, text, muted text, subtle background, border, inverse text

**Current templates verified as visually distinct:**

- `sharp-classic`
- `classic-pro`
- `modern-edge`
- `executive-lite`
- `creative-grid`
- `minimal-clean`
- `simple-professional`
- `tech-focus`
- `modern-isabel`

**Pagination and PDF behavior:**

- Page size is fixed A4: `210mm x 297mm`.
- Browser measurement for PDF pages is about `794 x 1123px`.
- Short resumes will naturally show blank bottom whitespace; this is correct A4 behavior, not a bug.
- PDF export queries `[data-resume-page="true"]` and captures each page into jsPDF.
- Experience, education, and projects paginate at entry level to avoid clipping large sections.
- Section titles and entries use `break-inside: avoid` / `page-break-inside: avoid`.

**How to add a new resume template:**

1. Add metadata to `frontend/data/resumeTemplates.js`.
2. Add visual config to `frontend/components/resume-engine/templates/templateRegistry.js`.
3. Reuse existing section components unless the template truly needs a new layout primitive.
4. Add CSS only under `.resume-template-{id}` or data attributes in `resume-engine.css`.
5. Test `/builder?template={id}` and `npm run build`.

**Verification performed:**

- `npm run build` passes.
- Browser-tested short and long resumes with Puppeteer.
- Verified all templates render without overflow.
- Existing Vite large chunk warning remains and is unrelated to resume rendering.

---

## Pending Work

### Must Do Before Production

| # | Task | Notes |
|---|------|-------|
| 1 | Add OpenAI credits | Switch `OPENAI_EMBEDDING_PROVIDER=openai` |
| 2 | Configure SMTP | `EMAIL_ENABLED=true`, set SMTP_HOST/USER/PASS |
| 3 | Configure production Redis | Set `REDIS_URL` to remote provider |
| 4 | Test LinkedIn/Naukri flows (dry-run, visible browser) | `AUTO_APPLY_DRY_RUN=true` + `AUTO_APPLY_HEADLESS=false` |
| 5 | Enable real auto-submit only after step 4 | `AUTO_APPLY_DRY_RUN=false` |
| 6 | Review platform ToS before live auto-apply | LinkedIn/Naukri may ban automated applications |

### Feature Gaps (Nice to Have)

| # | Feature | Why It Matters |
|---|---------|---------------|
| 1 | Wire cover letter generation into auto-apply queue | Puppeteer submits without cover letter today |
| 2 | Add Applications tracker page | Users can't audit what the bot applied to |
| 3 | Profile-completion gate before job search | Empty profiles produce garbage match scores |
| 4 | Stagger scheduler crons (8 AM match, 9 AM digest) | Digest currently fires before matching finishes |
| 5 | Split frontend bundle | Vite chunk-size warning: one chunk is ~1094 kB |
| 6 | Add formal unit/integration tests | Only smoke scripts exist today |
| 7 | User-facing audit log for auto-actions | Builds trust for automation features |
| 8 | Add automated visual regression tests for resume templates | Protects preview/PDF/template consistency |

---

## Environment Quick Reference

### Local Dev (safe defaults)

```env
OPENAI_EMBEDDING_PROVIDER=fallback
AUTO_APPLY_DRY_RUN=true
AUTO_APPLY_HEADLESS=true
EMAIL_ENABLED=false
SCHEDULER_RUN_ON_START=false
ALLOW_TEST_PRO_UPGRADE=true
```

### Start Local Redis (Windows)

```powershell
Start-Process -FilePath ".\tools\redis\redis-server.exe" -ArgumentList "--bind 127.0.0.1 --port 6379" -WindowStyle Hidden
```

### Run Smoke Tests

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

### Start Dev Servers

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

---

## Rules for Future Changes

- Never hardcode API keys
- Keep `AUTO_APPLY_DRY_RUN=true` unless explicitly testing real submit
- Keep `OPENAI_EMBEDDING_PROVIDER=fallback` when OpenAI credits unavailable
- Do not remove Python scraper fallback — used when JSearch fails
- Scheduler is daily (not hourly) by design — saves API quota
- `ALLOW_TEST_PRO_UPGRADE=true` is local only — backend blocks it in production
- `tools/redis/` is git-ignored — never commit it
- When adding new automation: add a smoke script + update this file
- When changing resume templates: keep rendering inside `resume-engine/`; preview, print, PDF, and thumbnails must share `ResumeRenderer`
