import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBriefcase,
  FaChartLine,
  FaCheck,
  FaCircleCheck,
  FaFilePdf,
  FaGaugeHigh,
  FaLayerGroup,
  FaMagnifyingGlassChart,
  FaRegFileLines,
  FaRocket,
  FaShieldHalved,
  FaWandMagicSparkles
} from "react-icons/fa6";
import TemplateThumbnail from "../components/TemplateThumbnail.jsx";
import { resumeTemplates } from "../data/resumeTemplates.js";
import { fetchBlogs } from "../services/blogApi.js";

const proofMetrics = [
  ["20+", "Resume Templates", FaLayerGroup],
  ["94%", "ATS Match", FaGaugeHigh],
  ["PDF", "Multi-page Export", FaFilePdf],
  ["AI", "Resume Assistant", FaWandMagicSparkles],
  ["Live", "Job Tracking", FaBriefcase]
];

const steps = [
  ["01", "Choose template", "Start from recruiter-friendly ATS, modern, creative, and minimalist layouts."],
  ["02", "Build resume", "Add experience, education, skills, summary, and custom sections with live preview."],
  ["03", "Improve ATS score", "Spot missing keywords, weak sections, and formatting issues before export."],
  ["04", "Apply confidently", "Use matching, cover letters, and tracking to move through the job search."]
];

const featureCards = [
  [FaGaugeHigh, "ATS Scoring", "Understand how your resume performs before recruiters or filters see it."],
  [FaRegFileLines, "Resume Review", "Review structure, section strength, readability, and role alignment."],
  [FaWandMagicSparkles, "AI Suggestions", "Rewrite bullets, summaries, and skills into clearer hiring language."],
  [FaMagnifyingGlassChart, "Job Matching", "Compare your profile against roles and prioritize stronger matches."],
  [FaBriefcase, "Application Tracking", "Track applied, viewed, responded, rejected, and failed applications."]
];

const workflow = ["Resume", "ATS Optimization", "Job Matching", "Application Tracking", "Interview"];

const fallbackBlogs = [
  {
    slug: "ats-resume-checklist",
    title: "ATS Resume Checklist For Modern Job Applications",
    excerpt: "A practical checklist for formatting, keywords, sections, and PDF export.",
    category: "Resume Strategy",
    readingTime: 5
  },
  {
    slug: "resume-keywords-guide",
    title: "How To Add Resume Keywords Without Sounding Robotic",
    excerpt: "Learn how to match job descriptions while keeping your resume natural.",
    category: "ATS Optimization",
    readingTime: 6
  },
  {
    slug: "track-job-applications",
    title: "Why Tracking Applications Improves Interview Momentum",
    excerpt: "A simple workflow for moving from resume building to consistent follow-up.",
    category: "Job Search",
    readingTime: 4
  }
];

function pickTemplate(ids, fallbackIndex = 0) {
  return ids.map((id) => resumeTemplates.find((template) => template.id === id)).find(Boolean) || resumeTemplates[fallbackIndex];
}

