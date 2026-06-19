# Module 1: Resume Builder Launch Brief

This document explains the first deployment module for NightHire.ai. The first module should focus on the Resume Builder product experience and the public website flow that helps users understand, trust, and start using the builder.

The goal is to redesign the home page around the real product: users can browse resume templates, build a resume, preview it live, customize design settings, and download a PDF.

## Product Understanding

NightHire.ai is currently a resume builder and job-search platform. The complete platform includes resume building, templates, job search, profile setup, AI resume tools, ATS score, resume tailoring, cover letters, subscriptions, application tracking, and blog content.

For Module 1 deployment, the main product should be presented as:

**An ATS-friendly resume builder with professional templates, live preview, design controls, and PDF export.**

Other platform features can be shown as upcoming, secondary, or supporting features, but the home page should not feel scattered. The user should immediately understand:

- I can create a resume here.
- I can choose a professional template.
- I can preview the resume while editing.
- I can customize formatting and colors.
- I can download the resume as a PDF.
- The resume is designed to be ATS-friendly.

## Module 1 Deployment Scope

Module 1 should prioritize the following pages and flows:

- Home page
- Resume template library
- Resume builder
- Live resume preview
- PDF download/export
- Basic template selection
- Basic design customization
- Public pricing/free-start messaging
- Login/signup entry points if needed

The protected app features can remain available, but they should not be the main story of the first launch.

## Main User Flow For Module 1

### Flow 1: Start From Home Page

1. User lands on the home page.
2. User understands the product from the hero section.
3. User sees that the site offers resume templates, live preview, ATS-friendly formatting, and PDF export.
4. User clicks the primary CTA, such as **Build Resume Free**.
5. User opens the resume builder.
6. User fills resume sections.
7. User previews the resume live.
8. User finalizes design/template.
9. User downloads the PDF.

### Flow 2: Start From Templates

1. User opens the template library.
2. User browses templates by category.
3. User previews a template.
4. User clicks **Use Template**.
5. Resume builder opens with that selected template.
6. User edits content.
7. User downloads the resume PDF.

### Flow 3: Builder First

1. User directly opens `/builder`.
2. User starts with a default template.
3. User enters header, experience, education, skills, summary, and additional details.
4. User changes template/design settings if needed.
5. User checks the final preview.
6. User downloads PDF.

## Current Resume Builder Functionality

The resume builder currently supports:

- Public builder route: `/builder`
- Protected builder route: `/app/resume-builder`
- Template selection through query parameter, for example `/builder?template=template-id`
- Multi-step resume editing
- Live A4 resume preview
- PDF export/download
- Template color/design customization
- Resume section checklist
- Professional quality score/checks
- Multi-page preview/export support
- Profile photo upload support in supported templates

## Resume Builder Steps

The builder flow currently includes these steps:

1. Header
2. Experience
3. Education
4. Skills
5. Summary
6. Additional Details
7. Finalize

### Header Step

User can enter:

- Full name
- Professional title/headline
- Email
- Phone
- Location
- Website/social links
- Profile photo where supported
- Template color/design settings where supported

### Experience Step

User can add multiple experience entries:

- Job title
- Employer/company
- City/country
- Start date
- End date
- Currently working checkbox
- Bullet/highlight editor
- Suggested phrase support

### Education Step

User can add multiple education entries:

- Institution
- Location
- Degree
- Field of study
- Start date
- End date
- Currently studying checkbox
- Notes/details

### Skills Step

User can:

- Select recommended skills
- Add custom skills
- Edit selected skills
- Remove skills

### Summary Step

User can:

- Write a professional summary
- Select from prewritten summary options
- Insert selected summary text into the editor

### Additional Details Step

User can add optional sections:

- Languages
- Websites & social links
- Activities
- References
- Certifications & licenses
- Awards & honors
- Custom sections

### Finalize Step

User can:

- Review completed resume sections
- Choose/change template
- Adjust design and formatting
- Check professional quality score
- Preview final resume
- Download/export PDF

## Template Library Functionality

The template page currently supports:

- Template grid
- Category filters
- Search
- Sort
- Grid/compact view toggle
- Template preview modal
- Use Template action

Template categories include:

- All
- Creative
- Modern
- Minimalist
- ATS
- Executive

The important home page message should be:

**Choose a professional template first, then open it directly in the builder.**

## What The Home Page Must Communicate

The redesigned home page should clearly explain the first module in simple user language.

The user should understand:

- This is a resume builder.
- It has ATS-ready templates.
- It has live preview.
- It exports PDF.
- It lets users customize design.
- It helps users create a professional resume faster.

The home page should not feel like a generic AI/jobs platform at the top. Job search, ATS score, cover letter, and AI tools can appear lower as supporting or upcoming features.

