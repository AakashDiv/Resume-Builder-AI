import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBriefcase,
  FaCheck,
  FaCircleCheck,
  FaEye,
  FaFilePdf,
  FaGaugeHigh,
  FaLayerGroup,
  FaMagnifyingGlass,
  FaRegFileLines,
  FaRocket,
  FaShieldHalved,
  FaWandMagicSparkles
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import TemplateThumbnail from "../components/TemplateThumbnail.jsx";
import { resumeTemplates } from "../data/resumeTemplates.js";
import ResumeUploadCard from "../components/ResumeUploadCard.jsx";

const features = [
  {
    icon: FaRegFileLines,
    title: "Resume Builder",
    desc: "Create an ATS-ready resume with live A4 preview, multi-page rendering, image upload, and PDF export.",
    label: "Free"
  },
  {
    icon: FaLayerGroup,
    title: "Template Library",
    desc: "Choose from ATS, Modern, Creative, and Minimalist templates that stay editable inside the builder.",
    label: "20 templates"
  },
  {
    icon: FaGaugeHigh,
    title: "ATS Score",
    desc: "Paste a resume and job description to find score gaps, keyword misses, and practical improvements.",
    label: "Pro"
  },
  {
    icon: FaMagnifyingGlass,
    title: "Job Search",
    desc: "Search roles across LinkedIn, Naukri, Indeed, Foundit, and Glassdoor from one workspace.",
    label: "Live jobs"
  },
  {
    icon: FaWandMagicSparkles,
    title: "AI Resume Improve",
    desc: "Upload a resume and get rewritten suggestions, missing keywords, and an improvement score.",
    label: "Pro"
  },
  {
    icon: FaBriefcase,
    title: "Application Tracking",
    desc: "Track queued, applied, viewed, responded, rejected, and failed applications after matching.",
    label: "Pro"
  }
];

const steps = [
  ["01", "Build your resume", "Add profile, skills, education, experience, summary, and custom sections."],
  ["02", "Choose a template", "Pick a template and tune typography, colors, spacing, and preview settings."],
  ["03", "Match with jobs", "Save your candidate profile, search jobs, and rank opportunities by match score."],
  ["04", "Apply smarter", "Generate cover letters, tailor resumes, and track applications from one account."]
];

const stats = [
  ["20", "Resume templates"],
  ["A4", "PDF export"],
  ["5", "Job platforms"],
  ["AI", "Matching tools"]
];

const floatingChips = [
  { label: "ATS Approved", icon: FaCircleCheck, className: "home26-chip-a" },
  { label: "PDF Export", icon: FaFilePdf, className: "home26-chip-b" },
  { label: "94% match", icon: FaGaugeHigh, className: "home26-chip-c" },
  { label: "Profile ready", icon: FaCheck, className: "home26-chip-d" }
];

function findTemplate(ids, fallbackIndex = 0) {
  return ids.map((id) => resumeTemplates.find((template) => template.id === id)).find(Boolean) || resumeTemplates[fallbackIndex];
}

function floatTransition(delay = 0) {
  return {
    y: [0, -10, 0],
    rotate: [0, 1.6, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }
  };
}

