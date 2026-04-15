import { useNavigate } from "react-router-dom";
import { resumeTemplates } from "../data/resumeTemplates.js";
import TemplateThumbnail from "../components/TemplateThumbnail.jsx";

const featureCards = [
  {
    title: "AI Content Generation",
    description: "Generate high-impact bullet points and summaries tailored to job descriptions in one click."
  },
  {
    title: "ATS Score Analysis",
    description: "Get real-time feedback on resume match quality against specific jobs and missing keywords."
  },
  {
    title: "Professional Templates",
    description: "Choose from recruiter-approved resume styles designed for maximum readability."
  }
];

const logos = ["GOOGLE", "META", "NETFLIX", "AIRBNB", "STRIPE"];

export default function HomePage() {
  const navigate = useNavigate();

  const categoryShowcase = [
    {
      category: "Creative",
      label: "Creative resume templates",
      template: resumeTemplates.find((item) => item.category === "Creative") || resumeTemplates[0],
      tint: "from-orange-200 to-orange-100"
    },
    {
      category: "Simple",
      label: "Simple resume templates",
      template: resumeTemplates.find((item) => item.category === "Simple") || resumeTemplates[1],
      tint: "from-slate-200 to-slate-100"
    },
    {
      category: "Modern",
      label: "Modern resume templates",
      template: resumeTemplates.find((item) => item.category === "Modern") || resumeTemplates[2],
      tint: "from-slate-300 to-slate-100"
    }
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-100 via-slate-100 to-sky-50">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
          <div>
            <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
              AI-powered career tools
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">
              Build an <span className="text-brand-600">ATS-Proof</span> Resume in Minutes
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Create, analyze, and improve your resume to land interviews faster with AI that actually understands hiring signals.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/builder")}
                className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Create New Resume
              </button>
              <button
                onClick={() => navigate("/login")}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Upload & Improve
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-300/50">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
              <p className="text-3xl font-bold">Alex Johnson</p>
              <p className="text-sm font-semibold text-brand-600">Senior Software Engineer</p>
              <div className="mt-5 space-y-2">
                <div className="h-3 w-4/5 rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-200" />
                <div className="h-3 w-2/3 rounded bg-slate-200" />
              </div>
            </div>
            <div className="absolute right-4 top-4 hidden rounded-lg bg-emerald-500 px-4 py-2 text-xl font-bold text-white md:block">94</div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-10">
        <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Trusted by seekers at world-class companies</p>
        <div className="mx-auto mt-6 grid w-full max-w-4xl grid-cols-2 gap-6 px-4 text-center text-3xl font-extrabold text-slate-400 md:grid-cols-5 md:px-6">
          {logos.map((logo) => (
            <span key={logo}>{logo}</span>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-16 md:px-6">
        <h2 className="text-center text-4xl font-extrabold">Choose Your Professional Template</h2>
        <p className="mx-auto mt-4 max-w-3xl text-center text-slate-600">
          Select one of the ATS-friendly resume templates below. Choose a category and you will see all templates from that style.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {categoryShowcase.map((item) => (
            <article key={item.category} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className={`h-72 bg-gradient-to-b ${item.tint} p-4`}>
                <div className="mx-auto h-full w-44">
                  <TemplateThumbnail template={item.template} />
                </div>
              </div>
              <button
                onClick={() => navigate(`/templates?category=${encodeURIComponent(item.category)}`)}
                className="w-full border-t border-slate-200 px-3 py-3 text-center text-sm font-bold text-brand-600 hover:bg-slate-50"
              >
                {item.label}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-extrabold">Top Resume Templates</h2>
            <p className="mt-2 text-slate-600">Pick a template and start building instantly.</p>
          </div>
          <button onClick={() => navigate("/templates")} className="text-sm font-bold text-brand-600 hover:text-brand-700">
            View All Templates
          </button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resumeTemplates.slice(0, 6).map((template) => (
            <article key={template.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="h-56 p-4" style={{ background: `linear-gradient(160deg, ${template.accent}22, #f1f5f9)` }}>
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
      </section>

      <section id="features" className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
        <h2 className="text-center text-4xl font-extrabold">Everything you need to land the interview</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-slate-600">
          A complete AI toolkit for resume creation, ATS optimization, and role-specific tailoring.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featureCards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-bold">{card.title}</h3>
              <p className="mt-3 text-slate-600">{card.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
