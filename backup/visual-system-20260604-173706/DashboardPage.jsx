import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCurrentUser } from "../services/authApi.js";
import { fetchMatchedJobs, runMatchCalculation } from "../services/matchApi.js";
import { fetchProfile } from "../services/profileApi.js";
import { fetchApplications } from "../services/applicationsApi.js";
import { fetchQueueStatus, manualApply, setAutoApplyEnabled } from "../services/applyApi.js";
import { disableScheduler, enableScheduler, fetchSchedulerStatus } from "../services/schedulerApi.js";

// ─── helpers ────────────────────────────────────────────────────────────────
function getProfileCompletion(profile) {
  const extracted = profile?.extractedProfile || {};
  const checks = [
    extracted.fullName, extracted.email, extracted.targetRole,
    extracted.location, extracted.educationLevel,
    Array.isArray(extracted.skills) && extracted.skills.length,
    profile?.summary,
    profile?.rawResumeText || profile?.resumeMarkdown,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function scoreColor(n) {
  if (n >= 75) return { text: "#34D399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)" };
  if (n >= 50) return { text: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)" };
  return   { text: "#fb923c", bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.3)" };
}

function platformIcon(platform) {
  const p = (platform || "").toLowerCase();
  if (p.includes("linkedin"))   return "in";
  if (p.includes("naukri"))     return "N";
  if (p.includes("glassdoor"))  return "G";
  if (p.includes("indeed"))     return "I";
  return "J";
}

function platformColor(platform) {
  const p = (platform || "").toLowerCase();
  if (p.includes("linkedin"))  return "#0A66C2";
  if (p.includes("naukri"))    return "#FF7555";
  if (p.includes("glassdoor")) return "#0CAA41";
  if (p.includes("indeed"))    return "#003A9B";
  return "#22d3ee";
}

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ─── sub-components ──────────────────────────────────────────────────────────

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isErr = toast.type === "error";
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      padding: "12px 16px", borderRadius: 12,
      background: isErr ? "rgba(248,113,113,0.1)" : "rgba(52,211,153,0.1)",
      border: `1px solid ${isErr ? "rgba(248,113,113,0.3)" : "rgba(52,211,153,0.3)"}`,
      color: isErr ? "#f87171" : "#34D399",
      fontSize: 13, fontWeight: 600, marginBottom: 20,
    }}>
      <span>{isErr ? "⚠ " : "✓ "}{toast.message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent, proOnly, isPro }) {
  const locked = proOnly && !isPro;
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 16, padding: "20px 20px 16px", position: "relative", overflow: "hidden",
    }}>
      {/* accent line top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: locked ? "var(--border)" : accent }} />

      <div style={{
        width: 36, height: 36, borderRadius: 10, marginBottom: 14,
        background: locked ? "var(--bg-card2)" : `${accent}18`,
        border: `1px solid ${locked ? "var(--border)" : `${accent}35`}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16,
      }}>{icon}</div>

      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: "var(--t3)", marginBottom: 6, textTransform: "uppercase" }}>{label}</p>

      {locked ? (
        <div>
          <p style={{ fontSize: 22, fontWeight: 800, fontFamily: "Sora, sans-serif", color: "var(--t3)" }}>—</p>
          <Link to="/app/subscription" style={{
            fontSize: 11, fontWeight: 600, color: "#fbbf24", textDecoration: "none", marginTop: 6, display: "inline-block"
          }}>⚡ Pro only</Link>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 28, fontWeight: 800, fontFamily: "Sora, sans-serif", color: "var(--t1)", lineHeight: 1 }}>{value}</p>
          <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 6, lineHeight: 1.5 }}>{sub}</p>
        </>
      )}
    </div>
  );
}

function ProfileSummary({ profile, completion }) {
  const skills = (profile?.extractedProfile?.skills || []).slice(0, 8);
  const barColor = completion >= 80 ? "#34D399" : completion >= 50 ? "#fbbf24" : "#fb923c";

  return (
    <div style={{ background: "var(--bg-card2)", borderRadius: 14, padding: 16, marginTop: 16 }}>
      {/* Completion bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)" }}>Profile Completion</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: barColor }}>{completion}%</span>
      </div>
      <div style={{ height: 6, background: "var(--border)", borderRadius: 3, marginBottom: 14, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${completion}%`, background: barColor, borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        {[
          { label: "Target Role", val: profile?.extractedProfile?.targetRole },
          { label: "Location",    val: profile?.extractedProfile?.location },
          { label: "Experience",  val: profile?.extractedProfile?.experienceYears ? `${profile.extractedProfile.experienceYears} yrs` : null },
          { label: "Source",      val: profile?.lastSource || "Manual" },
        ].map(item => (
          <div key={item.label}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--t3)", letterSpacing: "0.05em", marginBottom: 2 }}>{item.label.toUpperCase()}</p>
            <p style={{ fontSize: 12, color: item.val ? "var(--t1)" : "var(--t3)", fontWeight: 500 }}>{item.val || "Not set"}</p>
          </div>
        ))}
      </div>

      {skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {skills.map(s => (
            <span key={s} style={{
              fontSize: 11, padding: "3px 9px", borderRadius: 20,
              background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)", color: "var(--cyan)"
            }}>{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function JobCard({ item, user, applyingJobId, onApply }) {
  const sc = scoreColor(item.matchScore);
  const plColor = platformColor(item.job.platform);
  const plIcon  = platformIcon(item.job.platform);
  const isPro   = user?.plan === "pro";
  const isApplying = applyingJobId === item.job.id;

  return (
    <article style={{
      background: "var(--bg-card2)", border: "1px solid var(--border)",
      borderRadius: 14, padding: 16,
      transition: "all 0.2s ease",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = sc.border; e.currentTarget.style.background = "var(--bg-card)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-card2)"; }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1, minWidth: 0 }}>
          {/* Platform dot */}
          <div style={{
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: `${plColor}20`, border: `1px solid ${plColor}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 800, color: plColor, fontFamily: "Sora, sans-serif"
          }}>{plIcon}</div>

          <div style={{ minWidth: 0 }}>
            <h4 style={{
              fontSize: 14, fontWeight: 700, fontFamily: "Sora, sans-serif",
              color: "var(--t1)", marginBottom: 2, lineHeight: 1.3,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>{item.job.title}</h4>
            <p style={{ fontSize: 12, color: "var(--t2)" }}>
              {item.job.company || "Unknown"}{item.job.location ? ` · ${item.job.location}` : ""}
            </p>
          </div>
        </div>

        {/* Score badge */}
        <div style={{
          flexShrink: 0, textAlign: "center",
          background: sc.bg, border: `1px solid ${sc.border}`,
          borderRadius: 10, padding: "6px 10px", minWidth: 52
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: sc.text, fontFamily: "Sora, sans-serif", lineHeight: 1 }}>{item.matchScore}%</div>
          <div style={{ fontSize: 9, color: sc.text, fontWeight: 600, opacity: 0.8, marginTop: 1 }}>MATCH</div>
        </div>
      </div>

      {/* Match bar */}
      <div style={{ height: 3, background: "var(--border)", borderRadius: 2, marginBottom: 12, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${item.matchScore}%`, background: sc.text, borderRadius: 2 }} />
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{
          fontSize: 10, padding: "2px 8px", borderRadius: 6,
          background: `${plColor}15`, color: plColor, fontWeight: 600
        }}>{(item.job.platform || "Job").charAt(0).toUpperCase() + (item.job.platform || "job").slice(1)}</span>
        {timeAgo(item.job.datePosted) && (
          <span style={{ fontSize: 10, color: "var(--t3)" }}>{timeAgo(item.job.datePosted)}</span>
        )}
        {item.highlights?.map(h => (
          <span key={h} style={{
            fontSize: 10, padding: "2px 7px", borderRadius: 6,
            background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--t2)"
          }}>{h}</span>
        ))}
      </div>

      {/* Skills */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: 10, padding: "8px 10px" }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: "#34D399", letterSpacing: "0.06em", marginBottom: 6 }}>✓ MATCHED</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {item.matchedSkills?.length ? item.matchedSkills.slice(0, 4).map(s => (
              <span key={s} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: "rgba(52,211,153,0.1)", color: "#34D399" }}>{s}</span>
            )) : <span style={{ fontSize: 11, color: "var(--t3)" }}>—</span>}
          </div>
        </div>
        <div style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 10, padding: "8px 10px" }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: "#fbbf24", letterSpacing: "0.06em", marginBottom: 6 }}>⚠ MISSING</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {item.missingSkills?.length ? item.missingSkills.slice(0, 4).map(s => (
              <span key={s} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: "rgba(251,191,36,0.1)", color: "#fbbf24" }}>{s}</span>
            )) : <span style={{ fontSize: 11, color: "var(--t3)" }}>None</span>}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        {item.job.applyUrl && (
          <a href={item.job.applyUrl} target="_blank" rel="noreferrer" style={{
            flex: 1, textAlign: "center", textDecoration: "none",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            color: "var(--t2)", borderRadius: 9, padding: "8px 12px",
            fontSize: 12, fontWeight: 600, transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--cyan)"; e.currentTarget.style.color = "var(--cyan)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--t2)"; }}>
            Open →
          </a>
        )}
        <button
          onClick={() => onApply(item.job.id)}
          disabled={!isPro || isApplying}
          style={{
            flex: 1, borderRadius: 9, padding: "8px 12px",
            fontSize: 12, fontWeight: 600, cursor: isPro ? "pointer" : "not-allowed",
            background: isPro ? "linear-gradient(135deg, #06b6d4, #0891b2)" : "var(--bg-card)",
            border: isPro ? "none" : "1px solid var(--border)",
            color: isPro ? "#fff" : "var(--t3)",
            opacity: isApplying ? 0.6 : 1, transition: "all 0.15s",
          }}>
          {isApplying ? "Saving..." : isPro ? "Save App" : "🔒 Pro"}
        </button>
      </div>
    </article>
  );
}

