import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resumeTemplates } from "../data/resumeTemplates.js";
import TemplateThumbnail from "../components/TemplateThumbnail.jsx";

const categories = ["All", "Creative", "Simple", "Modern"];

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const [active, setActive] = useState(categories.includes(initialCategory) ? initialCategory : "All");

  useEffect(() => {
    const category = searchParams.get("category") || "All";
    setActive(categories.includes(category) ? category : "All");
  }, [searchParams]);

  const filtered = useMemo(
    () => (active === "All" ? resumeTemplates : resumeTemplates.filter((item) => item.category === active)),
    [active]
  );

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-[260px,1fr] md:px-6">
      <aside className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Categories</p>
        <div className="mt-3 space-y-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold ${
                active === cat ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </aside>

      <div>
        <h1 className="text-4xl font-extrabold">Resume Template Library</h1>
        <p className="mt-2 text-lg text-slate-600">Choose from AI-optimized templates to land your dream job faster.</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <article key={template.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="h-56 p-4" style={{ background: `linear-gradient(160deg, ${template.accent}24, #f1f5f9)` }}>
                <div className="mx-auto h-full w-40">
                  <TemplateThumbnail template={template} />
                 
                </div>
              </div>
              <div className="p-4">
                <p className="text-xl font-bold">{template.name}</p>
                <p className="text-sm text-slate-500">{template.category}</p>
                <button
                  onClick={() => navigate(`/builder?template=${template.id}`)}
                  className="mt-4 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Use Template
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