## Recommended Home Page Structure

### 1. Hero Section

Purpose: immediately explain the core product and drive resume creation.

Content ideas:

- Headline: Build an ATS-friendly resume that looks professional and exports perfectly.
- Supporting text: Choose a template, edit your details, preview live, and download a polished PDF in minutes.
- Primary CTA: Build Resume Free
- Secondary CTA: Browse Templates
- Visual: live resume builder preview, template preview stack, or editor + resume preview composition

Hero should show the product, not abstract graphics.

### 2. Template Preview Strip

Purpose: prove that templates exist and look professional.

Content:

- ATS templates
- Modern templates
- Minimal/minimalist templates
- Creative templates
- Quick action to browse all templates

### 3. How It Works

Purpose: make the process obvious.

Steps:

1. Pick a template
2. Add your resume details
3. Customize design
4. Preview live
5. Download PDF

### 4. Builder Feature Section

Purpose: explain what users can do inside the builder.

Possible feature cards:

- Live A4 preview
- PDF export
- Multi-page resume support
- Template switching
- Design controls
- Skills and summary helpers
- Photo-supported templates
- Additional custom sections

### 5. ATS-Friendly Message

Purpose: build trust around resume parsing and recruiter review.

Content ideas:

- Clean layouts
- Readable sections
- Professional spacing
- Recruiter-friendly structure
- ATS-focused templates

Avoid overpromising guaranteed hiring results.

### 6. Resume Sections Covered

Purpose: show that the builder handles the complete resume.

Sections:

- Header/contact
- Summary
- Work experience
- Education
- Skills
- Certifications
- Languages
- Projects/custom sections

### 7. Design Customization Section

Purpose: show that users can make the resume match their style.

Controls to mention:

- Font style
- Font size
- Heading size
- Spacing
- Margins
- Accent color
- Template color where supported

### 8. PDF Export Section

Purpose: communicate the final outcome.

Content:

- Download professional PDF
- A4 preview before export
- Multi-page support
- Ready for job applications

### 9. Supporting Platform Features

Purpose: tease the wider platform without distracting from Module 1.

Can be shown as lower-page cards:

- ATS score checker
- Resume improvement
- Resume tailoring
- Cover letter generator
- Job search
- Application tracking

Use copy like:

- Continue improving after you build.
- More tools for your job search workflow.

### 10. Pricing / Free Start Section

Purpose: remove hesitation.

Content:

- Start building free
- Export/resume builder plan messaging
- Pro tools can be mentioned separately if active

### 11. Final CTA

Purpose: push user back into the builder.

CTA options:

- Build Resume Free
- Browse Templates

## Possible Home Page Sections List

Use these as a section pool for the redesign:

- Product hero with live builder preview
- Resume template showcase
- ATS-friendly templates section
- How it works
- Live preview explanation
- PDF export explanation
- Resume builder step walkthrough
- Design customization controls
- Resume sections supported
- Template categories
- Before/after resume quality section
- Trust indicators
- User outcome stats
- FAQ
- Pricing preview
- Career tools preview
- Blog/career resources preview
- Final CTA

## Home Page Design Direction

The design should feel like a modern 2026 SaaS product:

- Premium but practical
- Clean internal-page consistency
- Product-first visual hierarchy
- Real resume previews instead of abstract illustrations
- Clear CTAs
- Spacious sections
- Strong typography
- Subtle shadows and borders
- Professional blue/cyan accent system
- No cluttered feature dumping above the fold

The first viewport should answer:

**What is this website?**

Answer:

**A resume builder where users can choose a template, create a resume, preview it, and download a PDF.**

## Pages Relevant To Module 1

### `/`

Home page. Needs redesign around Resume Builder module.

### `/templates`

Template library. Supports search, filters, preview modal, and Use Template action.

### `/builder`

Public resume builder. Main conversion destination.

### `/pricing`

Pricing page. Should support free-start and Pro upgrade messaging.

### `/login` and `/signup`

Authentication pages. Needed if saving/account flow is part of deployment.

## Pages Not Primary For Module 1

These features exist, but should be secondary in home page messaging during first launch:

- Dashboard
- Job Search
- Profile setup
- Improve Resume
- ATS Score
- Tailor Resume
- Cover Letter
- Applications tracker
- Blog admin
- Blog detail/list pages

They can be mentioned lower on the home page as “career tools” or “coming next” depending on launch readiness.

## Homepage Redesign Prompt Direction

When redesigning the home page, the prompt should say:

Redesign the home page for a modern AI-powered resume builder. The first launch module is resume creation, template browsing, live preview, design customization, and PDF download. The page should help users understand the complete resume builder flow and push them toward Build Resume Free or Browse Templates. Keep job search and AI career tools as supporting sections lower on the page, not the main hero message.

