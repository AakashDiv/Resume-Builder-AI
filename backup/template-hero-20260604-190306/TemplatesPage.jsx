import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaArrowRight,
  FaBriefcase,
  FaChartLine,
  FaCode,
  FaEye,
  FaFilePdf,
  FaGraduationCap,
  FaMagnifyingGlass,
  FaPalette,
  FaShieldHalved,
  FaStar,
  FaUserTie,
  FaXmark
} from "react-icons/fa6";
import { resumeTemplates } from "../data/resumeTemplates.js";
import TemplateThumbnail from "../components/TemplateThumbnail.jsx";

const categories = ["All", "ATS", "Modern", "Professional", "Creative", "Minimalist"];

function isProfessionalTemplate(template) {
  return /professional|simple|cv/i.test(`${template.id} ${template.name}`);
}

function templatesByCategory(category) {
  if (category === "All") return resumeTemplates;
  if (category === "Professional") return resumeTemplates.filter(isProfessionalTemplate);
  return resumeTemplates.filter((item) => item.category === category);
}

function findTemplate(ids, fallbackIndex = 0) {
  return ids.map((id) => resumeTemplates.find((template) => template.id === id)).find(Boolean) || resumeTemplates[fallbackIndex];
}

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const [active, setActive] = useState(categories.includes(initialCategory) ? initialCategory : "All");
  const [query, setQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState(null);

  useEffect(() => {
    const category = searchParams.get("category") || "All";
    setActive(categories.includes(category) ? category : "All");
  }, [searchParams]);

  const featuredTemplate = useMemo(
    () => findTemplate(["modern-professional-5", "ats-friendly-resume-10", "professional-cv"], 0),
    []
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const source = templatesByCategory(active);
    if (!normalizedQuery) return source;
    return source.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(normalizedQuery));
  }, [active, query]);

  const collections = useMemo(() => {
    const mostPopularIds = ["modern-professional-5", "ats-friendly-resume-10", "simple-professional", "professional-cv", "modern-professional-4"];
    return [
      {
        key: "popular",
        title: "Most Popular",
        icon: FaStar,
        templates: mostPopularIds.map((id) => resumeTemplates.find((item) => item.id === id)).filter(Boolean)
      },
      {
        key: "software",
        title: "Software Engineers",
        icon: FaCode,
        templates: resumeTemplates.filter((item) => item.category === "Modern").slice(0, 5)
      },
      {
        key: "freshers",
        title: "Freshers",
        icon: FaGraduationCap,
        templates: resumeTemplates.filter((item) => item.category === "ATS").slice(0, 5)
      },
      {
        key: "ats",
        title: "ATS Optimized",
        icon: FaChartLine,
        templates: resumeTemplates.filter((item) => item.category === "ATS").slice(5, 10)
      },
      {
        key: "creative",
        title: "Creative",
        icon: FaPalette,
        templates: resumeTemplates.filter((item) => item.category === "Creative")
      },
      {
        key: "executive",
        title: "Executive",
        icon: FaUserTie,
        templates: resumeTemplates.filter(isProfessionalTemplate).slice(0, 5)
      }
    ].filter((collection) => collection.templates.length);
  }, []);

  function useTemplate(template) {
    navigate(`/builder?template=${template.id}`);
  }

  return (
    <main className="template-market-page">
      <section className="template-market-hero">
        <div className="template-market-shell template-market-hero-grid">
          <div className="template-market-copy">
            <p className="template-market-kicker">Resume Template Marketplace</p>
            <h1>Build a Resume Recruiters Actually Read</h1>
            <p>Choose ATS-approved templates designed for modern hiring.</p>
            <div className="template-market-badges">
              {["ATS Friendly", "Recruiter Approved", "Multi Page Support", "PDF Export", "20+ Professional Templates"].map((badge) => (
                <span key={badge}>{badge}</span>
              ))}
            </div>
          </div>

          <article className="template-market-featured">
            <div className="template-market-featured-preview">
              <TemplateThumbnail template={featuredTemplate} />
              <span className="template-market-popular">Most Popular</span>
            </div>
            <div className="template-market-featured-info">
              <div>
                <p>{featuredTemplate.name}</p>
                <span>{featuredTemplate.category} template</span>
              </div>
              <div className="template-market-score">
                <strong>94</strong>
                <span>ATS Score</span>
              </div>
            </div>
            <button type="button" onClick={() => useTemplate(featuredTemplate)}>
              Use Featured Template <FaArrowRight />
            </button>
          </article>
        </div>
      </section>

      <section className="template-market-shell template-market-controls">
        <div className="template-market-search">
          <FaMagnifyingGlass />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search resume templates" />
        </div>
        <nav className="template-market-categories" aria-label="Template categories">
          {categories.map((cat) => (
            <button key={cat} type="button" onClick={() => setActive(cat)} className={active === cat ? "is-active" : ""}>
              {cat}
              <span>{templatesByCategory(cat).length}</span>
            </button>
          ))}
        </nav>
      </section>

      <section className="template-market-shell template-market-categories-overview">
        {[
          ["ATS", FaShieldHalved],
          ["Modern", FaFilePdf],
          ["Professional", FaBriefcase],
          ["Creative", FaPalette],
          ["Minimalist", FaStar]
        ].map(([label, Icon]) => (
          <button key={label} type="button" onClick={() => setActive(label)}>
            <Icon />
            <span>{label}</span>
            <em>{templatesByCategory(label).length} templates</em>
          </button>
        ))}
      </section>

      <section className="template-market-shell template-market-collections">
        {collections.map((collection) => {
          const Icon = collection.icon;
          return (
            <section key={collection.key} className="template-market-collection">
              <div className="template-market-section-heading">
                <div>
                  <Icon />
                  <h2>{collection.title}</h2>
                </div>
                <button type="button" onClick={() => setActive(collection.title === "Executive" ? "Professional" : collection.title === "ATS Optimized" ? "ATS" : "All")}>
                  Browse
                </button>
              </div>
              <div className="template-market-row">
                {collection.templates.map((template) => (
                  <TemplateCard
                    key={`${collection.key}-${template.id}`}
                    template={template}
                    onUse={() => useTemplate(template)}
                    onPreview={() => setPreviewTemplate(template)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </section>

      <section className="template-market-shell template-market-all">
        <div className="template-market-section-heading">
          <div>
            <h2>{active} Templates</h2>
            <p>{filtered.length} professional template{filtered.length === 1 ? "" : "s"} ready to edit</p>
          </div>
        </div>
        <div className="template-market-grid">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={() => useTemplate(template)}
              onPreview={() => setPreviewTemplate(template)}
            />
          ))}
        </div>
      </section>

      <footer className="template-market-footer">
        <div className="template-market-shell">
          <h2>Start with a template. Finish with a resume that feels ready.</h2>
          <p>Choose a design, edit your content, and export a polished PDF.</p>
          <button type="button" onClick={() => useTemplate(featuredTemplate)}>
            Start Building <FaArrowRight />
          </button>
        </div>
      </footer>

      {previewTemplate ? (
        <div className="template-market-modal" role="dialog" aria-modal="true" aria-label={`${previewTemplate.name} preview`}>
          <div className="template-market-modal-panel">
            <header>
              <div>
                <p>{previewTemplate.category}</p>
                <h2>{previewTemplate.name}</h2>
              </div>
              <button type="button" onClick={() => setPreviewTemplate(null)} aria-label="Close preview">
                <FaXmark />
              </button>
            </header>
            <div className="template-market-modal-body">
              <div className="template-market-modal-preview">
                <TemplateThumbnail template={previewTemplate} fit="width" />
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

function TemplateCard({ template, onUse, onPreview }) {
  return (
    <article className="template-market-card">
      <div className="template-market-card-preview" style={{ "--template-accent": template.accent || "#2563EB" }}>
        <div>
          <TemplateThumbnail template={template} fit="cover" className="template-market-thumb h-full w-full" />
        </div>
        <button type="button" onClick={onPreview}>
          <FaEye /> Quick Preview
        </button>
      </div>
      <div className="template-market-card-meta">
        <div>
          <h3>{template.name}</h3>
          <p>{template.category}</p>
        </div>
        <span><FaStar /> ATS</span>
      </div>
      <div className="template-market-card-actions">
        <em>Popular</em>
        <div>
          <button type="button" className="is-secondary" onClick={onPreview}>Preview</button>
          <button type="button" onClick={onUse}>Use Template</button>
        </div>
      </div>
    </article>
  );
}