function AutomationPanel({ user, queueStatus, schedulerStatus, togglingAutoApply, togglingScheduler, onToggleAutoApply, onToggleScheduler }) {
  const isPro = user?.plan === "pro";
  const autoOn = queueStatus?.autoApplyEnabled;
  const schedOn = schedulerStatus?.automaticWorkEnabled;

  if (!isPro) {
    return (
      <div style={{ marginTop: 16 }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(251,191,36,0.06), rgba(251,146,60,0.06))",
          border: "1px solid rgba(251,191,36,0.2)", borderRadius: 14, padding: 20, textAlign: "center"
        }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>⚡</div>
          <p style={{ fontSize: 14, fontWeight: 700, fontFamily: "Sora, sans-serif", color: "var(--t1)", marginBottom: 6 }}>Pro Automation</p>
          <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6, marginBottom: 16 }}>
            Auto-queue top matches, generate cover letters, and track every application.
          </p>
          <Link to="/app/subscription" style={{
            display: "inline-block", textDecoration: "none",
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            color: "#fff", borderRadius: 9, padding: "9px 20px",
            fontSize: 13, fontWeight: 700, fontFamily: "Sora, sans-serif"
          }}>Upgrade to Pro →</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Auto-apply toggle */}
      <div style={{
        background: autoOn ? "rgba(52,211,153,0.06)" : "var(--bg-card2)",
        border: `1px solid ${autoOn ? "rgba(52,211,153,0.25)" : "var(--border)"}`,
        borderRadius: 14, padding: 16
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)", fontFamily: "Sora, sans-serif" }}>Auto-Apply Queue</p>
            <p style={{ fontSize: 11, color: "var(--t2)", marginTop: 2 }}>Queues top matched jobs automatically</p>
          </div>
          <button onClick={onToggleAutoApply} disabled={togglingAutoApply} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
            cursor: togglingAutoApply ? "not-allowed" : "pointer",
            background: autoOn ? "#34D399" : "var(--bg-card)",
            border: `1px solid ${autoOn ? "#34D399" : "var(--border2)"}`,
            color: autoOn ? "#fff" : "var(--t2)",
            transition: "all 0.2s", opacity: togglingAutoApply ? 0.6 : 1,
          }}>{togglingAutoApply ? "..." : autoOn ? "ON" : "OFF"}</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "Queue Size", val: `${queueStatus?.queuedCount ?? 0} jobs` },
            { label: "Daily Limit", val: `${queueStatus?.autoApplyLimit ?? 10} jobs` },
          ].map(item => (
            <div key={item.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 9, padding: "8px 12px" }}>
              <p style={{ fontSize: 9, color: "var(--t3)", fontWeight: 600, letterSpacing: "0.05em" }}>{item.label.toUpperCase()}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", marginTop: 2 }}>{item.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduler toggle */}
      <div style={{
        background: schedOn ? "rgba(34,211,238,0.05)" : "var(--bg-card2)",
        border: `1px solid ${schedOn ? "rgba(34,211,238,0.2)" : "var(--border)"}`,
        borderRadius: 14, padding: 14,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12
      }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--t1)" }}>Daily Auto Work</p>
          <p style={{ fontSize: 10, color: "var(--t2)", marginTop: 2, lineHeight: 1.5 }}>Job fetch · Match · Digest</p>
        </div>
        <button onClick={onToggleScheduler} disabled={togglingScheduler} style={{
          padding: "7px 14px", borderRadius: 9, fontSize: 11, fontWeight: 700,
          cursor: togglingScheduler ? "not-allowed" : "pointer",
          background: schedOn ? "rgba(248,113,113,0.15)" : "rgba(52,211,153,0.15)",
          border: `1px solid ${schedOn ? "rgba(248,113,113,0.3)" : "rgba(52,211,153,0.3)"}`,
          color: schedOn ? "#f87171" : "#34D399",
          opacity: togglingScheduler ? 0.6 : 1,
        }}>{togglingScheduler ? "..." : schedOn ? "Stop" : "Start"}</button>
      </div>
    </div>
  );
}

