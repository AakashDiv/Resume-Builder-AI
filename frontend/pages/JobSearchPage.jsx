import { useMemo, useState } from "react";
import { exportJobsAsCsv, getDownloadUrl, normalizeJobRow, runScraper } from "../services/jobScraperApi.js";

// ── Constants (unchanged) ──────────────────────────────────────────────────
const PLATFORM_OPTIONS = ["LinkedIn", "Indeed", "Naukri", "Foundit", "Glassdoor"];
const TIME_OPTIONS     = ["Last 24 Hours", "Last 3 Days", "Last 5 Days"];
const PAGE_SIZE        = 12;

const initialFilters = {
  role: "", location: "",
  platforms: ["LinkedIn"],
  timeFilter: "Last 5 Days"
};

const columns = [
  ["Platform",    "platform"],
  ["Job Title",   "title"],
  ["Company",     "company"],
  ["Location",    "location"],
  ["Source",      "source"],
  ["Date Posted", "posted_at"],
  ["View Job",    "url"],
];

// ── Platform meta ──────────────────────────────────────────────────────────
const PLATFORM_META = {
  LinkedIn:  { color: "#0A66C2", icon: "in", desc: "Top professional network" },
  Indeed:    { color: "#003A9B", icon: "In", desc: "Largest job board" },
  Naukri:    { color: "#FF7555", icon: "N",  desc: "India's #1 job site" },
  Foundit:   { color: "#E84393", icon: "F",  desc: "Monster India rebranded" },
  Glassdoor: { color: "#0CAA41", icon: "G",  desc: "Jobs + company reviews" },
};

// ── helpers ────────────────────────────────────────────────────────────────
function platformColor(p) {
  return PLATFORM_META[p]?.color || PLATFORM_META[(p || "").charAt(0).toUpperCase() + (p || "").slice(1)]?.color || "#22d3ee";
}
function platformIcon(p) {
  const key = Object.keys(PLATFORM_META).find(k => k.toLowerCase() === (p || "").toLowerCase());
  return PLATFORM_META[key]?.icon || (p || "J").charAt(0).toUpperCase();
}
function timeAgo(str) {
  if (!str) return null;
  const d = Math.floor((Date.now() - new Date(str)) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30)  return `${d}d ago`;
  return new Date(str).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ── sub-components ─────────────────────────────────────────────────────────

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const err = toast.type === "error";
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      padding: "12px 16px", borderRadius: 12, marginBottom: 16,
      background: err ? "rgba(248,113,113,0.1)" : "rgba(52,211,153,0.1)",
      border: `1px solid ${err ? "rgba(248,113,113,0.3)" : "rgba(52,211,153,0.3)"}`,
      color: err ? "#f87171" : "#34D399", fontSize: 13, fontWeight: 600,
    }}>
      <span>{err ? "⚠ " : "✓ "}{toast.message}</span>
      <button onClick={onClose} style={{ background:"none", border:"none", color:"inherit", cursor:"pointer", fontSize:18, lineHeight:1 }}>×</button>
    </div>
  );
}

function PlatformToggle({ platform, selected, onToggle }) {
  const meta  = PLATFORM_META[platform] || {};
  const on    = selected;
  return (
    <button
      onClick={() => onToggle(platform)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", borderRadius: 12, cursor: "pointer",
        background: on ? `${meta.color}18` : "var(--bg-card2)",
        border: `1.5px solid ${on ? meta.color : "var(--border)"}`,
        transition: "all 0.15s", textAlign: "left", width: "100%",
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: on ? meta.color : "var(--bg-card)",
        border: `1px solid ${on ? meta.color : "var(--border)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 800,
        color: on ? "#fff" : "var(--t3)", fontFamily: "Sora, sans-serif",
      }}>{meta.icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: on ? "var(--t1)" : "var(--t2)", fontFamily: "Sora, sans-serif", lineHeight: 1.2 }}>{platform}</div>
        <div style={{ fontSize: 10, color: on ? meta.color : "var(--t3)", marginTop: 1 }}>{meta.desc}</div>
      </div>
      <div style={{
        marginLeft: "auto", width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
        background: on ? meta.color : "var(--bg-card)",
        border: `2px solid ${on ? meta.color : "var(--border2)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, color: "#fff",
      }}>{on ? "✓" : ""}</div>
    </button>
  );
}