function FadeIn({ children, delay = 0, className = "" }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

function ResumeDocument3D() {
  const reduceMotion = useReducedMotion();
  const heroTemplate = resumeTemplates.find((template) => template.id === "modern-professional-5") || resumeTemplates.find((template) => template.category === "Modern") || resumeTemplates[0];

  return (
    <div className="home26-hero-visual" aria-hidden="true">
      <motion.div
        className="home26-document-stage"
        animate={reduceMotion ? undefined : floatTransition(0.1)}
        whileHover={reduceMotion ? undefined : { rotateX: 10, rotateY: -13, y: -8 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
      >
        <div className="home26-builder-frame">
          <div className="home26-builder-toolbar">
            <div>
              <span />
              <span />
              <span />
            </div>
            <strong>Live Resume Preview</strong>
            <em>A4 PDF</em>
          </div>
          <div className="home26-builder-body">
            <div className="home26-builder-sidebar">
              {["Header", "Experience", "Skills", "Design"].map((item, index) => (
                <span key={item} className={index === 0 ? "is-active" : ""}>{item}</span>
              ))}
            </div>
            <div className="home26-builder-preview">
              <TemplateThumbnail template={heroTemplate} />
            </div>
          </div>
          <div className="home26-builder-status">
            <span><FaCircleCheck /> ATS friendly</span>
            <span><FaFilePdf /> Export ready</span>
          </div>
        </div>
      </motion.div>

      {floatingChips.map((chip, index) => {
        const Icon = chip.icon;
        return (
          <motion.div
            key={chip.label}
            className={`home26-floating-chip ${chip.className}`}
            animate={reduceMotion ? undefined : floatTransition(index * 0.45)}
          >
            <Icon />
            <span>{chip.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

function FeatureCard({ feature, index }) {
  const Icon = feature.icon;
  return (
    <FadeIn delay={index * 0.05}>
      <motion.article
        className="home26-feature-card"
        whileHover={{ y: -8, rotateX: 3, rotateY: -3 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
      >
        <div className="home26-feature-icon">
          <Icon />
        </div>
        <div className="home26-feature-label">{feature.label}</div>
        <h3>{feature.title}</h3>
        <p>{feature.desc}</p>
      </motion.article>
    </FadeIn>
  );
}

function TemplateShowcase({ navigate }) {
  const showcaseTemplates = useMemo(() => {
    return resumeTemplates.slice(0, 9);
  }, []);

  return (
    <div className="home26-template-grid-showcase">
      <div className="home26-template-grid" aria-label="Resume templates">
        {showcaseTemplates.map((template, index) => (
          <motion.article
            key={template.id}
            className="home26-template-grid-card"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.03 }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <div className="home26-template-grid-preview">
              <TemplateThumbnail template={template} />
            </div>
            <div className="home26-template-grid-info">
              <div>
                <h3>{template.name}</h3>
                <p>{template.category}</p>
              </div>
              <span>ATS Friendly</span>
            </div>
            <button type="button" onClick={() => navigate(`/builder?template=${template.id}`)}>
              Use Template
            </button>
          </motion.article>
        ))}
      </div>
      <div className="home26-template-grid-actions">
        <button type="button" className="home26-secondary-btn" onClick={() => navigate("/templates")}>
          Browse All Templates
        </button>
      </div>
    </div>
  );
}

function PremiumTemplateMarketplaceHero({ navigate }) {
  const heroTemplates = useMemo(
    () =>
      [
        "ats-friendly-resume-10",
        "modern-professional-5",
        "professional-cv",
        "creative-1",
        "black-white-minimalist"
      ]
        .map((id, index) => ({ template: findTemplate([id], index), index }))
        .filter((item) => item.template),
    []
  );

  return (
    <section className="home26-marketplace-hero-wrap">
      <div className="home26-shell">
        <section className="nh-template-hero home26-marketplace-hero" aria-label="Premium resume template marketplace">
          <div className="nh-hero-copy">
            <span className="nh-hero-badge">
              <FaShieldHalved /> Premium ATS-ready templates
            </span>
            <h1>Start with a resume that already looks hired.</h1>
            <p>
              Explore polished, recruiter-friendly resume templates built for ATS scans, executive roles,
              creative portfolios, and modern job applications.
            </p>
            <div className="nh-hero-metrics" aria-label="Template marketplace metrics">
              <span><strong>{resumeTemplates.length}</strong><em>Templates</em></span>
              <span><strong>92+</strong><em>ATS Score</em></span>
              <span><strong>PDF</strong><em>Export ready</em></span>
            </div>
            <div className="nh-hero-actions">
              <button type="button" onClick={() => navigate("/templates")}>
                Browse templates <FaArrowRight />
              </button>
              <button type="button" onClick={() => navigate("/templates?category=ATS")}>View ATS picks</button>
            </div>
          </div>

          <div className="nh-hero-gallery" aria-label="Featured resume templates">
            <span className="nh-float-badge nh-float-ats"><FaShieldHalved /> ATS 96</span>
            <span className="nh-float-badge nh-float-pdf"><FaFilePdf /> PDF Export</span>
            <span className="nh-float-badge nh-float-pages">Multi-page ready</span>
            <div className="nh-gallery-stage">
              {heroTemplates.map(({ template, index }) => (
                <button
                  key={`${template.id}-homepage-hero`}
                  type="button"
                  className={`nh-hero-template nh-hero-template-${index + 1}`}
                  onClick={() => navigate(`/builder?template=${template.id}`)}
                  style={{ "--template-accent": template.accent || "#0EA5C8" }}
                  aria-label={`Use ${template.name}`}
                >
                  <span className="nh-hero-template-tag">{template.category}</span>
                  <TemplateThumbnail template={template} fit="cover" />
                  {index === 0 ? (
                    <span className="nh-hero-template-meta">
                      <strong>Featured ATS</strong>
                      <em>Popular</em>
                    </span>
                  ) : null}
                  <span className="nh-hero-template-preview"><FaEye /> Quick Preview</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function ResumeExampleStack() {
  const examples = [
    ["Profile", "Candidate data, target role, salary range, preferred cities."],
    ["ATS Score", "Keyword gaps, breakdown score, missing terms, next fixes."],
    ["Applications", "Queued, applied, viewed, responded, rejected, failed."]
  ];

  return (
    <div className="home26-example-stack" aria-label="Resume workflow examples">
      {examples.map(([title, text], index) => (
        <motion.article
          key={title}
          className="home26-example-card"
          style={{ "--example-index": index }}
          whileHover={{ y: -10, rotateY: index === 1 ? 0 : index === 0 ? -4 : 4 }}
          transition={{ type: "spring", stiffness: 170, damping: 18 }}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <h3>{title}</h3>
          <p>{text}</p>
        </motion.article>
      ))}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const ctaTemplate = resumeTemplates.find((template) => template.id === "modern-professional-5") || resumeTemplates.find((template) => template.category === "Modern") || resumeTemplates[0];

  return (
    <main className="home26-page">
      <PremiumTemplateMarketplaceHero navigate={navigate} />

      <section className="home26-hero">
        <div className="home26-ambient" aria-hidden="true" />
        <div className="home26-shell home26-hero-grid">
          <div className="home26-hero-copy">
            <motion.div
              className="home26-eyebrow"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <FaWandMagicSparkles />
              AI resume builder and job matching platform
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
            >
              Build a resume that feels ready for the next opportunity.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
            >
              Create an ATS-ready A4 resume, export it as PDF, search jobs, match your profile to roles, and use AI tools when you need a sharper application.
            </motion.p>
            <motion.div
              className="home26-hero-actions"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24 }}
            >
              <button type="button" className="home26-primary-btn" onClick={() => navigate("/builder")}>
                Build resume free
                <FaArrowRight />
              </button>
              <ResumeUploadCard className="home26-secondary-btn">
                Upload Resume
              </ResumeUploadCard>
              <button type="button" className="home26-secondary-btn" onClick={() => navigate("/templates")}>
                Browse Templates
              </button>
            </motion.div>
            <motion.div
              className="home26-trust-row"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.34 }}
            >
              <span><FaCheck /> Multi-page PDF</span>
              <span><FaCheck /> A4 preview</span>
              <span><FaCheck /> Job matching</span>
            </motion.div>
          </div>
          <ResumeDocument3D />
        </div>
      </section>

      <section className="home26-stats">
        <div className="home26-shell home26-stat-grid">
          {stats.map(([value, label], index) => (
            <FadeIn key={label} delay={index * 0.04}>
              <div className="home26-stat-card">
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section id="features" className="home26-section">
        <div className="home26-shell">
          <FadeIn className="home26-section-heading">
            <span>Core launch modules</span>
            <h2>Everything needed to go from blank page to stronger application.</h2>
            <p>Resume creation, template selection, job discovery, profile setup, matching, and Pro AI tools are already part of the product flow.</p>
          </FadeIn>
          <div className="home26-feature-grid">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="home26-section home26-flow-section">
        <div className="home26-shell">
          <FadeIn className="home26-section-heading">
            <span>Product flow</span>
            <h2>A practical path from resume setup to tracked applications.</h2>
          </FadeIn>
          <div className="home26-step-grid">
            {steps.map(([num, title, desc], index) => (
              <FadeIn key={title} delay={index * 0.05}>
                <motion.article
                  className="home26-step-card"
                  whileHover={{ y: -7 }}
                  transition={{ type: "spring", stiffness: 190, damping: 18 }}
                >
                  <strong>{num}</strong>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </motion.article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="home26-section">
        <div className="home26-shell">
          <FadeIn className="home26-template-copy">
            <span>ATS-Friendly Resume Templates</span>
            <h2>Choose The Resume That Gets Interviews</h2>
            <p>Professional ATS-friendly resume templates built for modern hiring.</p>
          </FadeIn>
          <FadeIn delay={0.08}>
            <TemplateShowcase navigate={navigate} />
          </FadeIn>
        </div>
      </section>

      <section className="home26-section home26-examples-section">
        <div className="home26-shell home26-examples-grid">
          <FadeIn>
            <ResumeExampleStack />
          </FadeIn>
          <FadeIn className="home26-example-copy" delay={0.08}>
            <span>Beyond the resume</span>
            <h2>Profile, scoring, tailoring, and tracking live in the same product.</h2>
            <p>Users can create a candidate profile, search jobs, recompute matches, generate cover letters, tailor resumes, and track application status after applying.</p>
            <button type="button" className="home26-primary-btn" onClick={() => navigate("/signup")}>
              Create free account
              <FaArrowRight />
            </button>
          </FadeIn>
        </div>
      </section>

      <section className="home26-final-cta">
        <div className="home26-shell">
          <FadeIn>
            <div className="home26-cta-panel">
              <div className="home26-mini-doc" aria-hidden="true">
                <TemplateThumbnail template={ctaTemplate} />
              </div>
              <div>
                <span>Ready for launch</span>
                <h2>Start with a resume. Grow into a smarter job search workflow.</h2>
                <p>Build the first resume for free, then connect profile, matching, and AI application tools when needed.</p>
              </div>
              <div className="home26-cta-actions">
                <button type="button" className="home26-primary-btn" onClick={() => navigate("/builder")}>
                  Build resume free
                  <FaRocket />
                </button>
                <button type="button" className="home26-secondary-btn" onClick={() => navigate("/pricing")}>
                  See pricing
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