function AppSnapshot({ applicationSummary, isPro }) {
  const stats = [
    { label: "Queued",    val: applicationSummary?.queued    ?? 0, color: "#22d3ee" },
    { label: "Applied",   val: applicationSummary?.applied   ?? 0, color: "#818cf8" },
    { label: "Viewed",    val: applicationSummary?.viewed    ?? 0, color: "#fbbf24" },
    { label: "Responded", val: applicationSummary?.responded ?? 0, color: "#34D399" },
  ];

  if (!isPro) {
    return (
      <div style={{
        background: "var(--bg-card2)", border: "1px solid var(--border)",
        borderRadius: 12, padding: "14px 16px",
        fontSize: 12, color: "var(--t2)", lineHeight: 1.6
      }}>
        Application tracker is available on Pro.
        <Link to="/app/subscription" style={{ display: "block", marginTop: 8, fontSize: 12, fontWeight: 700, color: "#fbbf24", textDecoration: "none" }}>
          Upgrade →
        </Link>
      </div>
    );
  }

  if (!applicationSummary) {
    return (
      <div style={{ fontSize: 12, color: "var(--t2)", padding: "12px 0" }}>
        No applications tracked yet. Save a matched job to start.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 2 }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: `${s.color}0D`, border: `1px solid ${s.color}25`,
          borderRadius: 12, padding: "12px 14px"
        }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: s.color, letterSpacing: "0.06em", marginBottom: 4 }}>{s.label.toUpperCase()}</p>
          <p style={{ fontSize: 22, fontWeight: 800, fontFamily: "Sora, sans-serif", color: "var(--t1)" }}>{s.val}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [loading,          setLoading]          = useState(true);
  const [refreshing,       setRefreshing]       = useState(false);
  const [applyingJobId,    setApplyingJobId]    = useState("");
  const [togglingAutoApply, setTogglingAutoApply] = useState(false);
  const [togglingScheduler, setTogglingScheduler] = useState(false);
  const [toast,            setToast]            = useState(null);
  const [error,            setError]            = useState("");
  const [user,             setUser]             = useState(null);
  const [profile,          setProfile]          = useState(null);
  const [matches,          setMatches]          = useState([]);
  const [matchTotal,       setMatchTotal]       = useState(0);
  const [hasProfile,       setHasProfile]       = useState(false);
  const [queueStatus,      setQueueStatus]      = useState(null);
  const [applicationSummary, setApplicationSummary] = useState(null);
  const [schedulerStatus,  setSchedulerStatus]  = useState(null);

  async function loadDashboard(showLoader = true) {
    if (showLoader) setLoading(true);
    setError("");
    try {
      const userData = await fetchCurrentUser();
      setUser(userData.user);
      const requests = [fetchProfile(), fetchMatchedJobs()];
      if (userData.user?.plan === "pro") {
        requests.push(fetchQueueStatus(), fetchApplications(), fetchSchedulerStatus());
      }
      const results = await Promise.allSettled(requests);
      const [profileResult, matchesResult, queueResult, applicationsResult, schedulerResult] = results;
      if (profileResult?.status === "fulfilled") setProfile(profileResult.value.profile);
      if (matchesResult?.status === "fulfilled") {
        setMatches(matchesResult.value.items || []);
        setMatchTotal(matchesResult.value.total || 0);
        setHasProfile(Boolean(matchesResult.value.hasProfile));
      } else { setMatches([]); setMatchTotal(0); setHasProfile(false); }
      if (queueResult?.status === "fulfilled")        setQueueStatus(queueResult.value);
      if (applicationsResult?.status === "fulfilled") setApplicationSummary(applicationsResult.value.summary);
      if (schedulerResult?.status === "fulfilled")    setSchedulerStatus(schedulerResult.value);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load dashboard data.");
    } finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { loadDashboard(); }, []);

  const completion = useMemo(() => getProfileCompletion(profile), [profile]);
  const isPro = user?.plan === "pro";

  async function handleRunMatches() {
    setRefreshing(true); setToast(null);
    try {
      const result = await runMatchCalculation();
      await loadDashboard(false);
      setToast({ type: "success", message: `Recomputed ${result.matchesComputed || 0} matches.` });
    } catch (err) {
      setRefreshing(false);
      setToast({ type: "error", message: err?.response?.data?.message || "Unable to run job matching right now." });
    }
  }

  async function handleToggleAutoApply() {
    if (!user || user.plan !== "pro") return;
    setTogglingAutoApply(true); setToast(null);
    try {
      const result = await setAutoApplyEnabled(!queueStatus?.autoApplyEnabled);
      setQueueStatus(prev => ({ ...(prev || {}), ...result }));
      setUser(prev => (prev ? { ...prev, autoApplyEnabled: result.autoApplyEnabled } : prev));
      setToast({ type: "success", message: result.autoApplyEnabled ? `Auto-apply enabled. ${result.createdCount || 0} jobs queued.` : "Auto-apply disabled." });
    } catch (err) {
      setToast({ type: "error", message: err?.response?.data?.message || "Unable to update auto-apply." });
    } finally { setTogglingAutoApply(false); }
  }

  async function handleToggleScheduler() {
    if (!user || user.plan !== "pro") return;
    setTogglingScheduler(true); setToast(null);
    try {
      const nextEnabled = !schedulerStatus?.automaticWorkEnabled;
      const result = nextEnabled ? await enableScheduler() : await disableScheduler();
      setSchedulerStatus(result);
      setToast({ type: "success", message: nextEnabled ? "Daily automation enabled." : "Daily automation stopped." });
    } catch (err) {
      setToast({ type: "error", message: err?.response?.data?.message || "Unable to update automatic work." });
    } finally { setTogglingScheduler(false); }
  }

  async function handleManualApply(jobId) {
    setApplyingJobId(jobId); setToast(null);
    try {
      const result = await manualApply(jobId);
      await loadDashboard(false);
      setToast({ type: "success", message: `Application saved for ${result.application?.job?.title || "selected job"}.` });
    } catch (err) {
      setToast({ type: "error", message: err?.response?.data?.message || "Unable to create application." });
    } finally { setApplyingJobId(""); }
  }

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "4px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {[1,2,3,4].map(i => <div key={i} className="shimmer" style={{ height: 100, borderRadius: 16 }} />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 0.65fr", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="shimmer" style={{ height: 180, borderRadius: 16 }} />
            <div className="shimmer" style={{ height: 300, borderRadius: 16 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="shimmer" style={{ height: 200, borderRadius: 16 }} />
            <div className="shimmer" style={{ height: 160, borderRadius: 16 }} />
          </div>
        </div>
      </div>
    );
  }

  // ── Render ──
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      <Toast toast={toast} onClose={() => setToast(null)} />

      {error && (
        <div style={{
          background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
          borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#f87171"
        }}>{error}</div>
      )}

      {/* ── Stat cards row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard icon="👤" label="Profile Ready" value={`${completion}%`}
          sub="Resume · skills · role" accent="#22d3ee" isPro={isPro} />
        <StatCard icon="🎯" label="Matched Jobs" value={matchTotal}
          sub={isPro ? "All saved matches" : "Top 10 on free"} accent="#818cf8" isPro={isPro} />
        <StatCard icon="📬" label="In Queue" value={queueStatus?.queuedCount ?? 0}
          sub="Waiting to apply" accent="#fbbf24" proOnly isPro={isPro} />
        <StatCard icon="✅" label="Applied" value={applicationSummary?.applied ?? 0}
          sub="Tracked applications" accent="#34D399" proOnly isPro={isPro} />
      </div>

      {/* ── Main 2-col grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 0.65fr", gap: 20, alignItems: "start" }}>

        {/* ── LEFT column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Control panel card */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--cyan)", marginBottom: 6 }}>CONTROL CENTER</p>
                <h3 style={{ fontSize: 18, fontWeight: 800, fontFamily: "Sora, sans-serif", color: "var(--t1)", marginBottom: 6 }}>
                  Your Job-Matching Workspace
                </h3>
                <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, maxWidth: 500 }}>
                  Save your profile, search jobs, then recompute matches to rank opportunities against your resume.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={handleRunMatches} disabled={refreshing || !hasProfile} style={{
                  padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                  cursor: (refreshing || !hasProfile) ? "not-allowed" : "pointer",
                  background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                  border: "none", color: "#fff", opacity: (refreshing || !hasProfile) ? 0.55 : 1,
                  fontFamily: "Sora, sans-serif", transition: "all 0.2s"
                }}>
                  {refreshing ? "Refreshing..." : "⟳ Recompute Matches"}
                </button>
                <Link to="/app/job-search" style={{
                  padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: "var(--bg-card2)", border: "1px solid var(--border)",
                  color: "var(--t2)", textDecoration: "none", display: "inline-block",
                  transition: "all 0.2s"
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--cyan)"; e.currentTarget.style.color = "var(--cyan)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--t2)"; }}>
                  Search Jobs →
                </Link>
              </div>
            </div>

            {/* No profile warning */}
            {!hasProfile && (
              <div style={{
                marginTop: 16, background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.25)",
                borderRadius: 12, padding: "14px 16px"
              }}>
                <p style={{ fontSize: 13, color: "#fbbf24", fontWeight: 600, marginBottom: 4 }}>⚠ Profile needed</p>
                <p style={{ fontSize: 12, color: "var(--t2)", marginBottom: 8, lineHeight: 1.6 }}>
                  Add your resume or fill your candidate profile so we can match you to relevant jobs.
                </p>
                <Link to="/app/profile" style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", textDecoration: "none" }}>
                  Set Up Profile →
                </Link>
              </div>
            )}

            {/* Profile summary inline */}
            {profile && <ProfileSummary profile={profile} completion={completion} />}
          </div>

          {/* Matched Jobs */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: "Sora, sans-serif", color: "var(--t1)", marginBottom: 2 }}>
                  Top Matches
                </h3>
                <p style={{ fontSize: 12, color: "var(--t2)" }}>
                  Ranked by AI match score against your profile
                  {!isPro && matchTotal > matches.length ? ` · ${matchTotal - matches.length} more hidden` : ""}
                </p>
              </div>
              {!isPro && matchTotal > matches.length && (
                <Link to="/app/subscription" style={{
                  fontSize: 11, fontWeight: 700, color: "#fbbf24", textDecoration: "none",
                  background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)",
                  borderRadius: 8, padding: "5px 10px"
                }}>⚡ Unlock all</Link>
              )}
            </div>

            {matches.length === 0 ? (
              <div style={{
                border: "1px dashed var(--border2)", borderRadius: 14,
                padding: "32px 24px", textAlign: "center"
              }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)", marginBottom: 6 }}>No matches yet</p>
                <p style={{ fontSize: 12, color: "var(--t2)", marginBottom: 16, lineHeight: 1.6 }}>
                  Run the Job Scraper to save live jobs, then click Recompute Matches.
                </p>
                <Link to="/app/job-search" style={{
                  display: "inline-block", textDecoration: "none",
                  background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                  color: "#fff", borderRadius: 9, padding: "9px 20px",
                  fontSize: 13, fontWeight: 700
                }}>Search Jobs →</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {matches.map(item => (
                  <JobCard
                    key={item.job.id}
                    item={item}
                    user={user}
                    applyingJobId={applyingJobId}
                    onApply={handleManualApply}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Automation */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, fontFamily: "Sora, sans-serif" }}>Automation</h3>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 6,
                background: isPro ? "rgba(34,211,238,0.1)" : "rgba(251,191,36,0.1)",
                border: `1px solid ${isPro ? "rgba(34,211,238,0.25)" : "rgba(251,191,36,0.25)"}`,
                color: isPro ? "var(--cyan)" : "#fbbf24"
              }}>{isPro ? "PRO" : "FREE"}</span>
            </div>
            <AutomationPanel
              user={user}
              queueStatus={queueStatus}
              schedulerStatus={schedulerStatus}
              togglingAutoApply={togglingAutoApply}
              togglingScheduler={togglingScheduler}
              onToggleAutoApply={handleToggleAutoApply}
              onToggleScheduler={handleToggleScheduler}
            />
          </div>

          {/* Applications snapshot */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, fontFamily: "Sora, sans-serif" }}>Applications</h3>
              <Link to="/app/applications" style={{
                fontSize: 11, fontWeight: 600, color: "var(--cyan)", textDecoration: "none"
              }}>View all →</Link>
            </div>
            <AppSnapshot applicationSummary={applicationSummary} isPro={isPro} />
          </div>

          {/* Quick links */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, fontFamily: "Sora, sans-serif", marginBottom: 12 }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { to: "/app/improve-resume", label: "✨ Improve Resume",   pro: true  },
                { to: "/app/ats-score",      label: "📊 Check ATS Score",  pro: true  },
                { to: "/app/tailor-resume",  label: "🎯 Tailor Resume",    pro: true  },
                { to: "/app/cover-letter",   label: "📝 Cover Letter",     pro: true  },
                { to: "/app/profile",        label: "👤 Edit Profile",     pro: false },
              ].map(item => (
                <Link key={item.to} to={item.to} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", borderRadius: 10, textDecoration: "none",
                  background: "var(--bg-card2)", border: "1px solid var(--border)",
                  fontSize: 12, fontWeight: 600, color: "var(--t1)",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--cyan)"; e.currentTarget.style.color = "var(--cyan)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--t1)"; }}>
                  {item.label}
                  {item.pro && !isPro && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#fbbf24", background: "rgba(251,191,36,0.1)", padding: "2px 6px", borderRadius: 5 }}>PRO</span>
                  )}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
