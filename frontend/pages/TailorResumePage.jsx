import { useState } from "react";
import { tailorResume } from "../services/resumeApi.js";

const initialForm = {
  resumeText: "",
  jobDescriptionText: ""
};

export default function TailorResumePage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const data = await tailorResume(form);
      setResult(data);
    } catch (err) {
      if (err?.response?.status === 403) {
        setError("This is a Pro feature. Upgrade your plan to use Resume Tailoring.");
      } else {
        setError(err?.response?.data?.message || "Failed to tailor resume");
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Pro Optimization</p>
            <h3 className="mt-2 text-2xl font-bold">Tailor Resume</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Align your resume to a specific job description before saving or applying.
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-600/20 dark:text-amber-100">
            Pro Only
          </span>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Resume Text</span>
            <textarea
              name="resumeText"
              rows={12}
              value={form.resumeText}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Job Description</span>
            <textarea
              name="jobDescriptionText"
              rows={12}
              value={form.jobDescriptionText}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950"
              required
            />
          </label>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Tailoring..." : "Tailor Resume"}
        </button>
      </form>

      {result ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-lg font-bold">Updated Summary</h4>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{result.rewritten_summary}</p>

            <h5 className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Rewritten Top 5 Bullets
            </h5>
            <ul className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              {(result.rewritten_top_5_bullets || []).map((bullet, index) => (
                <li key={`${bullet}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
                  - {bullet}
                </li>
              ))}
            </ul>

            <h5 className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Injected Keywords
            </h5>
            <div className="mt-2 flex flex-wrap gap-2">
              {(result.injected_keywords || []).map((word) => (
                <span
                  key={word}
                  className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-600/20 dark:text-emerald-100"
                >
                  {word}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-lg font-bold">Improved Resume</h4>
            <pre className="mt-3 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
              {result.improved_resume}
            </pre>

            <div className="mt-4 rounded-xl bg-brand-50 p-4 dark:bg-brand-600/10">
              <p className="text-sm font-semibold text-brand-700 dark:text-brand-100">New ATS Score</p>
              <p className="mt-1 text-2xl font-bold text-brand-700 dark:text-brand-100">
                {result.new_ats_score?.total_score ?? "-"}
              </p>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