## Success Criteria

The home page redesign is successful if:

- A new user understands the product in 5 seconds.
- The primary CTA clearly starts the resume builder.
- Templates are visible before the user scrolls too far.
- The builder flow feels simple and credible.
- PDF export is clearly communicated.
- ATS-friendly positioning is clear but not exaggerated.
- Supporting tools do not distract from the first module.
- The layout can scale later when more internal pages/modules are launched.



You are a Senior Product Manager, SaaS Architect, UX Strategist, and Technical Documentation Expert.

I am building a product called NightHire.ai.

Before writing anything, understand the project context carefully.

# PROJECT OVERVIEW

NightHire.ai is an AI-powered job seeker platform.

The project is being developed in multiple phases/modules.

Currently ONLY Module 1 is being developed and prepared for deployment.

Do not mention future modules as active features.

Only document features that exist or are part of Module 1 deployment.

---

# MODULE 1 SCOPE (LIVE DEPLOYMENT)

The first deployment includes:

## Resume Builder

Users can:

* Choose resume templates
* Fill resume sections
* Live resume preview
* ATS-friendly resume generation
* Resume scoring
* Resume suggestions
* Resume section management
* Template switching
* Resume customization
* PDF export
* Save draft
* Resume finalization flow

Resume sections:

* Header
* Summary
* Experience
* Education
* Skills
* Additional Details
* Finalize

---

## Template Library

Users can:

* Browse resume templates
* Filter templates
* Search templates
* Preview templates
* Select template
* Open template inside builder

Template categories:

* ATS
* Modern
* Professional
* Creative
* Minimalist

---

## AI Prewriter

When user selects a designation/role:

* Role-based summaries
* Role-based experience suggestions
* Role-based skills suggestions

Examples:

* Full Stack Developer
* Frontend Developer
* Backend Developer
* Digital Marketing Executive
* SEO Specialist

etc.

---

## Blog / Career Resources

Users can:

* Browse career articles
* Search articles
* Filter by categories
* Read resume guides
* Read ATS guides
* Read interview tips

---

# IMPORTANT

The purpose of this document is:

1. Explain what NightHire.ai currently does.
2. Explain user flow.
3. Explain product architecture.
4. Help future designers understand the product.
5. Help redesign the homepage correctly.

Do NOT write generic content.

Write specifically for NightHire.ai.

---

# REQUIRED OUTPUT STRUCTURE

Create a complete DESIGN_IMPLEMENTATION_BRIEF.md

Use the following structure.

# NightHire.ai – Design & Implementation Brief

## 1. Product Vision

Explain:

* What NightHire.ai is
* Who it helps
* Why it exists

---

## 2. Current Deployment Scope (Module 1)

Explain exactly what is available in Module 1.

List every feature.

---

## 3. User Journey

Describe the complete user flow.

Example:

Homepage
→ Browse Templates
→ Select Template
→ Open Resume Builder
→ Fill Resume
→ Use AI Suggestions
→ Check Resume Score
→ Finalize Resume
→ Export PDF

Write every step in detail.

---

## 4. Resume Builder Flow

Explain:

* Sections
* Builder process
* ATS scoring
* Preview system
* Finalization process

---

## 5. Template Library Flow

Explain:

* Search
* Filters
* Categories
* Preview
* Selection

---

## 6. AI Prewriter Flow

Explain:

* Role selection
* Suggestions generation
* Experience suggestions
* Skills suggestions
* Summary suggestions

---

## 7. Blog Flow

Explain:

* Discover content
* Search content
* Read content
* Return to product

---

## 8. Homepage Goals

The homepage must immediately answer:

1. What is this product?
2. Who is it for?
3. Why should I use it?
4. What can I do here?
5. Why is it better than competitors?

---

## 9. Homepage Sections (Recommended)

Based on Module 1 only.

Suggest all possible homepage sections.

For each section provide:

* Purpose
* Content
* CTA
* User benefit

Potential sections:

* Hero
* Product Overview
* Resume Builder Showcase
* Template Marketplace
* ATS Features
* AI Prewriter
* Resume Score Preview
* Resume Creation Flow
* Blog / Career Resources
* Testimonials
* FAQ
* Final CTA

Explain each section thoroughly.

---

## 10. Homepage Information Architecture

Recommend exact order of sections from top to bottom.

Explain WHY each section should appear there.

---

## 11. Conversion Strategy

Explain how homepage should convert users into:

* Template browsers
* Resume builders
* Returning users

---

## 12. Future Expansion Notes

Mention future modules separately.

Clearly mark them as future scope.

Do not mix them with Module 1.

---

Write the document in professional SaaS product documentation style suitable for designers, developers, founders, and future contributors.



read this only and tell me how you will design the homepage 