function LoadingState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px", gap: 16 }}>
      {/* Spinner */}
      <div style={{ position: "relative", width: 56, height: 56 }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "3px solid var(--border)", borderTopColor: "var(--cyan)",
          animation: "spin 0.9s linear infinite",
        }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)", fontFamily: "Sora, sans-serif", marginBottom: 6 }}>Scraping live jobs…</p>
        <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6, maxWidth: 300 }}>
          JSearch API is fast (seconds). If Python fallback runs, it may take 1–2 minutes. Hang tight!
        </p>
      </div>
      {/* Skeleton cards */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        {[1,2,3].map(i => (
          <div key={i} className="shimmer" style={{ height: 80, borderRadius: 14, opacity: 0.6 - i * 0.15 }} />
        ))}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function EmptyState({ hasSearched }) {
  if (!hasSearched) return (
    <div style={{ padding: "56px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔎</div>
      <p style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)", fontFamily: "Sora, sans-serif", marginBottom: 8 }}>
        Ready to find your next role?
      </p>
      <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7, maxWidth: 340, margin: "0 auto" }}>
        Enter a job title and location, choose your platforms, and hit Search. We'll pull live listings from across the web.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
        {["LinkedIn", "Naukri", "Glassdoor", "Indeed"].map(p => (
          <div key={p} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: `${PLATFORM_META[p]?.color}15`, border: `1px solid ${PLATFORM_META[p]?.color}30`,
            borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: PLATFORM_META[p]?.color
          }}>
            <span>{PLATFORM_META[p]?.icon}</span>{p}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>😕</div>
      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)", marginBottom: 6 }}>No jobs found</p>
      <p style={{ fontSize: 13, color: "var(--t2)" }}>Try a different role, location, or add more platforms.</p>
    </div>
  );
}

