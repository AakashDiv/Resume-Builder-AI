import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchApplications, updateApplicationStatus } from "../services/applicationsApi.js";

const STATUS_OPTIONS = ["queued", "applied", "viewed", "responded", "rejected", "failed"];

export default function ApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [isUpgradeRequired, setIsUpgradeRequired] = useState(false);
  const [toast, setToast] = useState(null);

  async function loadApplications() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchApplications();
      setItems(data.items || []);
      setSummary(data.summary || null);
      setIsUpgradeRequired(false);
    } catch (err) {
      if (err?.response?.status === 403) {
        setIsUpgradeRequired(true);
        setItems([]);
        setSummary(null);
      } else {
        setError(err?.response?.data?.message || "Unable to load applications.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function handleStatusChange(applicationId, nextStatus) {
    setSavingId(applicationId);
    setToast(null);

    try {
      const failReason = nextStatus === "failed"
        ? window.prompt("Add a short failure reason (optional):", "") || ""
        : "";

      const result = await updateApplicationStatus(applicationId, {
        status: nextStatus,
        failReason
      });

      setItems((prev) => prev.map((item) => (item.id === applicationId ? result.item : item)));
      setToast({
        type: "success",
        message: `Application updated to ${nextStatus}.`
      });
      await loadApplications();
    } catch (err) {
      setToast({
        type: "error",
        message: err?.response?.data?.message || "Unable to update application status."
      });
    } finally {
      setSavingId("");
    }
  }

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        Loading applications...
      </section>
    );
  }

  if (isUpgradeRequired) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-2xl font-bold">Applications Tracker</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          This tracker is available on Pro. Upgrade to manage queued, applied, viewed, and responded jobs in one place.
        </p>
        <div className="mt-5">
          <Link to="/app/subscription" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            View Pro Plan
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {toast ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm font-medium ${
            toast.type === "error" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Pipeline Tracker</p>
          <h3 className="mt-2 text-2xl font-bold">Applications Board</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Review queued auto-apply jobs, successful submissions, manual updates, and failures from one workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/app/dashboard"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={loadApplications}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {summary ? (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-7">
          <SummaryCard label="Total" value={summary.total || 0} />
          <SummaryCard label="Queued" value={summary.queued || 0} />
          <SummaryCard label="Applied" value={summary.applied || 0} />
          <SummaryCard label="Viewed" value={summary.viewed || 0} />
          <SummaryCard label="Responded" value={summary.responded || 0} />
          <SummaryCard label="Rejected" value={summary.rejected || 0} />
          <SummaryCard label="Failed" value={summary.failed || 0} />
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {!items.length ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
            No applications yet. Save a matched job from the dashboard to create your first tracked application.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="pb-3 pr-4 font-semibold">Role</th>
                  <th className="pb-3 pr-4 font-semibold">Company</th>
                  <th className="pb-3 pr-4 font-semibold">Source</th>
                  <th className="pb-3 pr-4 font-semibold">Match</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 pr-4 font-semibold">Updated</th>
                  <th className="pb-3 font-semibold">Link</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-4 pr-4">
                      <div className="font-semibold">{item.job?.title || "Untitled role"}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{item.job?.platform || item.source}</div>
                    </td>
                    <td className="py-4 pr-4">{item.job?.company || "-"}</td>
                    <td className="py-4 pr-4 uppercase">{item.source}</td>
                    <td className="py-4 pr-4">{item.matchScore || 0}%</td>
                    <td className="py-4 pr-4">
                      <select
                        value={item.status}
                        onChange={(event) => handleStatusChange(item.id, event.target.value)}
                        disabled={savingId === item.id}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {item.failReason ? (
                        <div className="mt-1 text-xs text-rose-600 dark:text-rose-300">{item.failReason}</div>
                      ) : null}
                    </td>
                    <td className="py-4 pr-4 text-slate-500 dark:text-slate-400">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-"}
                    </td>
                    <td className="py-4">
                      {item.job?.applyUrl ? (
                        <a
                          href={item.job.applyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-brand-600 hover:text-brand-700"
                        >
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
        )}
      </section>
    </section>
  );
}

function SummaryCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </article>
  );
}
