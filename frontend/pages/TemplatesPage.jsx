import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ResumeUploadCard from "../components/ResumeUploadCard.jsx";
import {
  FaArrowRight,
  FaCheck,
  FaCircleCheck,
  FaEye,
  FaGaugeHigh,
  FaGrip,
  FaHeart,
  FaLayerGroup,
  FaMagnifyingGlass,
  FaShieldHalved,
  FaWandMagicSparkles,
  FaXmark
} from "react-icons/fa6";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { resumeTemplates } from "../data/resumeTemplates.js";
import TemplateThumbnail from "../components/TemplateThumbnail.jsx";

const categories = ["All", "Creative", "Modern", "Minimalist", "ATS", "Executive"];
const sortOptions = ["Newest", "Most Popular"];

const marketingStats = [
  ["250", "Templates"],
  ["50k", "Users"],
  ["98%", "ATS Success"]
];

function isProfessionalTemplate(template) {
  return /professional|simple|cv/i.test(`${template.id} ${template.name}`);
}

function templatesByCategory(category) {
  if (category === "All") return resumeTemplates;
  if (category === "Executive") return resumeTemplates.filter(isProfessionalTemplate).slice(0, 2);
  return resumeTemplates.filter((item) => item.category === category);
}

function renderTemplatePreview(template, className, fit = "contain") {
  return (
    <TemplateThumbnail
      template={template}
      fit={fit}
      className={className}
      renderSource="live"
    />
  );
}

/* ── Hero visual: stacked 3D template cards with mouse tilt ── */
const HERO_PREVIEW_IDS = ["modern-professional-5", "ats-friendly-resume-4", "professional-cv"];

