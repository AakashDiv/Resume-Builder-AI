import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight, FaBolt, FaBriefcase, FaCheck, FaCircleCheck,
  FaFilePdf, FaGaugeHigh, FaLayerGroup, FaMagnifyingGlass,
  FaRegFileLines, FaRocket, FaShieldHalved, FaStar,
  FaTriangleExclamation, FaWandMagicSparkles, FaXmark,
} from "react-icons/fa6";
import {
  AnimatePresence, motion,
  useInView, useMotionValue, useReducedMotion, useSpring, useTransform,
} from "framer-motion";
import TemplateThumbnail from "../components/TemplateThumbnail.jsx";
import { resumeTemplates } from "../data/resumeTemplates.js";
import { fetchBlogs } from "../services/blogApi.js";

/* ─── Static content ─────────────────────────────────────────────────────── */

const PAIN_POINTS = [
  {
    icon: FaXmark,
    color: "#ef4444",
    title: "ATS filters reject you before a human ever reads your resume",
    stat: "75% of resumes never reach a recruiter",
  },
  {
    icon: FaTriangleExclamation,
    color: "#f59e0b",
    title: "Generic templates fail job-specific keyword matching every time",
    stat: "Missing 10+ keywords = automatic rejection in seconds",
  },
  {
    icon: FaGaugeHigh,
    color: "#8b5cf6",
    title: "Tailoring manually is slow — and you never know if it worked",
    stat: "Average job seeker spends 4+ hours per custom application",
  },
];

const FEATURES = [
  {
    icon: FaRegFileLines,
    accent: "#1d4ed8",
    badge: "Free",
    title: "ATS-Optimized Resume Builder",
    desc: "Choose from 20+ recruiter-approved templates. Build with live A4 preview, export a pixel-perfect PDF — completely free. No credit card. No friction.",
    perks: [
      "20+ professional templates",
      "Live A4 preview while you type",
      "Multi-page PDF export",
      "Works without an account",
    ],
  },
  {
    icon: FaGaugeHigh,
    accent: "#7c3aed",
    badge: "Pro",
    title: "AI Resume Score & Improvement",
    desc: "Paste any job description. Instantly see your ATS compatibility score, keyword gaps, weak sections — and get AI-rewritten bullet point suggestions.",
    perks: [
      "Instant ATS score 0–100",
      "Keyword gap analysis",
      "AI-powered bullet rewrites",
      "Section-by-section feedback",
    ],
  },
  {
    icon: FaMagnifyingGlass,
    accent: "#059669",
    badge: "Live",
    title: "Live Job Matching Engine",
    desc: "Search thousands of live roles from LinkedIn, Naukri, Indeed, and Glassdoor — all in one workspace. Automatically ranked by how well your resume matches.",
    perks: [
      "5 job platforms, one search",
      "AI semantic match scoring",
      "Application status tracking",
      "Cover letter generator",
    ],
  },
];

const STEPS = [
  {
    n: "01",
    title: "Build or upload your resume",
    desc: "Use our builder with 20+ templates or upload your existing PDF. Takes under 5 minutes.",
  },
  {
    n: "02",
    title: "Get your instant ATS score",
    desc: "Paste any job description. See your match score, keyword gaps, and exactly what to fix.",
  },
  {
    n: "03",
    title: "Apply and track everything",
    desc: "Find matching jobs across 5 platforms, apply smarter, and track every application in one place.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Software Engineer · Razorpay",
    avatar: "PS",
    color: "#1d4ed8",
    quote:
      "I sent 80+ applications with my old resume and got nothing. After optimizing with NightHire, I got 3 interview calls in the first week. The ATS score tool is genuinely life-changing.",
  },
  {
    name: "Rahul Mehta",
    role: "Product Manager · Swiggy",
    avatar: "RM",
    color: "#7c3aed",
    quote:
      "Was job hunting for 4 months with zero traction. Rebuilt my resume on NightHire, used the AI improvement feature, and landed a PM role at Swiggy in 3 weeks. I wish I found this sooner.",
  },
  {
    name: "Anjali Kapoor",
    role: "Marketing Analyst · Zepto",
    avatar: "AK",
    color: "#059669",
    quote:
      "The templates are beautiful AND they actually pass ATS filters. I got my first interview invite within 48 hours of uploading my new resume. The job matching is incredibly accurate.",
  },
];