function SummaryStats({ summary, count }) {
  if (!summary) return null;
  const stats = [
    { label: "Jobs Found",  val: count,                       icon: "🔍", color: "#22d3ee" },
    { label: "Saved to DB", val: summary.savedJobsCount ?? 0, icon: "💾", color: "#818cf8" },
    { label: "Matches Updated", val: summary.matchedJobsCount ?? 0, icon: "🎯", color: "#34D399" },
    { label: "Auto-Queued", val: summary.autoQueuedCount ?? 0, icon: "⚡", color: "#fbbf24" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: `${s.color}0D`, border: `1px solid ${s.color}25`,
          borderRadius: 12, padding: "12px 14px", textAlign: "center"
        }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--t1)", fontFamily: "Sora, sans-serif" }}>{s.val}</div>
          <div style={{ fontSize: 10, color: "var(--t2)", marginTop: 2, fontWeight: 500 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function JobCard({ job, index }) {
  const plColor = platformColor(job.platform);
  const plIcon  = platformIcon(job.platform);
  const date    = timeAgo(job.posted_at) || job.posted_at || null;

  return (
    <div style={{
      background: "var(--bg-card2)", border: "1px solid var(--border)",
      borderRadius: 14, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 14,
      transition: "all 0.18s ease",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.borderColor = `${plColor}50`; }}
      onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-card2)"; e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      {/* Platform icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: `${plColor}18`, border: `1px solid ${plColor}35`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 800, color: plColor, fontFamily: "Sora, sans-serif"
      }}>{plIcon}</div>

      {/* Main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 14, fontWeight: 700, color: "var(--t1)", fontFamily: "Sora, sans-serif",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280
          }}>{job.title || "Untitled Role"}</span>
          {date && (
            <span style={{ fontSize: 10, color: "var(--t3)", flexShrink: 0 }}>{date}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {job.company && <span style={{ fontSize: 12, color: "var(--t2)", fontWeight: 500 }}>{job.company}</span>}
          {job.company && job.location && <span style={{ color: "var(--border2)", fontSize: 10 }}>·</span>}
          {job.location && <span style={{ fontSize: 12, color: "var(--t3)" }}>📍 {job.location}</span>}
        </div>
      </div>

      {/* Platform + source badges */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
        <span style={{
          fontSize: 10, padding: "3px 8px", borderRadius: 6, fontWeight: 600,
          background: `${plColor}15`, color: plColor
        }}>{job.platform || "—"}</span>
        {job.source && job.source !== job.platform && (
          <span style={{ fontSize: 9, color: "var(--t3)" }}>{job.source}</span>
        )}
      </div>

      {/* Apply button */}
      <div style={{ flexShrink: 0 }}>
        {job.url ? (
          <a href={job.url} target="_blank" rel="noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "7px 14px", borderRadius: 9, fontSize: 12, fontWeight: 700,
            textDecoration: "none", background: "var(--bg-card)",
            border: "1px solid var(--border)", color: "var(--t2)",
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = plColor; e.currentTarget.style.color = plColor; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--t2)"; }}
          >Apply →</a>
        ) : (
          <span style={{ fontSize: 12, color: "var(--t3)", padding: "7px 14px" }}>—</span>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function JobSearchPage() {
  const [filters, setFilters]           = useState(initialFilters);
  const [jobs, setJobs]                 = useState([]);
  const [downloadPath, setDownloadPath] = useState("");
  const [searchSummary, setSearchSummary] = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState(false);
  const [hasSearched, setHasSearched]   = useState(false);
  const [toast, setToast]               = useState(null);
  const [sortBy, setSortBy]             = useState("platform");
  const [direction, setDirection]       = useState("asc");
  const [page, setPage]                 = useState(1);
  const [view, setView]                 = useState("cards"); // "cards" | "table"

  // ── sorting + pagination (unchanged logic) ─────────────────────────────
  const sortedRows = useMemo(() => {
    const list = [...jobs];
    list.sort((a, b) => {
      const av = String(a[sortBy] ?? "").toLowerCase();
      const bv = String(b[sortBy] ?? "").toLowerCase();
      if (av < bv) return direction === "asc" ? -1 : 1;
      if (av > bv) return direction === "asc" ?  1 : -1;
      return 0;
    });
    return list;
  }, [jobs, sortBy, direction]);

  const totalPages  = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const start       = (safePage - 1) * PAGE_SIZE;
  const visibleRows = sortedRows.slice(start, start + PAGE_SIZE);

  function onSort(key) {
    setPage(1);
    if (sortBy === key) { setDirection(prev => prev === "asc" ? "desc" : "asc"); return; }
    setSortBy(key); setDirection("asc");
  }

  function togglePlatform(platform) {
    setFilters(prev => {
      const has       = prev.platforms.includes(platform);
      const platforms = has ? prev.platforms.filter(p => p !== platform) : [...prev.platforms, platform];
      return { ...prev, platforms };
    });
  }

  // ── handlers (unchanged logic) ─────────────────────────────────────────
  async function handleSearch() {
    if (!filters.platforms.length || loading) return;
    setLoading(true); setError(""); setSuccess(false); setHasSearched(true);
    try {
      const data       = await runScraper(filters);
      const normalized = Array.isArray(data.jobs) ? data.jobs.map(normalizeJobRow) : [];
      setJobs(normalized);
      setDownloadPath(data.downloadUrl || "");
      setSearchSummary({
        savedJobsCount:   data.savedJobsCount   || 0,
        matchedJobsCount: data.matchedJobsCount || 0,
        autoQueuedCount:  data.autoQueuedCount  || 0,
      });
      setSuccess(true); setPage(1);
      setToast({ type: "success", message: `Found ${normalized.length} jobs across ${filters.platforms.length} platform(s).` });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to run scraper";
      setError(msg); setToast({ type: "error", message: msg });
    } finally { setLoading(false); }
  }

  function clearFilters() {
    setFilters(initialFilters); setJobs([]); setDownloadPath(""); setSearchSummary(null);
    setError(""); setSuccess(false); setPage(1); setHasSearched(false);
  }

  // ── render ────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>

        {/* ══ LEFT — Search Panel ══════════════════════════════════════ */}
        <aside style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 16, padding: 20, position: "sticky", top: 80,
        }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--cyan)", marginBottom: 6 }}>JOB SCRAPER</p>
            <h3 style={{ fontSize: 17, fontWeight: 800, fontFamily: "Sora, sans-serif", color: "var(--t1)", marginBottom: 4 }}>
              Smart Job Search
            </h3>
            <p style={{ fontSize: 11, color: "var(--t3)", lineHeight: 1.5 }}>
              Pulls live listings from JSearch API + Python scraper fallback
            </p>
          </div>

          {/* Role input */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--t2)", letterSpacing: "0.05em", marginBottom: 6 }}>
              ROLE / JOB TITLE
            </label>
            <input
              type="text"
              value={filters.role}
              onChange={e => setFilters(prev => ({ ...prev, role: e.target.value }))}
              placeholder="e.g. Backend Developer"
              className="input-dark"
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>

          {/* Location input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--t2)", letterSpacing: "0.05em", marginBottom: 6 }}>
              LOCATION
            </label>
            <input
              type="text"
              value={filters.location}
              onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g. Bangalore, India"
              className="input-dark"
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>

          {/* Platform toggles */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", letterSpacing: "0.05em" }}>PLATFORMS</label>
              <span style={{ fontSize: 10, color: filters.platforms.length ? "var(--cyan)" : "var(--t3)" }}>
                {filters.platforms.length} selected
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {PLATFORM_OPTIONS.map(platform => (
                <PlatformToggle
                  key={platform}
                  platform={platform}
                  selected={filters.platforms.includes(platform)}
                  onToggle={togglePlatform}
                />
              ))}
            </div>
            {filters.platforms.length === 0 && (
              <p style={{ fontSize: 11, color: "#f87171", marginTop: 6 }}>Select at least one platform</p>
            )}
          </div>

          {/* Time filter */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--t2)", letterSpacing: "0.05em", marginBottom: 6 }}>
              TIME FILTER
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              {TIME_OPTIONS.map(opt => (
                <button key={opt} onClick={() => setFilters(prev => ({ ...prev, timeFilter: opt }))} style={{
                  flex: 1, padding: "7px 4px", borderRadius: 9, fontSize: 10, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.15s", textAlign: "center",
                  background: filters.timeFilter === opt ? "rgba(34,211,238,0.12)" : "var(--bg-card2)",
                  border: `1px solid ${filters.timeFilter === opt ? "rgba(34,211,238,0.35)" : "var(--border)"}`,
                  color: filters.timeFilter === opt ? "var(--cyan)" : "var(--t3)",
                }}>
                  {opt.replace("Last ", "").replace(" Hours", "h").replace(" Days", "d")}
                </button>
              ))}
            </div>
          </div>

          {/* CTA buttons */}
          <button
            onClick={handleSearch}
            disabled={loading || !filters.platforms.length}
            style={{
              width: "100%", padding: "12px", borderRadius: 11, fontSize: 14,
              fontWeight: 800, fontFamily: "Sora, sans-serif", cursor: (loading || !filters.platforms.length) ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg, #06b6d4, #0891b2)",
              border: "none", color: "#fff",
              opacity: (loading || !filters.platforms.length) ? 0.55 : 1,
              marginBottom: 8, transition: "all 0.2s",
              boxShadow: (!loading && filters.platforms.length) ? "0 4px 20px rgba(34,211,238,0.25)" : "none",
            }}
          >
            {loading ? "Searching…" : "🔍 Search Jobs"}
          </button>
          <button
            onClick={clearFilters}
            disabled={loading}
            style={{
              width: "100%", padding: "9px", borderRadius: 11, fontSize: 13, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              background: "var(--bg-card2)", border: "1px solid var(--border)",
              color: "var(--t2)", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#f87171"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--t2)"; }}
          >
            ✕ Clear
          </button>
        </aside>

        {/* ══ RIGHT — Results ══════════════════════════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Results header bar */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 16, padding: "14px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
          }}>
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 800, fontFamily: "Sora, sans-serif", color: "var(--t1)", marginBottom: 2 }}>
                {success ? `${jobs.length} Jobs Found` : "Job Results"}
              </h4>
              <p style={{ fontSize: 11, color: "var(--t3)" }}>
                {success ? `Scraped from ${filters.platforms.join(", ")}` : "Run a search to load jobs"}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* View toggle */}
              <div style={{ display: "flex", background: "var(--bg-card2)", border: "1px solid var(--border)", borderRadius: 9, overflow: "hidden" }}>
                {[["cards","⊞"], ["table","☰"]].map(([v, icon]) => (
                  <button key={v} onClick={() => setView(v)} style={{
                    padding: "6px 12px", fontSize: 13, cursor: "pointer",
                    background: view === v ? "rgba(34,211,238,0.12)" : "transparent",
                    border: "none", color: view === v ? "var(--cyan)" : "var(--t3)",
                    transition: "all 0.15s",
                  }}>{icon}</button>
                ))}
              </div>

              {/* Export buttons */}
              <button
                onClick={() => exportJobsAsCsv(jobs)}
                disabled={!jobs.length}
                style={{
                  padding: "7px 12px", borderRadius: 9, fontSize: 12, fontWeight: 600,
                  cursor: jobs.length ? "pointer" : "not-allowed",
                  background: "var(--bg-card2)", border: "1px solid var(--border)",
                  color: jobs.length ? "var(--t2)" : "var(--t3)", transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (jobs.length) { e.currentTarget.style.borderColor = "var(--cyan)"; e.currentTarget.style.color = "var(--cyan)"; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = jobs.length ? "var(--t2)" : "var(--t3)"; }}
              >
                CSV ↓
              </button>
              <a
                href={downloadPath ? getDownloadUrl(downloadPath) : "#"}
                style={{
                  padding: "7px 12px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                  textDecoration: "none", transition: "all 0.15s",
                  background: downloadPath ? "linear-gradient(135deg, #06b6d4, #0891b2)" : "var(--bg-card2)",
                  border: downloadPath ? "none" : "1px solid var(--border)",
                  color: downloadPath ? "#fff" : "var(--t3)",
                  pointerEvents: downloadPath ? "auto" : "none",
                }}
              >
                Excel ↓
              </a>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#f87171"
            }}>⚠ {error}</div>
          )}

          {/* Summary stats after successful search */}
          {success && <SummaryStats summary={searchSummary} count={jobs.length} />}

          {/* Results body */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 16, overflow: "hidden", minHeight: 300,
          }}>
            {loading ? (
              <LoadingState />
            ) : !jobs.length ? (
              <EmptyState hasSearched={hasSearched} />
            ) : view === "cards" ? (
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {visibleRows.map((job, i) => (
                  <JobCard key={`${job.url || i}-${i}`} job={job} index={i} />
                ))}
              </div>
            ) : (
              /* Table view */
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "var(--bg-card2)" }}>
                      {columns.map(([label, key]) => (
                        <th key={key} style={{
                          padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700,
                          color: "var(--t3)", letterSpacing: "0.06em", cursor: "pointer", whiteSpace: "nowrap",
                          borderBottom: "1px solid var(--border)",
                        }} onClick={() => onSort(key)}>
                          {label} {sortBy === key ? (direction === "asc" ? "↑" : "↓") : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((job, i) => (
                      <tr key={`${job.url || i}-${i}`}
                        style={{ transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-card2)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                          <span style={{
                            fontSize: 10, padding: "3px 8px", borderRadius: 6, fontWeight: 600,
                            background: `${platformColor(job.platform)}15`, color: platformColor(job.platform)
                          }}>{job.platform || "—"}</span>
                        </td>
                        <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", color: "var(--t1)", fontWeight: 600, maxWidth: 220 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title || "—"}</div>
                        </td>
                        <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", color: "var(--t2)" }}>{job.company || "—"}</td>
                        <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", color: "var(--t2)" }}>{job.location || "—"}</td>
                        <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", color: "var(--t3)" }}>{job.source || "—"}</td>
                        <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", color: "var(--t3)", whiteSpace: "nowrap" }}>
                          {timeAgo(job.posted_at) || job.posted_at || "—"}
                        </td>
                        <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                          {job.url ? (
                            <a href={job.url} target="_blank" rel="noreferrer" style={{
                              fontSize: 11, fontWeight: 700, color: "var(--cyan)", textDecoration: "none"
                            }}>Apply →</a>
                          ) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && jobs.length > PAGE_SIZE && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", borderTop: "1px solid var(--border)",
              }}>
                <p style={{ fontSize: 12, color: "var(--t3)" }}>
                  {start + 1}–{Math.min(start + PAGE_SIZE, sortedRows.length)} of {sortedRows.length} jobs
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    style={{
                      padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                      cursor: safePage === 1 ? "not-allowed" : "pointer",
                      background: "var(--bg-card2)", border: "1px solid var(--border)",
                      color: safePage === 1 ? "var(--t3)" : "var(--t2)", opacity: safePage === 1 ? 0.4 : 1,
                    }}>← Prev</button>
                  <span style={{ fontSize: 12, color: "var(--t2)", padding: "0 8px", fontWeight: 600 }}>
                    {safePage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    style={{
                      padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                      cursor: safePage === totalPages ? "not-allowed" : "pointer",
                      background: "var(--bg-card2)", border: "1px solid var(--border)",
                      color: safePage === totalPages ? "var(--t3)" : "var(--t2)", opacity: safePage === totalPages ? 0.4 : 1,
                    }}>Next →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
