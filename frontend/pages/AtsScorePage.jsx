import { useMemo, useState } from "react";
import { scoreResume } from "../services/resumeApi.js";

const initialForm = {
  resumeText: "",
  jobDescriptionText: ""
};

export default function AtsScorePage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const totalScore = useMemo(() => Number(result?.total_score || 0), [result]);

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
      const data = await scoreResume(form);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to score resume");
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
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Resume Diagnostics</p>
        <h3 className="mt-2 text-2xl font-bold">ATS Score Analyzer</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Paste your resume and a job description to find missing keywords, scoring gaps, and fixes before you apply.
        </p>

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
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Job Description Text</span>
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

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Scoring..." : "Calculate ATS Score"}
          </button>

          <button
            type="button"
            className="rounded-lg border border-brand-500 px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-600/10"
          >
            Optimize to 90+
          </button>
        </div>
      </form>

      {result ? (
        <div className="grid gap-6 xl:grid-cols-[320px,1fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-lg font-bold">Total ATS Score</h4>
            <div className="mt-5 flex justify-center">
              <CircularScore value={totalScore} size={180} stroke={14} />
            </div>
            <p className="mt-3 text-center text-sm text-slate-600 dark:text-slate-300">
              Target 90+ by addressing the top fixes below.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-lg font-bold">Breakdown</h4>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {Object.entries(result.breakdown || {}).map(([key, item]) => (
                <div key={key} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {item.score} / {item.max}
                  </p>
                </div>
              ))}
            </div>

            <h5 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Missing Keywords
            </h5>
            <div className="mt-2 flex flex-wrap gap-2">
              {(result.missing_keywords || []).length ? (
                result.missing_keywords.map((word) => (
                  <span
                    key={word}
                    className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-600/20 dark:text-amber-100"
                  >
                    {word}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500 dark:text-slate-400">No missing keywords detected.</span>
              )}
            </div>

            <h5 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Top 3 High Impact Fixes
            </h5>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-200">
              {(result.top_3_high_impact_fixes || []).map((fix, index) => (
                <li key={`${fix}-${index}`}>{fix}</li>
              ))}
            </ol>
          </article>
        </div>
      ) : null}
    </section>
  );
}

function CircularScore({ value, size, stroke }) {
  const normalized = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-200 dark:text-slate-700"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-brand-600"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold">{normalized}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">out of 100</p>
      </div>
    </div>
  );
}
