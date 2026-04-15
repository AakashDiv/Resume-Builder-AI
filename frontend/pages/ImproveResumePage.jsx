import { useMemo, useState } from "react";
import { improveResume } from "../services/resumeApi.js";

const MAX_SIZE_BYTES = 2 * 1024 * 1024;

export default function ImproveResumePage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const score = useMemo(() => Number(result?.improvementScore || 0), [result]);

  function onFileChange(event) {
    const selected = event.target.files?.[0] || null;
    setError("");
    setResult(null);

    if (!selected) {
      setFile(null);
      return;
    }

    const extension = (selected.name.split(".").pop() || "").toLowerCase();
    if (!["pdf", "doc", "docx"].includes(extension)) {
      setError("Please upload a PDF or DOCX file.");
      setFile(null);
      return;
    }

    if (selected.size > MAX_SIZE_BYTES) {
      setError("File size must be 2MB or less.");
      setFile(null);
      return;
    }

    setFile(selected);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file || loading) return;

    setLoading(true);
    setError("");

    try {
      const data = await improveResume(file);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to improve resume.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h3 className="text-xl font-bold">Improve Resume</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Upload your resume (`.pdf`, `.doc`, `.docx`) and get an AI-rewritten before-vs-after comparison.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={onFileChange}
            className="block w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          <button
            type="submit"
            disabled={!file || loading}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Improving..." : "Improve Resume"}
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Maximum file size: 2MB</p>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </form>

      {result ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-lg font-bold">Improvement Score</h4>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Current</span>
                <span className="font-semibold">{score}/100</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-3 rounded-full bg-brand-600"
                  style={{ width: `${Math.max(3, Math.min(100, score))}%` }}
                />
              </div>
            </div>

            <h5 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Missing Keywords
            </h5>
            <div className="mt-2 flex flex-wrap gap-2">
              {(result.missingKeywords || []).length ? (
                result.missingKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-600/20 dark:text-amber-100"
                  >
                    {keyword}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500 dark:text-slate-400">No keyword suggestions returned.</span>
              )}
            </div>

            <h5 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Suggestions
            </h5>
            <ul className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              {(result.suggestions || []).map((item, index) => (
                <li key={`${item}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-lg font-bold">Before vs After</h4>

            <ComparisonBlock
              title="Summary"
              before={result.comparison?.before?.summary || "Not detected"}
              after={result.comparison?.after?.summary || "Not generated"}
            />

            <ComparisonList
              title="Experience Bullets"
              before={result.comparison?.before?.bulletPoints || []}
              after={result.comparison?.after?.bulletPoints || []}
            />
          </article>
        </div>
      ) : null}
    </section>
  );
}

function ComparisonBlock({ title, before, after }) {
  return (
    <section className="grid gap-3 md:grid-cols-2">
      <h5 className="md:col-span-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</h5>
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-900 dark:bg-rose-950/30">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-200">Before</p>
        <p className="text-sm text-slate-800 dark:text-slate-100">{before}</p>
      </div>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">After</p>
        <p className="text-sm text-slate-800 dark:text-slate-100">{after}</p>
      </div>
    </section>
  );
}

function ComparisonList({ title, before, after }) {
  return (
    <section className="grid gap-3 md:grid-cols-2">
      <h5 className="md:col-span-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</h5>
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-900 dark:bg-rose-950/30">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-200">Before</p>
        <ul className="space-y-2 text-sm text-slate-800 dark:text-slate-100">
          {before.length ? before.map((item, index) => <li key={`${item}-${index}`}>- {item}</li>) : <li>No bullets detected.</li>}
        </ul>
      </div>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">After</p>
        <ul className="space-y-2 text-sm text-slate-800 dark:text-slate-100">
          {after.length ? after.map((item, index) => <li key={`${item}-${index}`}>- {item}</li>) : <li>No bullets generated.</li>}
        </ul>
      </div>
    </section>
  );
}
