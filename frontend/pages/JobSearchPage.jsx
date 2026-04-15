import { useMemo, useState } from "react";
import { exportJobsAsCsv, getDownloadUrl, normalizeJobRow, runScraper } from "../services/jobScraperApi.js";

const PLATFORM_OPTIONS = ["LinkedIn", "Indeed", "Naukri", "Foundit", "Glassdoor"];
const TIME_OPTIONS = ["Last 24 Hours", "Last 3 Days", "Last 5 Days"];
const PAGE_SIZE = 10;

const initialFilters = {
  role: "",
  location: "",
  platforms: ["LinkedIn"],
  timeFilter: "Last 5 Days"
};

const columns = [
  ["Platform", "platform"],
  ["Job Title", "title"],
  ["Company", "company"],
  ["Location", "location"],
  ["Source", "source"],
  ["Date Posted", "posted_at"],
  ["View Job", "url"]
];

export default function JobSearchPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [jobs, setJobs] = useState([]);
  const [downloadPath, setDownloadPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState(null);

  const [sortBy, setSortBy] = useState("platform");
  const [direction, setDirection] = useState("asc");
  const [page, setPage] = useState(1);

  const sortedRows = useMemo(() => {
    const list = [...jobs];
    list.sort((a, b) => {
      const av = String(a[sortBy] ?? "").toLowerCase();
      const bv = String(b[sortBy] ?? "").toLowerCase();
      if (av < bv) return direction === "asc" ? -1 : 1;
      if (av > bv) return direction === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [jobs, sortBy, direction]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visibleRows = sortedRows.slice(start, start + PAGE_SIZE);

  function onSort(key) {
    setPage(1);
    if (sortBy === key) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(key);
    setDirection("asc");
  }

  function togglePlatform(platform) {
    setFilters((prev) => {
      const has = prev.platforms.includes(platform);
      const platforms = has ? prev.platforms.filter((item) => item !== platform) : [...prev.platforms, platform];
      return { ...prev, platforms };
    });
  }

  async function handleSearch() {
    if (!filters.platforms.length || loading) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const data = await runScraper(filters);
      const normalized = Array.isArray(data.jobs) ? data.jobs.map(normalizeJobRow) : [];
      setJobs(normalized);
      setDownloadPath(data.downloadUrl || "");
      setSuccess(true);
      setPage(1);
      setToast({ type: "success", message: "Job scrape completed successfully." });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to run scraper";
      setError(msg);
      setToast({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setFilters(initialFilters);
    setJobs([]);
    setDownloadPath("");
    setError("");
    setSuccess(false);
    setPage(1);
  }

  return (
    <section className="space-y-4">
      {toast ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            toast.type === "error" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span>{toast.message}</span>
            <button className="text-xs font-semibold" onClick={() => setToast(null)}>
              Close
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[340px,1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-bold">Smart Job Search</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Run your Python scraper with filters</p>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Role Name</span>
              <input
                type="text"
                value={filters.role}
                onChange={(event) => setFilters((prev) => ({ ...prev, role: event.target.value }))}
                placeholder="e.g. HR Manager"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Location</span>
              <input
                type="text"
                value={filters.location}
                onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
                placeholder="e.g. Delhi, India"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>

            <div>
              <span className="mb-1 block text-sm font-medium">Platforms</span>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORM_OPTIONS.map((platform) => (
                  <label
                    key={platform}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={filters.platforms.includes(platform)}
                      onChange={() => togglePlatform(platform)}
                      className="rounded border-slate-300 text-brand-600"
                    />
                    {platform}
                  </label>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Time Filter</span>
              <select
                value={filters.timeFilter}
                onChange={(event) => setFilters((prev) => ({ ...prev, timeFilter: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950"
              >
                {TIME_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSearch}
                disabled={loading || !filters.platforms.length}
                className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {loading ? "Searching..." : "Search"}
              </button>
              <button
                type="button"
                onClick={clearFilters}
                disabled={loading}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Clear
              </button>
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h4 className="text-lg font-bold">Scraped Jobs</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">Results from your Python scraper</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => exportJobsAsCsv(jobs)}
                disabled={!jobs.length}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50 dark:border-slate-700"
              >
                Export CSV
              </button>
              <a
                href={downloadPath ? getDownloadUrl(downloadPath) : "#"}
                className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${
                  downloadPath ? "bg-brand-600 hover:bg-brand-700" : "pointer-events-none bg-slate-400"
                }`}
              >
                Download Excel
              </a>
            </div>
          </div>

          <StatusCard loading={loading} error={error} success={success} count={jobs.length} />

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {!jobs.length ? (
              <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                No jobs available yet. Run a search to load results.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                    <thead>
                      <tr>
                        {columns.map(([label, key]) => (
                          <th key={key} className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">
                            <button className="hover:text-brand-600" onClick={() => onSort(key)}>
                              {label} {sortBy === key ? (direction === "asc" ? "?" : "?") : ""}
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRows.map((job, index) => (
                        <tr key={`${job.url || index}-${index}`} className="bg-slate-50 dark:bg-slate-800/70">
                          <td className="rounded-l-xl px-3 py-2">{job.platform || "-"}</td>
                          <td className="px-3 py-2">{job.title || "-"}</td>
                          <td className="px-3 py-2">{job.company || "-"}</td>
                          <td className="px-3 py-2">{job.location || "-"}</td>
                          <td className="px-3 py-2">{job.source || "-"}</td>
                          <td className="px-3 py-2">{job.posted_at || "-"}</td>
                          <td className="rounded-r-xl px-3 py-2">
                            {job.url ? (
                              <a href={job.url} target="_blank" rel="noreferrer" className="font-medium text-brand-600 hover:text-brand-700">
                                Open
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                  <p>
                    Showing {start + 1}-{Math.min(start + PAGE_SIZE, sortedRows.length)} of {sortedRows.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={safePage === 1}
                      className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40 dark:border-slate-700"
                    >
                      Prev
                    </button>
                    <span>
                      Page {safePage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={safePage === totalPages}
                      className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40 dark:border-slate-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusCard({ loading, error, success, count }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
        Running scraper. This can take a few minutes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
        {error}
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
        Scrape complete. {count} jobs loaded.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
      Configure filters and click Search.
    </div>
  );
}
