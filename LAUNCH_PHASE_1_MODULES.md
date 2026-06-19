# Phase 1 Launch Modules

Target window: Next 2-4 weeks

## Core Resume Builder

Status: Ready for Phase 1 launch

| Launch item | Current status | Project evidence |
| --- | --- | --- |
| User creates resume | Present | `ResumeBuilderPage.jsx` contains the guided builder steps: Header, Experience, Education, Skills, Summary, Additional Details, Finalize. |
| User edits resume | Present | `ResumeBuilderContext.jsx` exposes update actions for header, summary, skills, additional sections, experience, and education. Draft data is saved in `localStorage` using `resume_builder_draft_v2`. |
| User downloads PDF | Present | `ResumeBuilderPage.jsx` uses `html2canvas` and `jsPDF`; the `downloadPdf()` function exports resume pages. |
| Multi-page support | Present | Export collects all `[data-resume-page='true']` nodes. The resume engine paginates with `chunkSections()` and `splitSectionsForPagination()`. Standalone templates also render `data-resume-page` pages. |
| A4 size | Present | `ResumeBuilderPage.jsx` defines `A4_WIDTH_MM = "210mm"` and `A4_HEIGHT_MM = "297mm"`. The resume engine uses A4 page dimensions from constants. |
| Templates | Present | `frontend/data/resumeTemplates.js` currently includes 20 templates: 10 ATS, 5 Modern, 2 Minimalist, and 3 Creative. |
| Responsive design | Present | Builder layout uses responsive Tailwind grids and preview scaling from available width to A4 preview size. |
| Profile image upload | Present | `handlePhotoUpload()` reads an uploaded file and saves it to `header.photo`; templates render `data.header.photo` where supported. |

## Modules To Launch

1. Resume Builder Page
   - Route/module: `frontend/pages/ResumeBuilderPage.jsx`
   - Includes resume creation, editing, live preview, template selection, profile image upload, and PDF download.

2. Resume Builder State
   - Module: `frontend/context/ResumeBuilderContext.jsx`
   - Stores resume data, updates form sections, persists drafts, and resets/loads drafts.

3. Resume Templates
   - Module: `frontend/data/resumeTemplates.js`
   - Current launch set: 20 selectable templates.

4. Resume Preview Renderer
   - Module: `frontend/components/ResumePdf/common/DesignableResumePreview.jsx`
   - Routes selected templates to the correct preview component or shared resume engine.

5. Resume Engine Pagination
   - Module: `frontend/components/resume-engine/ResumeRenderer.jsx`
   - Handles A4 rendering and automatic multi-page section pagination for engine templates.

6. PDF Export
   - Module/function: `downloadPdf()` in `frontend/pages/ResumeBuilderPage.jsx`
   - Captures each resume page and writes an A4 PDF.

7. Template Thumbnails
   - Module: `frontend/components/TemplateThumbnail.jsx`
   - Shows selectable visual previews for templates.

## Launch Verdict

All listed Phase 1 Core Resume Builder requirements are present in the current frontend project.

Recommended final QA before launch:

- Test PDF download for one short resume and one long multi-page resume.
- Test profile image upload on photo and non-photo templates.
- Test builder responsiveness on desktop, tablet, and mobile widths.
- Test each template selection opens and exports without layout clipping.
