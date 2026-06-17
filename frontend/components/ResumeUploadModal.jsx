import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseResumeUpload } from "../services/resumeApi.js";
import { useResumeBuilder } from "../context/ResumeBuilderContext.jsx";

const MAX_SIZE_MB = 10;
const ACCEPTED = [".pdf", ".doc", ".docx"];

function validateFile(file) {
  if (!file) return "No file selected.";
  const ext = "." + file.name.split(".").pop().toLowerCase();
  if (!ACCEPTED.includes(ext)) return "Only PDF, DOC, or DOCX files are supported.";
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return `File must be under ${MAX_SIZE_MB}MB.`;
  return null;
}

// Normalise any value to an array of non-empty strings
function toArr(value) {
  if (Array.isArray(value)) return value.map(String).map(s => s.trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function SectionChip({ label, value, icon }) {
  const hasValue = value && (Array.isArray(value) ? value.length > 0 : String(value).trim().length > 0);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 12px", borderRadius: 10,
      background: hasValue ? "rgba(16,185,129,0.08)" : "rgba(100,116,139,0.06)",
      border: `1px solid ${hasValue ? "rgba(16,185,129,0.25)" : "rgba(100,116,139,0.15)"}`,
      fontSize: 13, fontWeight: 600,
      color: hasValue ? "#10B981" : "var(--t3, #94a3b8)"
    }}>
      <span>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {hasValue && <span style={{ fontSize: 11 }}>✓</span>}
    </div>
  );
}

