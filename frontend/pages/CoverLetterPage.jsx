import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMatchedJobs } from "../services/matchApi.js";
import { generateCoverLetter } from "../services/resumeApi.js";

const initialForm = { jobId: "", role: "", company: "", jobDescriptionText: "" };

// ── tiny helpers ────────────────────────────────────────────────────────────
function charCount(str) { return (str || "").length; }

function WordCount({ text }) {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return (
    <span style={{ fontSize: 10, color: "var(--t3)", fontVariantNumeric: "tabular-nums" }}>
      {words} words
    </span>
  );
}

// tips shown while generating
const TIPS = [
  "AI is reading your profile skills…",
  "Matching your experience to the JD…",
  "Crafting a compelling opening line…",
  "Writing a strong closing paragraph…",
  "Polishing tone and ATS keywords…",
];

function useCycleTip(active) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!active) { setIdx(0); return; }
    const id = setInterval(() => setIdx(i => (i + 1) % TIPS.length), 1800);
    return () => clearInterval(id);
  }, [active]);
  return TIPS[idx];
}

// ── sub-components ──────────────────────────────────────────────────────────
function StepBadge({ n, done }) {
  return (
    <div style={{
      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
      background: done ? "rgba(52,211,153,0.15)" : "var(--bg-card2)",
      border: `1.5px solid ${done ? "#34D399" : "var(--border2)"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, fontWeight: 700, color: done ? "#34D399" : "var(--t3)",
      fontFamily: "Sora, sans-serif",
    }}>
      {done ? "✓" : n}
    </div>
  );
}

function JobPill({ item, selected, onClick }) {
  const score = item.matchScore;
  const sc    = score >= 75 ? "#34D399" : score >= 50 ? "#fbbf24" : "#fb923c";
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", padding: "11px 14px", borderRadius: 12, cursor: "pointer",
      background: selected ? "rgba(34,211,238,0.08)" : "var(--bg-card2)",
      border: `1.5px solid ${selected ? "rgba(34,211,238,0.4)" : "var(--border)"}`,
      transition: "all 0.15s", marginBottom: 6,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.job.title}
          </p>
          <p style={{ fontSize: 11, color: "var(--t2)", marginTop: 2 }}>{item.job.company}</p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 8, flexShrink: 0,
          background: `${sc}15`, border: `1px solid ${sc}30`, color: sc,
        }}>{score}%</span>
      </div>
    </button>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function CoverLetterPage() {
  const [jobs,             setJobs]             = useState([]);
  const [form,             setForm]             = useState(initialForm);
  const [loadingJobs,      setLoadingJobs]      = useState(true);
  const [generating,       setGenerating]       = useState(false);
  const [upgradeRequired,  setUpgradeRequired]  = useState(false);
  const [error,            setError]            = useState("");
  const [result,           setResult]           = useState("");
  const [copied,           setCopied]           = useState(false);
  const [showJobPicker,    setShowJobPicker]    = useState(false);
  const tip = useCycleTip(generating);

  useEffect(() => {
    async function loadJobs() {
      setLoadingJobs(true);
      try {
        const data = await fetchMatchedJobs();
        setJobs(data.items || []);
      } catch { setJobs([]); }
      finally { setLoadingJobs(false); }
    }
    loadJobs();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "jobId") {
      const selected = jobs.find(item => item.job.id === value);
      if (selected) {
        setForm({ jobId: selected.job.id, role: selected.job.title || "", company: selected.job.company || "", jobDescriptionText: selected.job.description || "" });
        setShowJobPicker(false);
        return;
      }
    }
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function selectJob(item) {
    setForm({ jobId: item.job.id, role: item.job.title || "", company: item.job.company || "", jobDescriptionText: item.job.description || "" });
    setShowJobPicker(false);
  }

  function clearJob() {
    setForm(initialForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGenerating(true); setError(""); setUpgradeRequired(false); setCopied(false);
    try {
      const payload = {};
      if (form.jobId)                     payload.jobId             = form.jobId;
      if (form.role.trim())               payload.role              = form.role.trim();
      if (form.company.trim())            payload.company           = form.company.trim();
      if (form.jobDescriptionText.trim()) payload.jobDescriptionText = form.jobDescriptionText.trim();
      const data = await generateCoverLetter(payload);
      setResult(data.coverLetter || "");
    } catch (err) {
      if (err?.response?.status === 403) { setUpgradeRequired(true); setResult(""); }
      else setError(err?.response?.data?.message || "Unable to generate cover letter.");
    } finally { setGenerating(false); }
  }

  async function handleCopy() {
    if (!result) return;
    try { await navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    catch { setError("Clipboard access not available."); }
  }

  function handleDownload() {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${(form.company || "draft").toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // derived
  const selectedJob    = jobs.find(j => j.job.id === form.jobId);
  const step1Done      = !!(form.role.trim() || form.jobId);
  const step2Done      = !!(form.company.trim());
  const step3Done      = !!(form.jobDescriptionText.trim() || form.jobId);
  const canGenerate    = (step1Done && step3Done) && !generating;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Upgrade gate ── */}
      {upgradeRequired && (
        <div style={{
          background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(251,146,60,0.06))",
          border: "1px solid rgba(251,191,36,0.25)", borderRadius: 14, padding: "18px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap"
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24", fontFamily: "Sora, sans-serif", marginBottom: 4 }}>⚡ Pro Feature</p>
            <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6 }}>AI cover letter generation is available on Pro. Upgrade to unlock personalized letters for every job.</p>
          </div>
          <Link to="/app/subscription" style={{
            display: "inline-block", textDecoration: "none",
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            color: "#fff", borderRadius: 10, padding: "10px 20px",
            fontSize: 13, fontWeight: 700, fontFamily: "Sora, sans-serif", flexShrink: 0
          }}>Upgrade to Pro →</Link>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#f87171" }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Main 2-col ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

        {/* ══ LEFT — Input panel ════════════════════════════════════════ */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden"
          }}>
            {/* Header */}
            <div style={{ padding: "20px 20px 0" }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--cyan)", marginBottom: 6 }}>APPLICATION ASSET</p>
              <h3 style={{ fontSize: 18, fontWeight: 800, fontFamily: "Sora, sans-serif", color: "var(--t1)", marginBottom: 4 }}>Cover Letter Studio</h3>
              <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6, marginBottom: 20 }}>
                Generate a profile-aware cover letter from a matched job or paste any job description.
              </p>

              {/* Progress steps */}
              <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 20 }}>
                {[
                  { n: "1", label: "Role", done: step1Done },
                  { n: "2", label: "Company", done: step2Done },
                  { n: "3", label: "Job Details", done: step3Done },
                ].map((s, i) => (
                  <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <StepBadge n={s.n} done={s.done} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: s.done ? "var(--t1)" : "var(--t3)" }}>{s.label}</span>
                    </div>
                    {i < 2 && <div style={{ flex: 1, height: 1, background: "var(--border)", margin: "0 10px" }} />}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: "var(--border)" }} />

            {/* Form body */}
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

              {/* ── Quick-pick from matched jobs ── */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", letterSpacing: "0.05em", marginBottom: 8 }}>PICK FROM YOUR MATCHES</p>

                {selectedJob ? (
                  /* Selected job pill */
                  <div style={{
                    background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.3)",
                    borderRadius: 12, padding: "12px 14px",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {selectedJob.job.title}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--cyan)", marginTop: 2 }}>{selectedJob.job.company} · {selectedJob.matchScore}% match</p>
                    </div>
                    <button type="button" onClick={clearJob} style={{
                      background: "none", border: "none", color: "var(--t3)", cursor: "pointer",
                      fontSize: 18, lineHeight: 1, flexShrink: 0
                    }}>×</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowJobPicker(v => !v)} style={{
                    width: "100%", padding: "11px 14px", borderRadius: 12, cursor: "pointer",
                    background: "var(--bg-card2)", border: "1px solid var(--border)", textAlign: "left",
                    fontSize: 13, color: "var(--t3)", transition: "all 0.15s",
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--cyan)"; e.currentTarget.style.color = "var(--cyan)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--t3)"; }}
                  >
                    <span>{loadingJobs ? "Loading matched jobs…" : jobs.length ? `Choose from ${jobs.length} matched jobs` : "No matches yet — fill manually below"}</span>
                    <span style={{ fontSize: 10 }}>{showJobPicker ? "▲" : "▼"}</span>
                  </button>
                )}

                {/* Dropdown list */}
                {showJobPicker && !selectedJob && jobs.length > 0 && (
                  <div style={{
                    marginTop: 6, maxHeight: 220, overflowY: "auto",
                    background: "var(--bg-card2)", border: "1px solid var(--border)",
                    borderRadius: 12, padding: 8,
                  }}>
                    {jobs.map(item => (
                      <JobPill
                        key={item.job.id}
                        item={item}
                        selected={form.jobId === item.job.id}
                        onClick={() => selectJob(item)}
                      />
                    ))}
                  </div>
                )}

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  <span style={{ fontSize: 10, color: "var(--t3)", fontWeight: 600, flexShrink: 0 }}>OR FILL MANUALLY</span>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                </div>
              </div>

              {/* Role */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--t2)", letterSpacing: "0.05em", marginBottom: 6 }}>
                  ROLE / JOB TITLE <span style={{ color: "#f87171" }}>*</span>
                </label>
                <input
                  name="role" value={form.role} onChange={handleChange}
                  placeholder="e.g. Backend Developer"
                  className="input-dark"
                  style={{ borderColor: step1Done ? "rgba(52,211,153,0.3)" : undefined }}
                />
              </div>

              {/* Company */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--t2)", letterSpacing: "0.05em", marginBottom: 6 }}>
                  COMPANY NAME
                </label>
                <input
                  name="company" value={form.company} onChange={handleChange}
                  placeholder="e.g. Google, Infosys, Swiggy"
                  className="input-dark"
                />
              </div>

              {/* Job description */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", letterSpacing: "0.05em" }}>
                    JOB DESCRIPTION {!form.jobId && <span style={{ color: "#f87171" }}>*</span>}
                  </label>
                  {form.jobDescriptionText && <WordCount text={form.jobDescriptionText} />}
                </div>
                <textarea
                  name="jobDescriptionText" value={form.jobDescriptionText} onChange={handleChange}
                  rows={9}
                  placeholder={form.jobId ? "Loaded from matched job — you can edit it here" : "Paste the job description here. More detail = better letter."}
                  required={!form.jobId}
                  className="input-dark"
                  style={{ resize: "vertical", lineHeight: 1.6 }}
                />
                <p style={{ fontSize: 10, color: "var(--t3)", marginTop: 4 }}>
                  Tip: Include responsibilities and required skills for the most tailored output.
                </p>
              </div>
            </div>

            {/* Footer CTA */}
            <div style={{ padding: "0 20px 20px" }}>
              <button type="submit" disabled={!canGenerate} style={{
                width: "100%", padding: "13px", borderRadius: 11,
                fontSize: 14, fontWeight: 800, fontFamily: "Sora, sans-serif",
                cursor: canGenerate ? "pointer" : "not-allowed",
                background: canGenerate ? "linear-gradient(135deg, #06b6d4, #0891b2)" : "var(--bg-card2)",
                border: canGenerate ? "none" : "1px solid var(--border)",
                color: canGenerate ? "#fff" : "var(--t3)",
                opacity: generating ? 0.75 : 1, transition: "all 0.2s",
                boxShadow: canGenerate && !generating ? "0 4px 20px rgba(34,211,238,0.25)" : "none",
              }}>
                {generating ? "✨ Writing your letter…" : "✨ Generate Cover Letter"}
              </button>
              {!step1Done && (
                <p style={{ fontSize: 11, color: "#f87171", textAlign: "center", marginTop: 8 }}>Add a role or pick a matched job to continue</p>
              )}
            </div>
          </div>
        </form>

        {/* ══ RIGHT — Output panel ══════════════════════════════════════ */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column"
        }}>
          {/* Output header */}
          <div style={{
            padding: "18px 20px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 800, fontFamily: "Sora, sans-serif", color: "var(--t1)", marginBottom: 2 }}>
                Generated Draft
              </h4>
              <p style={{ fontSize: 11, color: "var(--t2)" }}>
                {result ? "Ready to copy, edit, or download" : "Your cover letter will appear here"}
              </p>
            </div>

            {result && (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleCopy} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  background: copied ? "rgba(52,211,153,0.15)" : "var(--bg-card2)",
                  border: `1px solid ${copied ? "rgba(52,211,153,0.35)" : "var(--border)"}`,
                  color: copied ? "#34D399" : "var(--t2)", transition: "all 0.15s",
                }}>
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
                <button onClick={handleDownload} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: "var(--bg-card2)", border: "1px solid var(--border)",
                  color: "var(--t2)", transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--cyan)"; e.currentTarget.style.color = "var(--cyan)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--t2)"; }}>
                  ↓ .txt
                </button>
              </div>
            )}
          </div>

          {/* Output body */}
          <div style={{ flex: 1, position: "relative" }}>

            {/* ── Generating state ── */}
            {generating && (
              <div style={{
                position: "absolute", inset: 0, zIndex: 10,
                background: "var(--bg-card)", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center"
              }}>
                {/* Animated orb */}
                <div style={{ position: "relative", width: 72, height: 72, marginBottom: 24 }}>
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    border: "3px solid var(--border)", borderTopColor: "var(--cyan)",
                    animation: "spin 0.9s linear infinite",
                  }} />
                  <div style={{
                    position: "absolute", inset: 8, borderRadius: "50%",
                    border: "2px solid var(--border)", borderBottomColor: "#818cf8",
                    animation: "spin 1.4s linear infinite reverse",
                  }} />
                  <div style={{
                    position: "absolute", inset: 0, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 22
                  }}>✨</div>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)", fontFamily: "Sora, sans-serif", marginBottom: 8 }}>
                  Writing your letter
                </p>
                <p style={{ fontSize: 12, color: "var(--cyan)", minHeight: 18, transition: "all 0.3s" }}>{tip}</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* ── Empty state ── */}
            {!generating && !result && (
              <div style={{ padding: "48px 32px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", fontFamily: "Sora, sans-serif", marginBottom: 10 }}>
                  Your cover letter will appear here
                </p>
                <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.7, maxWidth: 300, margin: "0 auto 24px" }}>
                  Select a matched job or fill in the role and company, then hit Generate.
                </p>

                {/* How it works */}
                <div style={{
                  background: "var(--bg-card2)", border: "1px solid var(--border)",
                  borderRadius: 14, padding: "16px 20px", textAlign: "left", maxWidth: 340, margin: "0 auto"
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)", letterSpacing: "0.06em", marginBottom: 12 }}>WHAT AI WRITES FOR YOU</p>
                  {[
                    "Opening para — role + company-specific hook",
                    "Middle para — your top 2–3 matching skills",
                    "Closing para — enthusiasm + call to action",
                  ].map((line, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 14, lineHeight: 1.3, flexShrink: 0 }}>
                        {["🎯","💡","🤝"][i]}
                      </span>
                      <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Result ── */}
            {!generating && result && (
              <div style={{ padding: 20, height: "100%" }}>
                {/* Word count bar */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: 12, padding: "8px 12px",
                  background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)",
                  borderRadius: 10
                }}>
                  <span style={{ fontSize: 11, color: "#34D399", fontWeight: 600 }}>✓ Cover letter ready</span>
                  <WordCount text={result} />
                </div>

                {/* Letter text */}
                <div style={{
                  background: "var(--bg-card2)", border: "1px solid var(--border)",
                  borderRadius: 14, padding: "20px 22px",
                  minHeight: 400, maxHeight: 540, overflowY: "auto",
                }}>
                  <pre style={{
                    whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.85,
                    color: "var(--t1)", fontFamily: "Manrope, sans-serif",
                    margin: 0
                  }}>{result}</pre>
                </div>

                {/* Action row below letter */}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={handleCopy} style={{
                    flex: 1, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                    cursor: "pointer", transition: "all 0.15s",
                    background: copied ? "rgba(52,211,153,0.15)" : "linear-gradient(135deg, #06b6d4, #0891b2)",
                    border: copied ? "1px solid rgba(52,211,153,0.35)" : "none",
                    color: copied ? "#34D399" : "#fff",
                  }}>{copied ? "✓ Copied to clipboard!" : "Copy to Clipboard"}</button>
                  <button onClick={handleDownload} style={{
                    padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor: "pointer", background: "var(--bg-card2)",
                    border: "1px solid var(--border)", color: "var(--t2)", transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--cyan)"; e.currentTarget.style.color = "var(--cyan)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--t2)"; }}>
                    ↓ Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
