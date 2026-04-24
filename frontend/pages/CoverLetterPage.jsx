import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMatchedJobs } from "../services/matchApi.js";
import { generateCoverLetter } from "../services/resumeApi.js";

const initialForm = {
  jobId: "",
  role: "",
  company: "",
  jobDescriptionText: ""
};

export default function CoverLetterPage() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadJobs() {
      setLoadingJobs(true);
      try {
        const data = await fetchMatchedJobs();
        setJobs(data.items || []);
      } catch (_err) {
        setJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    }

    loadJobs();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "jobId") {
      const selected = jobs.find((item) => item.job.id === value);
      if (selected) {
        setForm({
          jobId: selected.job.id,
          role: selected.job.title || "",
          company: selected.job.company || "",
          jobDescriptionText: selected.job.description || ""
        });
        return;
      }
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setGenerating(true);
    setError("");
    setUpgradeRequired(false);
    setCopied(false);

    try {
      const payload = {};
      if (form.jobId) payload.jobId = form.jobId;
      if (form.role.trim()) payload.role = form.role.trim();
      if (form.company.trim()) payload.company = form.company.trim();
      if (form.jobDescriptionText.trim()) payload.jobDescriptionText = form.jobDescriptionText.trim();

      const data = await generateCoverLetter(payload);
      setResult(data.coverLetter || "");
    } catch (err) {
      if (err?.response?.status === 403) {
        setUpgradeRequired(true);
        setResult("");
      } else {
        setError(err?.response?.data?.message || "Unable to generate cover letter.");
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
    } catch (_error) {
      setError("Clipboard access is not available in this browser context.");
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-2xl font-bold">Cover Letter Studio</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Generate a concise, profile-aware cover letter from a matched job or a pasted job description.
        </p>
      </div>

      {upgradeRequired ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
          Cover-letter generation is available on Pro.
          <div className="mt-3">
            <Link to="/app/subscription" className="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-200">
              Upgrade to Pro
            </Link>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr,1fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Use Saved Matched Job</span>
              <select
                name="jobId"
                value={form.jobId}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">{loadingJobs ? "Loading saved jobs..." : "Select a matched job (optional)"}</option>
                {jobs.map((item) => (
                  <option key={item.job.id} value={item.job.id}>
                    {item.job.title} - {item.job.company}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Role</span>
              <input
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950"
                placeholder="e.g. Backend Developer"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Company</span>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950"
                placeholder="e.g. OpenAI"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Job Description</span>
              <textarea
                name="jobDescriptionText"
                rows={12}
                value={form.jobDescriptionText}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950"
                placeholder="Paste the job description here if you are not using a saved match."
                required={!form.jobId}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={generating}
            className="mt-5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {generating ? "Generating..." : "Generate Cover Letter"}
          </button>
        </form>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xl font-bold">Generated Draft</h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Designed to stay concise and ready for editing.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!result}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="mt-5 min-h-[420px] rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
            {result ? (
              <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-800 dark:text-slate-100">{result}</pre>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Generate a cover letter from your selected job and candidate profile.
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