function Reveal({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

function HeroResumeStack({ navigate }) {
  const reduceMotion = useReducedMotion();
  const heroTemplate = pickTemplate(["modern-professional-5", "ats-friendly-resume-10", "professional-cv"]);

  return (
    <div className="home27-hero-visual" aria-label="Interactive resume preview">
      <motion.div
        className="home27-resume-stack"
        animate={reduceMotion ? undefined : { y: [0, -10, 0], rotateY: [-4, -1, -4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        whileHover={reduceMotion ? undefined : { rotateX: 7, rotateY: -12, y: -8 }}
        onClick={() => navigate(`/builder?template=${heroTemplate.id}`)}
      >
        <span className="home27-stack-sheet is-back" />
        <span className="home27-stack-sheet is-mid" />
        <div className="home27-resume-card">
          <div className="home27-resume-topbar">
            <span />
            <strong>Recruiter Preview</strong>
            <em>A4</em>
          </div>
          <TemplateThumbnail template={heroTemplate} />
        </div>
      </motion.div>

      <motion.div className="home27-float-card home27-ats-badge" animate={reduceMotion ? undefined : { y: [0, -8, 0] }} transition={{ duration: 5.5, repeat: Infinity }}>
        <FaGaugeHigh />
        <span>ATS score</span>
        <strong>94%</strong>
      </motion.div>
      <motion.div className="home27-float-card home27-match-badge" animate={reduceMotion ? undefined : { y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity }}>
        <FaChartLine />
        <span>Match score</span>
        <strong>88%</strong>
      </motion.div>
      <motion.div className="home27-float-card home27-approved-badge" animate={reduceMotion ? undefined : { y: [0, -6, 0] }} transition={{ duration: 6.8, repeat: Infinity }}>
        <FaShieldHalved />
        <strong>Recruiter approved</strong>
      </motion.div>
    </div>
  );
}

function TemplateShowcase({ navigate }) {
  const templates = useMemo(
    () =>
      [
        pickTemplate(["ats-friendly-resume-10"], 9),
        pickTemplate(["modern-professional-5"], 14),
        pickTemplate(["professional-cv"], 17),
        pickTemplate(["modern-professional-2"], 11),
        pickTemplate(["creative-1"], 18)
      ].filter(Boolean),
    []
  );

  return (
    <div className="home27-template-stage" aria-label="3D template gallery">
      {templates.map((template, index) => {
        const active = index === 2;
        const tag = active ? "Popular" : template.category === "ATS" ? "ATS" : template.category;
        return (
          <motion.button
            key={template.id}
            type="button"
            className={`home27-template-card home27-template-${index + 1} ${active ? "is-active" : ""}`}
            onClick={() => navigate(`/builder?template=${template.id}`)}
            whileHover={{ y: -14, scale: active ? 1.02 : 1.04 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
          >
            <span className="home27-template-tag">{tag}</span>
            <TemplateThumbnail template={template} fit="cover" />
            <strong>{template.name}</strong>
          </motion.button>
        );
      })}
    </div>
  );
}

function BlogPreview() {
  const [blogs, setBlogs] = useState(fallbackBlogs);

  useEffect(() => {
    let active = true;
    fetchBlogs({ page: 1, limit: 3 })
      .then((data) => {
        const items = data?.items || data?.blogs || [];
        if (active && items.length) setBlogs(items.slice(0, 3));
      })
      .catch(() => {
        if (active) setBlogs(fallbackBlogs);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="home27-blog-grid">
      {blogs.slice(0, 3).map((blog, index) => (
        <Link key={blog._id || blog.slug || blog.title} to={blog.slug ? `/blog/${blog.slug}` : "/blog"} className="home27-blog-card">
          <div className="home27-blog-image">
            {blog.featuredImage?.url ? <img src={blog.featuredImage.url} alt={blog.featuredImage.alt || blog.title} /> : <span>{String(index + 1).padStart(2, "0")}</span>}
          </div>
          <p>{blog.category || "Career Advice"}</p>
          <h3>{blog.title}</h3>
          <span>{blog.readingTime || 5} min read</span>
        </Link>
      ))}
    </div>
  );
}

export default function HomePage3() {
  const navigate = useNavigate();

  return (
    <main className="home27-page">
      <section className="home27-hero">
        <div className="home27-shell home27-hero-grid">
          <div className="home27-hero-copy">
            <Reveal>
              <span className="home27-eyebrow"><FaWandMagicSparkles /> AI resume platform for modern hiring</span>
              <h1>Build a resume recruiters actually read.</h1>
              <p>Create ATS-friendly resumes, optimize them with AI, and apply with confidence.</p>
              <div className="home27-actions">
                <button type="button" className="home27-primary" onClick={() => navigate("/builder")}>
                  Build Resume Free <FaArrowRight />
                </button>
                <button type="button" className="home27-secondary" onClick={() => navigate("/templates")}>
                  Browse Templates
                </button>
              </div>
              <div className="home27-trust">
                <span><FaCheck /> ATS-focused</span>
                <span><FaCheck /> Recruiter-approved layouts</span>
                <span><FaCheck /> Multi-page PDF</span>
              </div>
            </Reveal>
          </div>
          <HeroResumeStack navigate={navigate} />
        </div>
      </section>

      <section className="home27-proof">
        <div className="home27-shell home27-proof-grid">
          {proofMetrics.map(([value, label, Icon], index) => (
            <Reveal key={label} delay={index * 0.04}>
              <div className="home27-proof-card">
                <Icon />
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="home27-section">
        <div className="home27-shell">
          <Reveal className="home27-heading">
            <span>How it works</span>
            <h2>From first draft to application-ready in four focused steps.</h2>
          </Reveal>
          <div className="home27-timeline">
            {steps.map(([num, title, desc]) => (
              <article key={title}>
                <strong>{num}</strong>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home27-section home27-template-section">
        <div className="home27-shell">
          <Reveal className="home27-heading">
            <span>Template showcase</span>
            <h2>Premium resume templates with real depth, polish, and ATS intent.</h2>
            <p>Choose from ATS, modern, creative, and minimalist templates without browsing a flat product grid.</p>
          </Reveal>
          <TemplateShowcase navigate={navigate} />
        </div>
      </section>

      <section id="features" className="home27-section">
        <div className="home27-shell">
          <Reveal className="home27-heading">
            <span>AI features</span>
            <h2>Everything points toward a stronger interview signal.</h2>
          </Reveal>
          <div className="home27-feature-grid">
            {featureCards.map(([Icon, title, benefit]) => (
              <motion.article key={title} className="home27-feature-card" whileHover={{ y: -8 }}>
                <Icon />
                <h3>{title}</h3>
                <p>{benefit}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="home27-section">
        <div className="home27-shell home27-before-grid">
          <Reveal className="home27-before-copy">
            <span>Before vs after</span>
            <h2>Turn a generic resume into an ATS-ready application asset.</h2>
            <p>Show clearer keywords, stronger bullets, and a measurable lift in recruiter visibility.</p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="home27-before-after">
              <article>
                <span>Original Resume</span>
                <strong>62%</strong>
                <p>Missing role keywords, weak summary, inconsistent section hierarchy.</p>
              </article>
              <div className="home27-arrow">↓</div>
              <article className="is-optimized">
                <span>Optimized Resume</span>
                <strong>94%</strong>
                <p>Matched keywords, sharper bullets, cleaner structure, PDF export ready.</p>
              </article>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="home27-section home27-workflow-section">
        <div className="home27-shell">
          <Reveal className="home27-heading">
            <span>Career workflow</span>
            <h2>A complete path from resume to interview momentum.</h2>
          </Reveal>
          <div className="home27-workflow">
            {workflow.map((item, index) => (
              <div key={item}>
                <strong>{index + 1}</strong>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home27-section">
        <div className="home27-shell">
          <Reveal className="home27-heading">
            <span>Career blog</span>
            <h2>Practical guidance for resumes, ATS, and job search strategy.</h2>
          </Reveal>
          <BlogPreview />
        </div>
      </section>

      <section className="home27-final">
        <div className="home27-shell">
          <Reveal>
            <div className="home27-final-panel">
              <div>
                <span className="home27-eyebrow"><FaShieldHalved /> ATS ready · Recruiter approved</span>
                <h2>Start building a resume that gets interviews.</h2>
                <p>Use professional templates, AI optimization, and job search workflows from one platform.</p>
              </div>
              <div className="home27-actions">
                <button type="button" className="home27-primary" onClick={() => navigate("/builder")}>
                  Build Resume Free <FaRocket />
                </button>
                <button type="button" className="home27-secondary" onClick={() => navigate("/templates")}>
                  Browse Templates
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
