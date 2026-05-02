import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCurrentUser } from "../services/authApi.js";
import { fetchMatchedJobs, runMatchCalculation } from "../services/matchApi.js";
import { fetchProfile } from "../services/profileApi.js";
import { fetchApplications } from "../services/applicationsApi.js";
import { fetchQueueStatus, manualApply, setAutoApplyEnabled } from "../services/applyApi.js";
import { disableScheduler, enableScheduler, fetchSchedulerStatus } from "../services/schedulerApi.js";

function getProfileCompletion(profile) {
  const extracted = profile?.extractedProfile || {};
  const checks = [
    extracted.fullName,
    extracted.email,
    extracted.targetRole,
    extracted.location,
    extracted.educationLevel,
    Array.isArray(extracted.skills) && extracted.skills.length,
    profile?.summary,
    profile?.rawResumeText || profile?.resumeMarkdown
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState("");
  const [togglingAutoApply, setTogglingAutoApply] = useState(false);
  const [togglingScheduler, setTogglingScheduler] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchTotal, setMatchTotal] = useState(0);
  const [hasProfile, setHasProfile] = useState(false);
  const [queueStatus, setQueueStatus] = useState(null);
  const [applicationSummary, setApplicationSummary] = useState(null);
  const [schedulerStatus, setSchedulerStatus] = useState(null);

  async function loadDashboard(showLoader = true) {
    if (showLoader) {
      setLoading(true);
    }

    setError("");

    try {
      const userData = await fetchCurrentUser();
      setUser(userData.user);

      const requests = [
        fetchProfile(),
        fetchMatchedJobs()
      ];

      if (userData.user?.plan === "pro") {
        requests.push(fetchQueueStatus(), fetchApplications(), fetchSchedulerStatus());
      }

      const results = await Promise.allSettled(requests);
      const [profileResult, matchesResult, queueResult, applicationsResult, schedulerResult] = results;

      if (profileResult?.status === "fulfilled") {
        setProfile(profileResult.value.profile);
      }

      if (matchesResult?.status === "fulfilled") {
        setMatches(matchesResult.value.items || []);
        setMatchTotal(matchesResult.value.total || 0);
        setHasProfile(Boolean(matchesResult.value.hasProfile));
      } else {
        setMatches([]);
        setMatchTotal(0);
        setHasProfile(false);
      }

      if (queueResult?.status === "fulfilled") {
        setQueueStatus(queueResult.value);
      } else {
        setQueueStatus(null);
      }

      if (applicationsResult?.status === "fulfilled") {
        setApplicationSummary(applicationsResult.value.summary);
      } else {
        setApplicationSummary(null);
      }

      if (schedulerResult?.status === "fulfilled") {
        setSchedulerStatus(schedulerResult.value);
      } else {
        setSchedulerStatus(null);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const completion = useMemo(() => getProfileCompletion(profile), [profile]);

  async function handleRunMatches() {
    setRefreshing(true);
    setToast(null);

    try {
      const result = await runMatchCalculation();
      await loadDashboard(false);
      setToast({
        type: "success",
        message: `Recomputed ${result.matchesComputed || 0} matches.`
      });
    } catch (err) {
      setRefreshing(false);
      setToast({
        type: "error",
        message: err?.response?.data?.message || "Unable to run job matching right now."
      });
    }
  }

  async function handleToggleAutoApply() {
    if (!user || user.plan !== "pro") {
      return;
    }

    setTogglingAutoApply(true);
    setToast(null);

    try {
      const result = await setAutoApplyEnabled(!queueStatus?.autoApplyEnabled);
      setQueueStatus((prev) => ({
        ...(prev || {}),
        ...result
      }));
      setUser((prev) => (prev ? { ...prev, autoApplyEnabled: result.autoApplyEnabled } : prev));
      setToast({
        type: "success",
        message: result.autoApplyEnabled
          ? `Auto-apply enabled. ${result.createdCount || 0} jobs added to queue.`
          : "Auto-apply disabled."
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err?.response?.data?.message || "Unable to update auto-apply."
      });
    } finally {
      setTogglingAutoApply(false);
    }
  }

  async function handleToggleScheduler() {
    if (!user || user.plan !== "pro") {
      return;
    }

    setTogglingScheduler(true);
    setToast(null);

    try {
      const nextEnabled = !schedulerStatus?.automaticWorkEnabled;
      const result = nextEnabled ? await enableScheduler() : await disableScheduler();
      setSchedulerStatus(result);
      setToast({
        type: "success",
        message: nextEnabled ? "Automatic daily work enabled." : "Automatic daily work stopped."
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err?.response?.data?.message || "Unable to update automatic work."
      });
    } finally {
      setTogglingScheduler(false);
    }
  }

  async function handleManualApply(jobId) {
    setApplyingJobId(jobId);
    setToast(null);

    try {
      const result = await manualApply(jobId);
      await loadDashboard(false);
      setToast({
        type: "success",
        message: `Application saved for ${result.application?.job?.title || "selected job"}.`
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err?.response?.data?.message || "Unable to create application."
      });
    } finally {
      setApplyingJobId("");
    }
  }

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        Loading dashboard...
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

      <div className="grid gap-4 xl:grid-cols-[1.5fr,1fr,1fr,1fr]">
        <MetricCard title="Profile Readiness" value={`${completion}%`} subtitle="Resume + target role + skills coverage" />
        <MetricCard title="Matched Jobs" value={matchTotal} subtitle={user?.plan === "pro" ? "All saved matches" : "Top 10 visible on free"} />
        <MetricCard
          title="Queued Applications"
          value={queueStatus?.queuedCount ?? 0}
          subtitle={user?.plan === "pro" ? "Premium auto-apply queue" : "Upgrade to unlock queueing"}
        />
        <MetricCard
          title="Applied Jobs"
          value={applicationSummary?.applied ?? 0}
          subtitle={user?.plan === "pro" ? "Tracked in your application board" : "Tracker is available on Pro"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.95fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Control Center</p>
                <h3 className="mt-2 text-2xl font-bold">Your job-matching workspace</h3>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  Save your profile once, search jobs, then refresh matches to rank opportunities against your resume and skills.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRunMatches}
                  disabled={refreshing || !hasProfile}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {refreshing ? "Refreshing..." : "Recompute Matches"}
                </button>
                <Link
                  to="/app/job-search"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  Search Jobs
                </Link>
              </div>
            </div>

            {!hasProfile ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                Add your resume or fill out your candidate profile first. Matching works after we know your role, skills, and resume content.
                <div className="mt-3">
                  <Link to="/app/profile" className="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-200">
                    Open Profile Setup
                  </Link>
                </div>
              </div>
            ) : null}

            {profile ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <InfoBlock
                  title="Target Role"
                  value={profile.extractedProfile?.targetRole || "Not set yet"}
                />
                <InfoBlock
                  title="Preferred Location"
                  value={profile.extractedProfile?.location || "Not set yet"}
                />
                <InfoBlock
                  title="Top Skills"
                  value={(profile.extractedProfile?.skills || []).slice(0, 6).join(", ") || "Add skills to improve matching"}
                />
                <InfoBlock
                  title="Resume Source"
                  value={profile.lastSource ? `Last updated from ${profile.lastSource}` : "Manual profile"}
                />
              </div>
            ) : null}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">Top Matches</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Ranked against your saved profile and resume.
                </p>
              </div>
              {user?.plan !== "pro" && matchTotal > matches.length ? (
                <Link to="/app/subscription" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                  Unlock all matches
                </Link>
              ) : null}
            </div>

            {!matches.length ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                No matched jobs yet. Run the scraper to save jobs, then refresh matches from this dashboard.
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {matches.map((item) => (
                  <article
                    key={item.job.id}
                    className="rounded-2xl border border-slate-200 p-4 transition hover:border-brand-300 dark:border-slate-800 dark:hover:border-brand-500"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-semibold">{item.job.title}</h4>
                          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-600/15 dark:text-brand-100">
                            {item.matchScore}% match
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {item.job.company || "Unknown company"} {item.job.location ? `• ${item.job.location}` : ""}
                        </p>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          {item.job.platform || "Saved job"} {item.job.datePosted ? `• ${new Date(item.job.datePosted).toLocaleDateString()}` : ""}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {item.job.applyUrl ? (
                          <a
                            href={item.job.applyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                          >
                            Open Job
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleManualApply(item.job.id)}
                          disabled={user?.plan !== "pro" || applyingJobId === item.job.id}
                          className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700"
                        >
                          {applyingJobId === item.job.id ? "Applying..." : "Save Application"}
                        </button>
                      </div>
                    </div>

                    {item.highlights?.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.highlights.map((highlight) => (
                          <span
                            key={highlight}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <SkillGroup title="Matched Skills" items={item.matchedSkills} tone="emerald" emptyLabel="No direct skill matches yet" />
                      <SkillGroup title="Missing Skills" items={item.missingSkills} tone="amber" emptyLabel="No major gaps found" />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">Automation</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Queue strong matches for follow-up and application tracking.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                {user?.plan}
              </span>
            </div>

            {user?.plan === "pro" ? (
              <>
                <button
                  type="button"
                  onClick={handleToggleAutoApply}
                  disabled={togglingAutoApply}
                  className={`mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white ${
                    queueStatus?.autoApplyEnabled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-brand-600 hover:bg-brand-700"
                  } disabled:opacity-60`}
                >
                  {togglingAutoApply
                    ? "Updating..."
                    : queueStatus?.autoApplyEnabled
                      ? "Disable Auto-Apply Queue"
                      : "Enable Auto-Apply Queue"}
                </button>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                  <InfoBlock title="Queue Size" value={`${queueStatus?.queuedCount ?? 0} jobs`} />
                  <InfoBlock title="Daily Limit" value={`${queueStatus?.autoApplyLimit ?? user?.autoApplyLimit ?? 10} jobs`} />
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Automatic Daily Work</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Job fetch, matching, queueing, and digest trigger.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleScheduler}
                      disabled={togglingScheduler}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold text-white ${
                        schedulerStatus?.automaticWorkEnabled ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                      } disabled:opacity-60`}
                    >
                      {togglingScheduler
                        ? "Updating..."
                        : schedulerStatus?.automaticWorkEnabled
                          ? "Stop"
                          : "Start"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
                Upgrade to Pro to queue top matches, generate cover letters, and manage applications from one board.
                <div className="mt-3">
                  <Link to="/app/subscription" className="font-semibold text-brand-600 hover:text-brand-700">
                    View Pro Plan
                  </Link>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-bold">Application Snapshot</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Quick view of your tracker status.
            </p>

            {applicationSummary ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <MiniStat label="Queued" value={applicationSummary.queued || 0} />
                <MiniStat label="Applied" value={applicationSummary.applied || 0} />
                <MiniStat label="Viewed" value={applicationSummary.viewed || 0} />
                <MiniStat label="Responded" value={applicationSummary.responded || 0} />
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {user?.plan === "pro"
                  ? "No tracked applications yet. Save a matched job to create your first application entry."
                  : "The application tracker becomes available on Pro."}
              </div>
            )}

            <div className="mt-5">
              <Link to="/app/applications" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                Open Applications Board
              </Link>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ title, value, subtitle }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
    </article>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function InfoBlock({ title, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
}

function SkillGroup({ title, items, tone, emptyLabel }) {
  const palette = tone === "emerald"
    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
    : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-100";

  return (
    <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items?.length ? (
          items.map((item) => (
            <span key={item} className={`rounded-full px-3 py-1 text-xs font-semibold ${palette}`}>
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-slate-500 dark:text-slate-400">{emptyLabel}</span>
        )}
      </div>
    </div>
  );
}
