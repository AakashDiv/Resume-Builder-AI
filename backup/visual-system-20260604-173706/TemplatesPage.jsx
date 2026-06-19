import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaArrowRight, FaEye, FaLayerGroup, FaMagnifyingGlass, FaStar, FaXmark } from "react-icons/fa6";
import { resumeTemplates } from "../data/resumeTemplates.js";
import TemplateThumbnail from "../components/TemplateThumbnail.jsx";

const categories = ["All", "Creative", "Modern", "Minimalist", "ATS"];

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

  const filtered = useMemo(() => {
    const byCategory = active === "All" ? resumeTemplates : resumeTemplates.filter((item) => item.category === active);
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return byCategory;
    return byCategory.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(normalizedQuery));
  }, [active, query]);

  const featured = useMemo(() => {
    const preferred = ["modern-professional-5", "ats-friendly-resume-10", "simple-professional"];
    return preferred.map((id) => resumeTemplates.find((template) => template.id === id)).filter(Boolean);
  }, []);

  function useTemplate(template) {
    navigate(`/builder?template=${template.id}`);
  }

  return (
    <main className="template26-page">
      <section className="template26-hero">
        <div className="template26-shell template26-hero-grid">
          <div>
            <p className="template26-eyebrow"><FaLayerGroup /> Resume Templates</p>
            <h1>Choose a resume design that already feels interview-ready.</h1>
            <p>
              Browse premium ATS-friendly, modern, creative, and minimalist templates. Preview the layout, then open it directly in the builder.
            </p>
          </div>
          <div className="template26-search-panel">
            <label>
              <span><FaMagnifyingGlass /> Search templates</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search modern, ATS, creative..." />
            </label>
            <div>
              <strong>{resumeTemplates.length}</strong>
              <span>Editable templates</span>
            </div>
          </div>
        </div>
      </section>

      <section className="template26-shell template26-featured">
        <div className="template26-section-heading">
          <div>
            <span>Featured</span>
            <h2>Start with the highest-converting layouts.</h2>
          </div>
          <button type="button" onClick={() => setActive("All")}>View all</button>
        </div>
        <div className="template26-featured-grid">
          {featured.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              featured
              onUse={() => useTemplate(template)}
              onPreview={() => setPreviewTemplate(template)}
            />
          ))}
        </div>
      </section>

      <section className="template26-shell template26-library">
        <aside className="template26-filter-panel">
          <p>Categories</p>
          <div>
            {categories.map((cat) => {
              const count = cat === "All" ? resumeTemplates.length : resumeTemplates.filter((item) => item.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={active === cat ? "is-active" : ""}
                >
                  <span>{cat}</span>
                  <em>{count}</em>
                </button>
              );
            })}
          </div>
        </aside>

        <div>
          <div className="template26-results-bar">
            <div>
              <p>{active} templates</p>
              <span>{filtered.length} result{filtered.length === 1 ? "" : "s"} available</span>
            </div>
          </div>

          <div className="template26-grid">
            {filtered.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={() => useTemplate(template)}
                onPreview={() => setPreviewTemplate(template)}
              />
            ))}
          </div>
        </div>
      </section>

      {previewTemplate ? (
        <div className="template26-modal" role="dialog" aria-modal="true" aria-label={`${previewTemplate.name} preview`}>
          <div className="template26-modal-panel">
            <div className="template26-modal-header">
              <div>
                <p>{previewTemplate.category}</p>
                <h2>{previewTemplate.name}</h2>
              </div>
              <button type="button" onClick={() => setPreviewTemplate(null)} aria-label="Close preview">
                <FaXmark />
              </button>
            </div>
            <div className="template26-modal-body">
              <div className="template26-modal-preview">
                <TemplateThumbnail template={previewTemplate} />
              </div>
              <aside>
                <h3>Template Details</h3>
                <p>Editable in the resume builder with live preview, PDF export, color controls where supported, and ATS-friendly structure.</p>
                <button type="button" onClick={() => useTemplate(previewTemplate)}>
                  Use this template <FaArrowRight />
                </button>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function TemplateCard({ template, featured = false, onUse, onPreview }) {
  return (
    <article className={`template26-card ${featured ? "is-featured" : ""}`}>
      <div className="template26-card-preview" style={{ "--template-accent": template.accent || "#0891b2" }}>
        <div>
          <TemplateThumbnail template={template} />
        </div>
        <div className="template26-card-actions">
          <button type="button" onClick={onPreview}><FaEye /> Preview</button>
          <button type="button" onClick={onUse}>Use <FaArrowRight /></button>
        </div>
      </div>
      <div className="template26-card-info">
        <div>
          <p>{template.name}</p>
          <span>{template.category}</span>
        </div>
        <em><FaStar /> ATS</em>
      </div>
    </article>
  );
}