function AtsScoreBadge({ score }) {
  const color = score >= 75 ? "#10B981" : score >= 50 ? "#fbbf24" : "#fb923c";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 16px", borderRadius: 12,
      background: `${color}10`, border: `1px solid ${color}30`,
      marginBottom: 16
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        background: `${color}18`, border: `2px solid ${color}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 15, fontWeight: 800, color, flexShrink: 0
      }}>{score}</div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>ATS Compatibility Score</p>
        <p style={{ fontSize: 11, color: "var(--t3, #94a3b8)" }}>
          {score >= 75 ? "Strong ATS match" : score >= 50 ? "Moderate — improvements available" : "Needs optimization"}
        </p>
      </div>
    </div>
  );
}

function ReviewPanel({ parsed, onImport, onCancel, templateId }) {
  const navigate = useNavigate();
  const { loadDraft } = useResumeBuilder();

  const header = parsed.header || {};
  const expCount = (parsed.experience || []).length;
  const eduCount = (parsed.education || []).length;
  const skills = parsed.skills?.primarySkills || "";
  const linkedin = parsed.header?.linkedin || "";
  const github = parsed.header?.github || "";
  const portfolio = parsed.header?.portfolio || "";

  // Normalise the new array fields
  const certifications = toArr(parsed.certifications);
  const languages = toArr(parsed.languages);
  const projects = toArr(parsed.projects);

  function doImport() {
    const sections = [];
    let id = Date.now();

    // Projects → "Projects" section in pipe format for templates
    if (projects.length > 0) {
      sections.push({ id: `sec_${id++}`, title: "Projects", items: projects });
    }

    // Languages → "Languages" section
    if (languages.length > 0) {
      sections.push({ id: `sec_${id++}`, title: "Languages", items: languages });
    }

    // Certifications → "Certifications & Licenses" section
    if (certifications.length > 0) {
      sections.push({ id: `sec_${id++}`, title: "Certifications & Licenses", items: certifications });
    }

    // GitHub → "Websites & Social Links" section
    if (github) {
      sections.push({ id: `sec_${id++}`, title: "Websites & Social Links", items: [`GitHub: ${github}`] });
    }

    const draft = {
      header: {
        fullName: header.fullName || "",
        email: header.email || "",
        phone: header.phone || "",
        location: header.location || "",
        headline: header.headline || "",
        photo: ""
      },
      summary: parsed.summary || { text: "" },
      experience: (parsed.experience || []).length > 0
        ? parsed.experience
        : [{ jobTitle: "", employer: "", city: "", country: "", startDate: "", endDate: "", currentlyWorking: false, bullets: "" }],
      education: (parsed.education || []).length > 0
        ? parsed.education
        : [{ degree: "", institution: "", city: "", country: "", startDate: "", endDate: "", currentlyStudying: false, details: "" }],
      skills: parsed.skills || { primarySkills: "" },
      additional: {
        linkedin,
        portfolio,
        certifications: certifications.join(", "),
        sections
      }
    };

    loadDraft(draft);
    onImport?.();
    navigate(templateId ? `/builder?template=${templateId}` : "/builder");
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--t1, #0f172a)", marginBottom: 4 }}>
          Resume Parsed Successfully
        </p>
        <p style={{ fontSize: 12, color: "var(--t3, #94a3b8)" }}>
          Review extracted data before importing into the builder.
        </p>
      </div>

      {parsed.atsScore ? <AtsScoreBadge score={parsed.atsScore} /> : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <SectionChip icon="👤" label="Name" value={header.fullName} />
        <SectionChip icon="✉️" label="Email" value={header.email} />
        <SectionChip icon="📞" label="Phone" value={header.phone} />
        <SectionChip icon="📍" label="Location" value={header.location} />
        <SectionChip icon="💼" label={`Experience (${expCount})`} value={parsed.experience} />
        <SectionChip icon="🎓" label={`Education (${eduCount})`} value={parsed.education} />
        <SectionChip icon="⚡" label="Skills" value={skills} />
        <SectionChip icon="📝" label="Summary" value={parsed.summary?.text} />
        {linkedin && <SectionChip icon="🔗" label="LinkedIn" value={linkedin} />}
        {github && <SectionChip icon="💻" label="GitHub" value={github} />}
        {portfolio && <SectionChip icon="🌐" label="Portfolio" value={portfolio} />}
        {certifications.length > 0 && <SectionChip icon="🏆" label={`Certifications (${certifications.length})`} value={certifications} />}
        {languages.length > 0 && <SectionChip icon="🌍" label={`Languages (${languages.length})`} value={languages} />}
        {projects.length > 0 && <SectionChip icon="🚀" label={`Projects (${projects.length})`} value={projects} />}
      </div>

      {parsed.atsSuggestions?.length > 0 && (
        <div style={{
          marginBottom: 16, padding: "10px 12px", borderRadius: 10,
          background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)"
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Improvement Suggestions
          </p>
          {parsed.atsSuggestions.map((s, i) => (
            <p key={i} style={{ fontSize: 12, color: "var(--t2, #475569)", marginBottom: 3 }}>• {s}</p>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={doImport}
          style={{
            flex: 1, padding: "11px 16px", borderRadius: 10, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, #2563EB, #0EA5C8)",
            color: "#fff", fontSize: 13, fontWeight: 700
          }}
        >
          Import All &amp; Open Builder
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "11px 16px", borderRadius: 10, cursor: "pointer",
            background: "var(--bg-card2, #f8fafc)", border: "1px solid var(--border, #e2e8f0)",
            color: "var(--t2, #475569)", fontSize: 13, fontWeight: 600
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ResumeUploadModal({ open, onClose, templateId }) {
  const inputRef = useRef(null);
  const [stage, setStage] = useState("idle"); // idle | parsing | review | error
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const reset = useCallback(() => {
    setStage("idle");
    setParsed(null);
    setError("");
    setDragOver(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose?.();
  }, [reset, onClose]);

  const processFile = useCallback(async (file) => {
    const err = validateFile(file);
    if (err) { setError(err); setStage("error"); return; }
    setStage("parsing");
    setError("");
    try {
      const result = await parseResumeUpload(file);
      setParsed(result);
      setStage("review");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to parse resume. Please try again.";
      setError(msg);
      setStage("error");
    }
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const onFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }, [processFile]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div style={{
        background: "var(--bg-card, #fff)", borderRadius: 18,
        border: "1px solid var(--border, #e2e8f0)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
        width: "100%", maxWidth: 480,
        maxHeight: "90vh", overflow: "auto",
        padding: 24
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 17, fontWeight: 800, color: "var(--t1, #0f172a)", marginBottom: 2 }}>Upload Resume</p>
            <p style={{ fontSize: 12, color: "var(--t3, #94a3b8)" }}>PDF, DOC, DOCX · Max {MAX_SIZE_MB}MB</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border, #e2e8f0)",
              background: "var(--bg-card2, #f8fafc)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, color: "var(--t2, #475569)", fontWeight: 700
            }}
          >×</button>
        </div>

        {stage === "idle" || stage === "error" ? (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? "#2563EB" : "var(--border, #e2e8f0)"}`,
                borderRadius: 14, padding: "36px 24px", textAlign: "center",
                cursor: "pointer",
                background: dragOver ? "rgba(37,99,235,0.04)" : "var(--bg-card2, #f8fafc)",
                transition: "all 0.2s", marginBottom: error ? 12 : 0
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--t1, #0f172a)", marginBottom: 6 }}>
                Drop your resume here
              </p>
              <p style={{ fontSize: 12, color: "var(--t3, #94a3b8)", marginBottom: 12 }}>or</p>
              <span style={{
                display: "inline-block", padding: "8px 20px", borderRadius: 8,
                background: "linear-gradient(135deg, #2563EB, #0EA5C8)",
                color: "#fff", fontSize: 13, fontWeight: 700
              }}>
                Choose File
              </span>
              <p style={{ fontSize: 11, color: "var(--t3, #94a3b8)", marginTop: 10 }}>
                PDF, DOC, DOCX · Max {MAX_SIZE_MB}MB
              </p>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED.join(",")}
                onChange={onFileChange}
                style={{ display: "none" }}
              />
            </div>

            {error && (
              <div style={{
                marginTop: 12, padding: "10px 14px", borderRadius: 10,
                background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
                fontSize: 13, color: "#ef4444", fontWeight: 500
              }}>
                ⚠ {error}
              </div>
            )}
          </>
        ) : stage === "parsing" ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              border: "3px solid rgba(37,99,235,0.15)", borderTopColor: "#2563EB",
              margin: "0 auto 16px", animation: "spin 0.8s linear infinite"
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--t1, #0f172a)", marginBottom: 6 }}>Parsing your resume...</p>
            <p style={{ fontSize: 12, color: "var(--t3, #94a3b8)" }}>Extracting all sections with AI</p>
          </div>
        ) : stage === "review" && parsed ? (
          <ReviewPanel
            parsed={parsed}
            templateId={templateId}
            onImport={handleClose}
            onCancel={handleClose}
          />
        ) : null}
      </div>
    </div>
  );
}