const COMPANIES = [
  "Google", "Amazon", "Microsoft", "Razorpay", "Swiggy",
  "Zepto", "Flipkart", "Zomato", "BYJU'S", "Nykaa",
];

const FALLBACK_BLOGS = [
  {
    slug: "ats-resume-checklist",
    title: "ATS Resume Checklist For Modern Job Applications",
    excerpt: "A practical checklist for formatting, keywords, sections, and PDF export.",
    category: "Resume Strategy",
    readingTime: 5,
  },
  {
    slug: "resume-keywords-guide",
    title: "How To Add Resume Keywords Without Sounding Robotic",
    excerpt: "Learn how to match job descriptions while keeping your resume natural.",
    category: "ATS Optimization",
    readingTime: 6,
  },
  {
    slug: "track-job-applications",
    title: "Why Tracking Applications Improves Interview Momentum",
    excerpt: "A simple workflow for moving from resume building to consistent follow-up.",
    category: "Job Search",
    readingTime: 4,
  },
];

/* ── #3: Stats counter data ── */
const STATS = [
  { value: 14280, suffix: "+", label: "Resumes built this week" },
  { value: 94,    suffix: "%", label: "Average ATS score" },
  { value: 3400,  suffix: "+", label: "Interviews reported" },
  { value: 20,    suffix: "+", label: "Free templates" },
];

/* ─── Hero animation data ────────────────────────────────────────────────── */

const HERO_SLIDES = [
  { templateId: "modern-professional-5",  fallback: 0,  atsScore: 94, accentColor: "#1d4ed8", label: "Modern Professional" },
  { templateId: "ats-friendly-resume-10", fallback: 9,  atsScore: 91, accentColor: "#7c3aed", label: "ATS Optimized" },
  { templateId: "professional-cv",        fallback: 17, atsScore: 96, accentColor: "#059669", label: "Professional CV" },
  { templateId: "modern-professional-2",  fallback: 11, atsScore: 88, accentColor: "#0891b2", label: "Clean Minimal" },
];
const MORPH_WORDS = ["interview-ready", "offer-ready", "hired"];
const CIRC = 106.8; // 2π × r(17)

/* ─── Utilities ──────────────────────────────────────────────────────────── */