function TemplateHeroVisual({ tiltX, tiltY }) {
  const reduceMotion = useReducedMotion();
  const previews = useMemo(
    () => HERO_PREVIEW_IDS.map((id) => resumeTemplates.find((t) => t.id === id)).filter(Boolean),
    []
  );

  return (
    <div className="nth-visual" aria-hidden="true">
      {/* Stacked cards */}
      <div className="nth-stack">
        {/* Back cards — static, fanned */}
        <div className="nth-card nth-card-3">
          <div className="nth-card-inner">
            <TemplateThumbnail template={previews[2] || previews[0]} />
          </div>
        </div>
        <div className="nth-card nth-card-2">
          <div className="nth-card-inner">
            <TemplateThumbnail template={previews[1] || previews[0]} />
          </div>
        </div>

        {/* Front card — 3D tilt + float */}
        <motion.div
          className="nth-card nth-card-1"
          animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={reduceMotion ? undefined : { rotateX: tiltX, rotateY: tiltY, perspective: "900px" }}
        >
          <div className="nth-card-inner">
            <TemplateThumbnail template={previews[0]} />
          </div>
          {/* ATS badge on front card */}
          <div className="nth-card-ats">
            <FaGaugeHigh />
            <span>98% ATS</span>
          </div>
        </motion.div>
      </div>

      {/* Float: ATS Certified */}
      <motion.div
        className="nth-float nth-float-ats"
        initial={{ opacity: 0, scale: 0.75, x: 10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.6 }}
      >
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="nth-float-inner"
        >
          <div className="nth-float-ico nth-float-ico-green"><FaCircleCheck /></div>
          <div>
            <div className="nth-float-ttl">ATS Certified</div>
            <div className="nth-float-sub">Passes all major ATS</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Float: Templates count */}
      <motion.div
        className="nth-float nth-float-count"
        initial={{ opacity: 0, scale: 0.75, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.8 }}
      >
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="nth-float-inner nth-float-inner-chip"
        >
          <FaLayerGroup />
          <span>{resumeTemplates.length}+ free templates</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const [active, setActive] = useState(categories.includes(initialCategory) ? initialCategory : "All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Newest");
  const [view, setView] = useState("grid");
  const [previewTemplate, setPreviewTemplate] = useState(null);

  useEffect(() => {
    const category = searchParams.get("category") || "All";
    setActive(categories.includes(category) ? category : "All");
  }, [searchParams]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const source = templatesByCategory(active);
    const searched = normalizedQuery
      ? source.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(normalizedQuery))
      : source;

    return [...searched].sort((a, b) => (sort === "Most Popular" ? badgeFor(b).rank - badgeFor(a).rank : 0));
  }, [active, query, sort]);

  /* Mouse-tracking 3D tilt — same spring setup as HP4 */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 80, damping: 18 });
  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]),  { stiffness: 80, damping: 18 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width  - 0.5);
    mouseY.set((e.clientY - rect.top)  / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  function useTemplate(template) {
    navigate(`/builder?template=${template.id}`);
  }

  return (
    <main className="nh-templates-page">
      <section className="nh-template-content">

        {/* ── Hero — matches HP4 design language ── */}
        <section
          className="nth-hero"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          aria-labelledby="templates-title"
        >
          {/* Background: same orbs + dot grid as HP4 */}
          <div className="nth-hero-bg" aria-hidden="true">
            <div className="nth-orb nth-orb-blue" />
            <div className="nth-orb nth-orb-violet" />
            <div className="nth-dot-grid" />
          </div>

          {/* Left: copy */}
          <div className="nth-hero-copy">
            <motion.div
              className="nth-eyebrow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <FaWandMagicSparkles />
              ATS-Ready Resume Templates
            </motion.div>

            <motion.h1
              id="templates-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              Find your perfect{" "}
              <span className="nth-gradient-text">resume template</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              {resumeTemplates.length}+ ATS-optimized layouts built for recruiter review,
              clean parsing, and fast PDF export — completely free.
            </motion.p>

            <motion.div
              className="nth-hero-trust"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.32 }}
            >
              <span><FaCheck /> No credit card</span>
              <span><FaCheck /> ATS guaranteed</span>
              <span><FaCheck /> Free PDF export</span>
              <span><FaShieldHalved /> 94% avg score</span>
            </motion.div>
          </div>

          {/* Right: 3D stacked template cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <TemplateHeroVisual tiltX={tiltX} tiltY={tiltY} />
          </motion.div>
        </section>

        {/* Upload existing resume strip */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
          padding: "14px 20px", margin: "0 0 0 0",
          background: "rgba(37,99,235,0.05)", borderBottom: "1px solid rgba(37,99,235,0.12)",
          borderTop: "1px solid rgba(37,99,235,0.12)"
        }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--t1, #0f172a)", marginBottom: 2 }}>
              Already have a resume?
            </p>
            <p style={{ fontSize: 12, color: "var(--t3, #94a3b8)" }}>
              Upload it to auto-fill the builder, then pick a template below.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ResumeUploadCard
              style={{
                padding: "9px 20px", borderRadius: 10, border: "1px solid rgba(37,99,235,0.4)",
                background: "linear-gradient(135deg, #2563EB, #0EA5C8)",
                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap"
              }}
            >
              ⬆ Upload Existing Resume
            </ResumeUploadCard>
            <span style={{ fontSize: 12, color: "var(--t3, #94a3b8)", fontWeight: 600 }}>OR choose a template below</span>
          </div>
        </div>

        <section className="nh-all-templates-section" aria-labelledby="all-templates-title">

          {/* ── Redesigned filter bar ── */}
          <div className="ntf-bar">
            {/* Row 1: search + result count + sort + view toggle */}
            <div className="ntf-row-top">
              <label className="ntf-search">
                <FaMagnifyingGlass />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search templates — ATS, Modern, Creative…"
                />
                {query && (
                  <button type="button" className="ntf-clear" onClick={() => setQuery("")} aria-label="Clear search">
                    <FaXmark />
                  </button>
                )}
              </label>

              <div className="ntf-controls">
                <span className="ntf-count">
                  <strong>{filtered.length}</strong> templates
                </span>
                <select
                  className="ntf-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort templates"
                >
                  {sortOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
                <div className="ntf-view-toggle" aria-label="View mode">
                  <button type="button" className={view === "grid" ? "is-active" : ""} onClick={() => setView("grid")} title="Grid view">
                    <FaGrip />
                  </button>
                  <button type="button" className={view === "compact" ? "is-active" : ""} onClick={() => setView("compact")} title="Compact view">
                    <FaEye />
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: animated category tabs with counts */}
            <nav className="ntf-tabs" aria-label="Template categories">
              {categories.map((cat) => {
                const count = templatesByCategory(cat).length;
                const isActive = cat === active;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`ntf-tab${isActive ? " is-active" : ""}`}
                    onClick={() => setActive(cat)}
                  >
                    {cat === "Minimalist" ? "Minimal" : cat}
                    <span className="ntf-tab-count">{count}</span>
                    {isActive && (
                      <motion.div
                        className="ntf-tab-indicator"
                        layoutId="ntf-active-indicator"
                        transition={{ type: "spring", stiffness: 340, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <AnimatePresence mode="wait">
            <div
              key={active + query + sort}
              className={`nh-template-grid ${view === "compact" ? "is-compact" : ""}`}
            >
              {filtered.map((template, i) => (
                <TemplateCard
                  key={template.id}
                  index={i}
                  template={template}
                  onUse={() => useTemplate(template)}
                  onPreview={() => setPreviewTemplate(template)}
                />
              ))}
            </div>
          </AnimatePresence>
        </section>
      </section>

      {previewTemplate ? (
        <div className="nh-template-modal" role="dialog" aria-modal="true" aria-label={`${previewTemplate.name} preview`}>
          <div className="nh-template-modal-panel">
            <header>
              <div>
                <p>{previewTemplate.category}</p>
                <h2>{previewTemplate.name}</h2>
              </div>
              <button type="button" onClick={() => setPreviewTemplate(null)} aria-label="Close preview">
                <FaXmark />
              </button>
            </header>
            <div className="nh-template-modal-body">
              <div className="nh-template-modal-preview">
                {renderTemplatePreview(previewTemplate, "nh-template-modal-page")}
              </div>
              <aside>
                <span>ATS-friendly layout</span>
                <h3>Preview before opening the builder.</h3>
                <p>This template supports live editing, multi-page resume content, and PDF export.</p>
                <button type="button" onClick={() => useTemplate(previewTemplate)}>
                  Use Template <FaArrowRight />
                </button>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function TemplateCard({ template, onUse, onPreview, index }) {
  const badge = badgeFor(template);
  const meta = templateMeta(template);
  const reduceMotion = useReducedMotion();

  /* Per-card mouse-tracking 3D tilt on the resume paper */
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const paperRotateY = useSpring(useTransform(cx, [-0.5, 0.5], [-10, 10]), { stiffness: 130, damping: 22 });
  const paperRotateX = useSpring(useTransform(cy, [-0.5, 0.5], [7, -7]),  { stiffness: 130, damping: 22 });

  const onMouseMove = (e) => {
    if (reduceMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    cx.set((e.clientX - r.left) / r.width  - 0.5);
    cy.set((e.clientY - r.top)  / r.height - 0.5);
  };
  const onMouseLeave = () => { cx.set(0); cy.set(0); };

  return (
    <motion.article
      className="nh-template-card"
      style={{ "--template-accent": template.accent || "#06B6D4" }}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.42,
        delay: Math.min(index * 0.055, 0.38),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -8, transition: { type: "spring", stiffness: 220, damping: 20 } }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div className="nh-template-card-preview">
        <span className={`nh-template-badge ${badge.type}`}>{badge.label}</span>
        <span className="nh-template-ats-score">{meta.atsScore} ATS Score</span>
        <button type="button" className="nh-template-favorite" aria-label={`Save ${template.name}`}>
          <FaHeart />
        </button>

        {/* 3D-tilting paper */}
        <motion.div
          className="nh-template-paper"
          style={reduceMotion ? undefined : { rotateX: paperRotateX, rotateY: paperRotateY }}
          whileHover={{ scale: 1.04 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
        >
          {renderTemplatePreview(template, "h-full w-full")}
        </motion.div>

        <div className="nh-template-overlay">
          <div className="nh-template-action-bar">
            <button type="button" className="nh-quick-preview" onClick={onPreview}>
              <FaEye /> Preview
            </button>
            <button type="button" className="nh-use-template" onClick={onUse}>
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
}

function badgeFor(template) {
  if (template.category === "ATS") return { label: "ATS Certified", type: "ats", rank: 3 };
  if (/5|10|professional-cv/i.test(template.id)) return { label: "Popular", type: "popular", rank: 2 };
  return { label: "New", type: "new", rank: 1 };
}

function templateMeta(template) {
  const rank = badgeFor(template).rank;
  const idNumber = Number(template.id.match(/\d+/)?.[0] || rank + 3);
  const atsScore = template.category === "ATS" ? 98 : rank === 2 ? 94 : 91;
  return {
    atsScore: `${atsScore}%`,
    downloads: `${Math.max(4, idNumber * 2 + rank * 5)}k`,
    uses: `${Math.max(8, idNumber * 3 + rank * 7)}K`
  };
}