function Reveal({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ── #3: CountUp — rAF-based eased counter, fires once on scroll-into-view ── */
function CountUp({ to, duration = 1800, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    let startTime = null;
    const tick = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(eased * to));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ─── Hero: Product Dashboard Mockup ────────────────────────────────────── */

/* #1: tiltX / tiltY are Framer motion springs passed from parent (mouse tracking) */
function HeroDashboard({ slide, activeSlide, onSlideChange, tiltX, tiltY }) {
  const reduceMotion = useReducedMotion();
  const template = useMemo(
    () =>
      resumeTemplates.find((t) => t.id === slide.templateId) ||
      resumeTemplates[slide.fallback],
    [slide.templateId, slide.fallback]
  );
  const scoreDash = ((slide.atsScore / 100) * CIRC).toFixed(1);

  return (
    <div className="h4-hero-visual" aria-hidden="true">

      {/* ── Browser: entry from right, perspective for 3D tilt ── */}
      <motion.div
        initial={{ opacity: 0, x: 44 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.72, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{ perspective: "1000px" }}
      >
        {/* y-float stays in animate; rotateX/Y from mouse spring via style */}
        <motion.div
          className="h4-browser"
          animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={reduceMotion ? undefined : { rotateX: tiltX, rotateY: tiltY }}
        >
          <div className="h4-browser-chrome">
            <div className="h4-traffic-lights">
              <span className="h4-tl h4-tl-red" />
              <span className="h4-tl h4-tl-yellow" />
              <span className="h4-tl h4-tl-green" />
            </div>
            <div className="h4-browser-url">nighthire.ai/app/resume-builder</div>
            <div className="h4-browser-badge"><FaShieldHalved /> ATS Ready</div>
          </div>

          <div className="h4-app-ui">
            <div className="h4-app-sidebar">
              <div className="h4-app-logo-mark">N</div>
              <div className="h4-app-nav">
                <span className="is-active" aria-label="Resume Builder"><FaRegFileLines /></span>
                <span aria-label="ATS Score"><FaGaugeHigh /></span>
                <span aria-label="Job Search"><FaMagnifyingGlass /></span>
                <span aria-label="Applications"><FaBriefcase /></span>
              </div>
            </div>
            <div className="h4-app-panel">
              <div className="h4-app-topbar">
                <span className="h4-app-title">Resume Builder</span>
                <div className="h4-app-topbar-right">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={slide.atsScore}
                      className="h4-ats-indicator"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.28 }}
                    >
                      ATS {slide.atsScore}%
                    </motion.span>
                  </AnimatePresence>
                  <span className="h4-pdf-btn"><FaFilePdf /> Export</span>
                </div>
              </div>
              <div className="h4-app-canvas">
                <div className="h4-mini-resume">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={slide.templateId}
                      initial={{ opacity: 0, y: 22, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0,  scale: 1   }}
                      exit={{    opacity: 0, y: -22, scale: 0.94 }}
                      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                      style={{ width: "100%", height: "100%" }}
                    >
                      <TemplateThumbnail template={template} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <div className="h4-app-statusbar">
            <span><FaCircleCheck /> ATS Friendly</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={slide.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <FaLayerGroup /> {slide.label}
              </motion.span>
            </AnimatePresence>
            <span><FaFilePdf /> Export Ready</span>
          </div>
        </motion.div>
      </motion.div>

      {/* ── #4: Slide dots + active template label ── */}
      <motion.div
        className="h4-slide-controls"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95, duration: 0.4 }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={slide.label}
            className="h4-slide-label"
            style={{ color: slide.accentColor }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.28 }}
          >
            {slide.label}
          </motion.span>
        </AnimatePresence>
        <div className="h4-slide-dots">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.templateId}
              type="button"
              className={`h4-slide-dot${i === activeSlide ? " is-active" : ""}`}
              style={{ "--dot-clr": s.accentColor }}
              onClick={() => onSlideChange(i)}
              aria-label={`View ${s.label} template`}
            />
          ))}
        </div>
      </motion.div>

      {/* ── Float: Interview Scheduled ── */}
      <motion.div
        className="h4-float-entry h4-float-entry-interview"
        initial={{ opacity: 0, scale: 0.72, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.55 }}
      >
        <motion.div
          className="h4-float"
          style={{ position: "relative" }}
          animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="h4-float-ico h4-float-ico-green"><FaCircleCheck /></div>
          <div>
            <div className="h4-float-ttl">Interview Scheduled</div>
            <div className="h4-float-sub">Google · Tomorrow 3pm</div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Float: ATS Score Ring ── */}
      <motion.div
        className="h4-float-entry h4-float-entry-score"
        initial={{ opacity: 0, scale: 0.72, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.7 }}
      >
        <motion.div
          className="h4-float"
          style={{ position: "relative" }}
          animate={reduceMotion ? undefined : { y: [0, 9, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="h4-score-ring">
            <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
              <circle cx="22" cy="22" r="17" stroke="#e2e8f0" strokeWidth="4" />
              <motion.circle
                cx="22" cy="22" r="17"
                stroke="url(#h4ScoreGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                transform="rotate(-90 22 22)"
                initial={{ strokeDasharray: `0 ${CIRC}` }}
                animate={{ strokeDasharray: `${scoreDash} ${CIRC}` }}
                transition={{ duration: 0.85, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="h4ScoreGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1d4ed8" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            <AnimatePresence mode="wait">
              <motion.span
                key={slide.atsScore}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.3 }}
                transition={{ duration: 0.3 }}
              >
                {slide.atsScore}%
              </motion.span>
            </AnimatePresence>
          </div>
          <div>
            <div className="h4-float-ttl">ATS Score</div>
            <div className="h4-float-sub">Top 5% of resumes</div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Float: Job Matches chip ── */}
      <motion.div
        className="h4-float-entry h4-float-entry-jobs"
        initial={{ opacity: 0, scale: 0.72, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.85 }}
      >
        <motion.div
          className="h4-float h4-float-jobs"
          style={{ position: "relative", left: "auto", bottom: "auto" }}
          animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <FaBolt />
          <span>12 new job matches</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ─── Template Showcase ──────────────────────────────────────────────────── */

const TEMPLATE_CATEGORIES = ["All", "ATS", "Modern", "Minimalist", "Creative"];

function h4BadgeFor(template) {
  if (template.category === "ATS") return { label: "ATS Certified", type: "ats" };
  if (/5|10|professional-cv/i.test(template.id)) return { label: "Popular", type: "popular" };
  return { label: "New", type: "new" };
}

function h4TemplateMeta(template) {
  const rank = template.category === "ATS" ? 3 : /5|10|professional-cv/i.test(template.id) ? 2 : 1;
  const idNum = Number(template.id.match(/\d+/)?.[0] || rank + 3);
  const atsScore = template.category === "ATS" ? 98 : rank === 2 ? 94 : 91;
  return {
    atsScore: `${atsScore}%`,
    uses: `${Math.max(8, idNum * 3 + rank * 7)}K`,
    downloads: `${Math.max(4, idNum * 2 + rank * 5)}k`,
  };
}

function TemplateShowcase({ navigate }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categoryCounts = useMemo(() => {
    const counts = { All: resumeTemplates.length };
    resumeTemplates.forEach((t) => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const pool = activeCategory === "All"
      ? resumeTemplates
      : resumeTemplates.filter((t) => t.category === activeCategory);
    return pool.slice(0, 8);
  }, [activeCategory]);

  return (
    <div className="h4-tpl-showcase">
      {/* Category filter pills */}
      <div className="h4-tpl-filter" role="group" aria-label="Filter templates by category">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`h4-tpl-filter-btn${activeCategory === cat ? " is-active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
            {categoryCounts[cat] != null && (
              <span className="h4-tpl-filter-count">{categoryCounts[cat]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Template grid — same card design as TemplatesPage */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          className="nh-template-grid h4-tpl-home-grid"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {filtered.map((template, i) => {
            const badge = h4BadgeFor(template);
            const meta = h4TemplateMeta(template);
            return (
              <motion.article
                key={template.id}
                className="nh-template-card"
                style={{ "--template-accent": template.accent || "#06B6D4" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.045, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => navigate(`/builder?template=${template.id}`)}
              >
                <div className="nh-template-card-preview">
                  <span className={`nh-template-badge ${badge.type}`}>{badge.label}</span>
                  <span className="nh-template-ats-score">{meta.atsScore} ATS Score</span>
                  <div className="nh-template-paper">
                    <TemplateThumbnail template={template} />
                  </div>
                  <div className="nh-template-overlay">
                    <div className="nh-template-action-bar h4-tpl-action-single">
                      <button
                        type="button"
                        className="nh-use-template"
                        onClick={(e) => { e.stopPropagation(); navigate(`/builder?template=${template.id}`); }}
                      >
                        Use Template <FaArrowRight />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="nh-template-card-footer">
                  <div className="nh-template-info">
                    <h3>{template.name}</h3>
                    <p>{template.category} &bull; {meta.uses} Uses &bull; {meta.downloads} Downloads</p>
                  </div>
                  <span className="nh-template-inline-ats"><FaShieldHalved /> ATS</span>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Bottom CTA */}
      <div className="h4-tpl-cta-row">
        <button type="button" className="h4-tpl-view-all-btn" onClick={() => navigate("/templates")}>
          Browse all {resumeTemplates.length}+ templates <FaArrowRight />
        </button>
        <p className="h4-tpl-cta-note">
          <FaCheck /> All templates are ATS-optimized &nbsp;·&nbsp; <FaCheck /> 100% free to build &nbsp;·&nbsp; <FaCheck /> No account required
        </p>
      </div>
    </div>
  );
}

/* ─── Blog cards ─────────────────────────────────────────────────────────── */

function BlogCards() {
  const [blogs, setBlogs] = useState(FALLBACK_BLOGS);

  useEffect(() => {
    let active = true;
    fetchBlogs({ page: 1, limit: 3 })
      .then((data) => {
        const items = data?.items || [];
        if (active && items.length) setBlogs(items.slice(0, 3));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <div className="h4-blog-grid">
      {blogs.map((blog, i) => (
        <Link key={blog._id || blog.slug} to={`/blog/${blog.slug}`} className="h4-blog-card">
          <div className="h4-blog-img">
            {blog.featuredImage?.url ? (
              <img src={blog.featuredImage.url} alt={blog.featuredImage.alt || blog.title} loading="lazy" />
            ) : (
              <span className="h4-blog-num">{String(i + 1).padStart(2, "0")}</span>
            )}
          </div>
          <div className="h4-blog-body">
            {blog.category && <span className="h4-blog-cat">{blog.category}</span>}
            <h3>{blog.title}</h3>
            {blog.excerpt && <p>{blog.excerpt}</p>}
            <span className="h4-blog-meta">{blog.readingTime || 5} min read <FaArrowRight /></span>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function HomePage4() {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const currentSlide = HERO_SLIDES[activeSlide];
  const slideTimerRef = useRef(null);

  /* Template auto-rotation — resets when user picks a dot */
  const startSlideTimer = () => {
    clearInterval(slideTimerRef.current);
    slideTimerRef.current = setInterval(
      () => setActiveSlide((i) => (i + 1) % HERO_SLIDES.length),
      3500
    );
  };
  useEffect(() => {
    startSlideTimer();
    return () => clearInterval(slideTimerRef.current);
  }, []);

  const handleSlideChange = (i) => {
    setActiveSlide(i);
    startSlideTimer(); // reset timer so dot-picked slide shows for a full 3.5s
  };

  /* Word morph every 2.5s */
  useEffect(() => {
    const t = setInterval(() => setWordIdx((i) => (i + 1) % MORPH_WORDS.length), 2500);
    return () => clearInterval(t);
  }, []);

  /* ── #1: Mouse-tracking 3D tilt ── */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 80, damping: 18 });
  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]),  { stiffness: 80, damping: 18 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width  - 0.5);
    mouseY.set((e.clientY - rect.top)  / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  return (
    <main className="h4-page">

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section
        className="h4-hero"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="h4-hero-bg" aria-hidden="true">
          <motion.div
            className="h4-orb h4-orb-blue"
            animate={{ background: `radial-gradient(circle, ${currentSlide.accentColor}1a, transparent 68%)` }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
          <div className="h4-orb h4-orb-violet" />
          <div className="h4-dot-grid" />
        </div>
        <div className="h4-shell h4-hero-grid">
          <div className="h4-hero-copy">

            <motion.div
              className="h4-eyebrow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <FaWandMagicSparkles />
              AI Resume Builder &amp; Job Platform
            </motion.div>

            {/* H1 with #2 shimmer gradient + word morph */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              From rejected to{" "}
              <span className="h4-morph-word-wrap" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={MORPH_WORDS[wordIdx]}
                    className="h4-gradient-text"
                    style={{ display: "inline-block" }}
                    initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
                    exit={{    opacity: 0, y: -16, filter: "blur(6px)" }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {MORPH_WORDS[wordIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
              {" "}in 10 minutes
            </motion.h1>

            <motion.p
              className="h4-hero-desc"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              Build ATS-optimized resumes, score them against real job descriptions,
              and match with live jobs across 5 platforms — all in one place.
            </motion.p>

            <motion.div
              className="h4-hero-btns"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* #5: glow class on primary CTA */}
              <button
                type="button"
                className="h4-btn-primary h4-btn-glow"
                onClick={() => navigate("/builder")}
              >
                Build Resume Free <FaArrowRight />
              </button>
              <button
                type="button"
                className="h4-btn-ghost"
                onClick={() => navigate("/templates")}
              >
                View Templates
              </button>
            </motion.div>

            <motion.div
              className="h4-hero-trust"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.38 }}
            >
              <span><FaCheck /> No credit card</span>
              <span><FaCheck /> ATS guaranteed</span>
              <span><FaCheck /> PDF in seconds</span>
              <span><FaShieldHalved /> 94% avg score</span>
            </motion.div>

          </div>
          <HeroDashboard
            slide={currentSlide}
            activeSlide={activeSlide}
            onSlideChange={handleSlideChange}
            tiltX={tiltX}
            tiltY={tiltY}
          />
        </div>
      </section>

      {/* ══ TEMPLATE SHOWCASE ════════════════════════════════════════════════ */}
      <section className="h4-section h4-tpl-section">
        <div className="h4-shell">
          <Reveal className="h4-sec-hd h4-sec-hd-center">
            <span className="h4-tpl-sec-eyebrow">
              <FaLayerGroup /> {resumeTemplates.length}+ Professional Templates
            </span>
            <h2>ATS-friendly templates that get interviews</h2>
            <p>Every template is engineered to pass ATS filters and get noticed by recruiters. Pick your style — the optimization is built in.</p>
          </Reveal>
          <Reveal delay={0.06}>
            <TemplateShowcase navigate={navigate} />
          </Reveal>
        </div>
      </section>

      {/* ══ PAIN POINTS ═══════════════════════════════════════════════════════ */}
      <section className="h4-section h4-pain-bg">
        <div className="h4-shell">
          <Reveal className="h4-sec-hd h4-sec-hd-center">
            <span className="h4-sec-label">The problem</span>
            <h2>Why most resumes never reach a human</h2>
            <p>The hiring system is broken. Here's what's working against you — and how NightHire fixes each one.</p>
          </Reveal>
          <div className="h4-pain-grid">
            {PAIN_POINTS.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.title} delay={i * 0.07}>
                  <div className="h4-pain-card" style={{ "--pain": p.color }}>
                    <div className="h4-pain-ico"><Icon /></div>
                    <h3>{p.title}</h3>
                    <div className="h4-pain-stat">{p.stat}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════════ */}
      <section id="features" className="h4-section">
        <div className="h4-shell">
          <Reveal className="h4-sec-hd h4-sec-hd-center">
            <span className="h4-sec-label">The solution</span>
            <h2>Everything to go from zero to hired</h2>
            <p>Three powerful tools. One platform. The complete job search system.</p>
          </Reveal>
          <div className="h4-feat-grid">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 0.08}>
                  <div className="h4-feat-card" style={{ "--feat": f.accent }}>
                    <div className="h4-feat-head">
                      <div className="h4-feat-ico"><Icon /></div>
                      <span className="h4-feat-badge">{f.badge}</span>
                    </div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                    <ul className="h4-feat-perks">
                      {f.perks.map((perk) => (
                        <li key={perk}><FaCircleCheck /> {perk}</li>
                      ))}
                    </ul>
                    <button type="button" className="h4-feat-cta" onClick={() => navigate("/builder")}>
                      Get started <FaArrowRight />
                    </button>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════════ */}
      <section className="h4-section h4-steps-bg">
        <div className="h4-shell">
          <Reveal className="h4-sec-hd h4-sec-hd-center">
            <span className="h4-sec-label">How it works</span>
            <h2>Three steps to your next interview</h2>
          </Reveal>
          <div className="h4-steps-row">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div className="h4-step">
                  <div className="h4-step-num">{s.n}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BEFORE / AFTER ════════════════════════════════════════════════════ */}
      <section className="h4-section h4-pain-bg">
        <div className="h4-shell h4-ba-layout">
          <Reveal className="h4-sec-hd">
            <span className="h4-sec-label">Real results</span>
            <h2>Watch your ATS score transform</h2>
            <p>The exact improvement our AI optimization delivers. Not a simulation — this is the real, measurable difference.</p>
            <button type="button" className="h4-btn-primary" style={{ marginTop: "28px" }} onClick={() => navigate("/app/ats-score")}>
              Check My Score <FaArrowRight />
            </button>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h4-ba-wrap">
              <div className="h4-ba-card h4-ba-before">
                <div className="h4-ba-top">
                  <span className="h4-ba-lbl">Before NightHire</span>
                  <span className="h4-ba-score h4-score-bad">48%</span>
                </div>
                <ul className="h4-ba-list">
                  <li><FaXmark /> Missing 14 role keywords</li>
                  <li><FaXmark /> Weak, generic action verbs</li>
                  <li><FaXmark /> No quantified achievements</li>
                  <li><FaXmark /> Vague, generic summary</li>
                  <li><FaXmark /> Wrong section ordering</li>
                </ul>
                <div className="h4-ba-bar"><div className="h4-ba-fill h4-fill-bad" style={{ width: "48%" }} /></div>
              </div>
              <div className="h4-ba-divider" aria-hidden="true">
                <FaArrowRight />
                <span>AI Optimized</span>
              </div>
              <div className="h4-ba-card h4-ba-after">
                <div className="h4-ba-top">
                  <span className="h4-ba-lbl">After NightHire</span>
                  <span className="h4-ba-score h4-score-good">94%</span>
                </div>
                <ul className="h4-ba-list">
                  <li><FaCheck /> All role keywords matched</li>
                  <li><FaCheck /> Impact-driven bullet points</li>
                  <li><FaCheck /> 6 quantified achievements</li>
                  <li><FaCheck /> Targeted, role-specific summary</li>
                  <li><FaCheck /> Recruiter-optimized layout</li>
                </ul>
                <div className="h4-ba-bar"><div className="h4-ba-fill h4-fill-good" style={{ width: "94%" }} /></div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════════════════════ */}
      <section className="h4-section h4-testimonials-bg">
        <div className="h4-shell">
          <Reveal className="h4-sec-hd h4-sec-hd-center">
            <span className="h4-sec-label">Success stories</span>
            <h2>Real people. Real interviews. Real results.</h2>
            <p>Over 1,200 job seekers have used NightHire to land their next role.</p>
          </Reveal>
          <div className="h4-testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.07}>
                <div className="h4-testi-card">
                  <div className="h4-stars">{Array.from({ length: 5 }).map((_, si) => <FaStar key={si} />)}</div>
                  <blockquote>{t.quote}</blockquote>
                  <div className="h4-testi-author">
                    <div className="h4-testi-avatar" style={{ "--av-color": t.color }}>{t.avatar}</div>
                    <div>
                      <div className="h4-testi-name">{t.name}</div>
                      <div className="h4-testi-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BLOG PREVIEW ══════════════════════════════════════════════════════ */}
      <section className="h4-section">
        <div className="h4-shell">
          <Reveal className="h4-sec-hd h4-sec-hd-between">
            <div>
              <span className="h4-sec-label">Career resources</span>
              <h2>Guides to help you get hired faster</h2>
            </div>
            <Link to="/blog" className="h4-btn-ghost">Read all guides <FaArrowRight /></Link>
          </Reveal>
          <Reveal delay={0.05}><BlogCards /></Reveal>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════════════════════ */}
      <section className="h4-section h4-cta-section">
        <div className="h4-shell">
          <Reveal>
            <div className="h4-cta-panel">
              <div className="h4-cta-orb h4-cta-orb-1" aria-hidden="true" />
              <div className="h4-cta-orb h4-cta-orb-2" aria-hidden="true" />
              <div className="h4-cta-body">
                <div className="h4-cta-chips">
                  <span><FaCheck /> Free forever plan</span>
                  <span><FaShieldHalved /> 94% avg ATS score</span>
                  <span><FaRocket /> Interview in days, not months</span>
                </div>
                <h2>Your next interview starts with the right resume.</h2>
                <p>Join 1,200+ job seekers who build smarter resumes and find better jobs with NightHire — starting free, upgrading when ready.</p>
                <div className="h4-cta-actions">
                  <button type="button" className="h4-cta-btn-primary" onClick={() => navigate("/signup")}>
                    Create Free Account <FaRocket />
                  </button>
                  <button type="button" className="h4-cta-btn-outline" onClick={() => navigate("/pricing")}>
                    See Pricing
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}
