import { useNavigate } from "react-router-dom";
import { resumeTemplates } from "../data/resumeTemplates.js";
import TemplateThumbnail from "../components/TemplateThumbnail.jsx";

const features = [
  {
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    title: "Resume Builder",
    desc:  "Choose from 6+ ATS-friendly templates. Fill in your details and export a polished PDF — completely free.",
    badge: "Free",
    badgeColor: "rgba(52,211,153,0.15)",
    badgeBorder: "rgba(52,211,153,0.3)",
    badgeText: "#34D399",
    glow: "rgba(52,211,153,0.08)",
  },
  {
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    title: "AI Resume Improve",
    desc:  "Upload your existing resume. Our AI rewrites bullet points, sharpens your summary, and boosts impact.",
    badge: "Pro",
    badgeColor: "rgba(251,191,36,0.12)",
    badgeBorder: "rgba(251,191,36,0.3)",
    badgeText: "#fbbf24",
    glow: "rgba(251,191,36,0.06)",
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    title: "ATS Score Checker",
    desc:  "Paste any job description. Instantly see your match %, missing keywords, and exactly what to fix.",
    badge: "Pro",
    badgeColor: "rgba(251,191,36,0.12)",
    badgeBorder: "rgba(251,191,36,0.3)",
    badgeText: "#fbbf24",
    glow: "rgba(251,191,36,0.06)",
  },
  {
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    title: "Job Scraper",
    desc:  "Search live jobs from LinkedIn, Naukri, Indeed, and Glassdoor — all in one place. No manual browsing.",
    badge: "Free to Search",
    badgeColor: "rgba(34,211,238,0.1)",
    badgeBorder: "rgba(34,211,238,0.25)",
    badgeText: "#22d3ee",
    glow: "rgba(34,211,238,0.06)",
  },
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "AI Job Matching",
    desc:  "Your resume gets a semantic match score against every job. See exactly which roles suit you best.",
    badge: "Pro",
    badgeColor: "rgba(251,191,36,0.12)",
    badgeBorder: "rgba(251,191,36,0.3)",
    badgeText: "#fbbf24",
    glow: "rgba(251,191,36,0.06)",
  },
  {
    icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
    title: "Auto-Apply Agent",
    desc:  "Enable the AI agent to queue top-matched jobs, tailor your resume per role, and generate cover letters.",
    badge: "Pro",
    badgeColor: "rgba(251,146,60,0.12)",
    badgeBorder: "rgba(251,146,60,0.3)",
    badgeText: "#fb923c",
    glow: "rgba(251,146,60,0.06)",
  },
];

const steps = [
  { n: "01", title: "Build or Upload Resume",  desc: "Use our template builder or upload your existing PDF/DOCX." },
  { n: "02", title: "AI Extracts Your Profile", desc: "Our AI reads your skills, experience, and target role." },
  { n: "03", title: "We Match You to Jobs",     desc: "Live jobs from 4 platforms, scored against your profile." },
  { n: "04", title: "Apply Smarter, Get Hired", desc: "Tailor your resume per role, auto-generate cover letters." },
];

const stats = [
  { value: "6+",   label: "Resume Templates" },
  { value: "4",    label: "Job Platforms" },
  { value: "AI",   label: "Powered Matching" },
  { value: "₹0",   label: "To Get Started" },
];

export default function HomePage() {
  const navigate = useNavigate();

  const categoryShowcase = [
    {
      category: "Creative",
      label: "Creative Templates",
      template: resumeTemplates.find(t => t.category === "Creative") || resumeTemplates[0],
      color: "#fb923c",
    },
    {
      category: "Simple",
      label: "Simple Templates",
      template: resumeTemplates.find(t => t.category === "Simple") || resumeTemplates[1],
      color: "#22d3ee",
    },
    {
      category: "Modern",
      label: "Modern Templates",
      template: resumeTemplates.find(t => t.category === "Modern") || resumeTemplates[2],
      color: "#818cf8",
    },
  ];

  return (
    <div style={{ background: "var(--bg)", color: "var(--t1)" }}>

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", overflow: "hidden", padding: "96px 24px 80px" }}>
        {/* BG orbs */}
        <div className="orb" style={{
          position: "absolute", top: -120, right: -60, width: 500, height: 500,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div className="orb" style={{
          position: "absolute", bottom: -80, left: -80, width: 400, height: 400,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%)",
          pointerEvents: "none", animationDelay: "2s"
        }} />
        <div className="dot-grid" style={{
          position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none"
        }} />

        <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid",
          gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", position: "relative" }}>

          {/* Left — copy */}
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)",
              borderRadius: 20, padding: "5px 14px", marginBottom: 24
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--cyan)",
                letterSpacing: "0.1em", fontFamily: "Sora, sans-serif" }}>
                ⚡ AI-POWERED CAREER PLATFORM
              </span>
            </div>

            <h1 style={{
              fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, lineHeight: 1.1,
              fontFamily: "Sora, sans-serif", marginBottom: 20, letterSpacing: "-0.02em"
            }}>
              Land Your Dream Job{" "}
              <span className="text-gradient">10× Faster</span>{" "}
              with AI
            </h1>

            <p style={{ fontSize: 17, color: "var(--t2)", lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
              Build ATS-optimized resumes, scrape live jobs from LinkedIn & Naukri, get AI match scores, and auto-apply — all in one platform built for Indian job seekers.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
              <button onClick={() => navigate("/builder")} className="btn-cta" style={{ fontSize: 15, padding: "13px 28px" }}>
                Build Resume Free →
              </button>
              <button onClick={() => navigate("/login")} className="btn-outline" style={{ fontSize: 15, padding: "13px 24px" }}>
                Sign In
              </button>
            </div>

            {/* Social proof */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex" }}>
                {["A","B","C","D"].map((l,i) => (
                  <div key={l} style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: `hsl(${i*60+180}, 60%, 50%)`,
                    border: "2px solid var(--bg)", marginLeft: i ? -10 : 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: "#fff"
                  }}>{l}</div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: "var(--t2)" }}>
                <span style={{ color: "var(--cyan)", fontWeight: 700 }}>1,200+</span> job seekers already using NightHire
              </p>
            </div>
          </div>

          {/* Right — resume card mockup */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            {/* Floating match card */}
            <div style={{
              position: "absolute", bottom: -16, left: -16, zIndex: 10,
              background: "var(--bg-card)", border: "1px solid rgba(251,146,60,0.3)",
              borderRadius: 14, padding: "12px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#fb923c", marginBottom: 4 }}>🎯 Top Match Found</div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "Sora, sans-serif" }}>Google · Backend SWE</div>
              <div style={{ fontSize: 12, color: "#34D399", marginTop: 2 }}>91% match score</div>
            </div>

            {/* Main resume card */}
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 20, padding: 24, width: "100%", maxWidth: 380,
              boxShadow: "0 24px 80px rgba(0,0,0,0.5)"
            }} className="glow-cyan">

              {/* ATS badge */}
              <div style={{
                position: "absolute", top: -14, right: 20,
                background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                borderRadius: 12, padding: "6px 14px", textAlign: "center",
                boxShadow: "0 8px 24px rgba(34,211,238,0.35)"
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "Sora, sans-serif", lineHeight: 1 }}>94%</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.8)", fontWeight: 600, letterSpacing: "0.05em" }}>ATS SCORE</div>
              </div>

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "linear-gradient(135deg, #22d3ee, #818cf8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "Sora, sans-serif"
                }}>AS</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "Sora, sans-serif" }}>Alex Sharma</div>
                  <div style={{ fontSize: 12, color: "var(--cyan)" }}>Senior Software Engineer</div>
                </div>
              </div>

              {/* Lines */}
              {[100, 85, 70, 90].map((w, i) => (
                <div key={i} style={{
                  height: 7, borderRadius: 4, background: "var(--bg-card2)",
                  width: `${w}%`, marginBottom: 8
                }} />
              ))}

              {/* Skills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14, marginBottom: 14 }}>
                {["React", "Node.js", "MongoDB", "AWS", "Python"].map(s => (
                  <span key={s} style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 20,
                    background: "var(--bg-card2)", border: "1px solid var(--border)",
                    color: "var(--t2)"
                  }}>{s}</span>
                ))}
              </div>

              {/* AI optimized bar */}
              <div style={{
                background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)",
                borderRadius: 10, padding: "10px 14px",
                display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <span style={{ fontSize: 12, color: "#34D399", fontWeight: 600 }}>✓ AI Optimized</span>
                <span style={{ fontSize: 12, color: "#34D399", fontWeight: 700 }}>Interview Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ════════════════════════════════════════════════════ */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "32px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "Sora, sans-serif" }} className="text-gradient">{s.value}</div>
              <div style={{ fontSize: 13, color: "var(--t2)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════════ */}
      <section id="features" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "var(--cyan)",
              fontFamily: "Sora, sans-serif", marginBottom: 12 }}>FEATURES</p>
            <h2 style={{ fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 800, fontFamily: "Sora, sans-serif",
              letterSpacing: "-0.02em", marginBottom: 16 }}>
              Everything to <span className="text-gradient">get hired faster</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--t2)", maxWidth: 520, margin: "0 auto" }}>
              Free tools to get started. Pro AI features that actually move the needle.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {features.map(f => (
              <div key={f.title} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 16, padding: 24, transition: "all 0.25s ease",
                cursor: "default",
                boxShadow: `0 4px 24px ${f.glow}`
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = f.badgeBorder;
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 16px 48px ${f.glow}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = `0 4px 24px ${f.glow}`;
                }}>

                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, marginBottom: 16,
                  background: `${f.badgeColor}`, border: `1px solid ${f.badgeBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
                    viewBox="0 0 24 24" stroke={f.badgeText} strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: "Sora, sans-serif" }}>{f.title}</h3>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                    background: f.badgeColor, border: `1px solid ${f.badgeBorder}`, color: f.badgeText
                  }}>{f.badge}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════════ */}
      <section style={{ padding: "64px 24px", background: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "var(--cyan)", fontFamily: "Sora, sans-serif", marginBottom: 12 }}>HOW IT WORKS</p>
            <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 800, fontFamily: "Sora, sans-serif" }}>From zero to <span className="text-gradient">interview-ready</span></h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, position: "relative" }}>
            {/* Connecting line */}
            <div style={{
              position: "absolute", top: 22, left: "12.5%", right: "12.5%", height: 1,
              background: "linear-gradient(90deg, rgba(34,211,238,0.4), rgba(129,140,248,0.4), rgba(251,146,60,0.4))",
              zIndex: 0
            }} />
            {steps.map((s, i) => (
              <div key={s.n} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", margin: "0 auto 16px",
                  background: `hsl(${180 + i * 30}, 70%, 50%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "Sora, sans-serif",
                  boxShadow: `0 0 0 4px var(--bg-card), 0 0 0 5px hsl(${180 + i * 30}, 70%, 50%)`
                }}>{s.n}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, fontFamily: "Sora, sans-serif", marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TEMPLATES ═══════════════════════════════════════════════ */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "var(--cyan)", fontFamily: "Sora, sans-serif", marginBottom: 10 }}>TEMPLATES</p>
              <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 800, fontFamily: "Sora, sans-serif" }}>
                ATS-Friendly <span className="text-gradient">Resume Templates</span>
              </h2>
            </div>
            <button onClick={() => navigate("/templates")}
              style={{ fontSize: 13, fontWeight: 600, color: "var(--cyan)", background: "none", border: "none", cursor: "pointer" }}>
              View All →
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 40 }}>
            {categoryShowcase.map(item => (
              <div key={item.category} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 16, overflow: "hidden", transition: "all 0.25s"
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{
                  height: 240, background: `linear-gradient(160deg, ${item.color}22, var(--bg-card2))`,
                  display: "flex", alignItems: "center", justifyContent: "center", padding: 16
                }}>
                  <div style={{ width: 140, height: "100%" }}>
                    <TemplateThumbnail template={item.template} />
                  </div>
                </div>
                <button onClick={() => navigate(`/templates?category=${encodeURIComponent(item.category)}`)}
                  style={{
                    width: "100%", padding: "14px 16px",
                    background: "none", border: "none", borderTop: "1px solid var(--border)",
                    cursor: "pointer", fontSize: 13, fontWeight: 700, color: item.color,
                    fontFamily: "Sora, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                  }}>
                  {item.label} →
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {resumeTemplates.slice(0, 6).map(template => (
              <div key={template.id} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 14, overflow: "hidden", transition: "all 0.25s"
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{
                  height: 200, background: `linear-gradient(160deg, ${template.accent}22, var(--bg-card2))`,
                  display: "flex", alignItems: "center", justifyContent: "center", padding: 12
                }}>
                  <div style={{ width: 120, height: "100%" }}>
                    <TemplateThumbnail template={template} />
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "Sora, sans-serif", marginBottom: 2 }}>{template.name}</div>
                  <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 12 }}>{template.category}</div>
                  <button onClick={() => navigate(`/builder?template=${template.id}`)} className="btn-primary" style={{ width: "100%", fontSize: 13, padding: "9px" }}>
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══════════════════════════════════════════════ */}
      <section style={{ padding: "64px 24px 80px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center",
          background: "linear-gradient(135deg, rgba(34,211,238,0.08), rgba(129,140,248,0.08))",
          border: "1px solid rgba(34,211,238,0.2)", borderRadius: 24, padding: "56px 40px" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "var(--cyan)", fontFamily: "Sora, sans-serif", marginBottom: 16 }}>START TODAY — FREE</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, fontFamily: "Sora, sans-serif", marginBottom: 16, letterSpacing: "-0.02em" }}>
            Ready to land your <span className="text-gradient">dream job?</span>
          </h2>
          <p style={{ fontSize: 15, color: "var(--t2)", marginBottom: 32, maxWidth: 440, margin: "0 auto 32px" }}>
            Build your first AI-optimized resume in minutes — no credit card required.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/signup")} className="btn-cta" style={{ fontSize: 15, padding: "14px 32px" }}>
              Create Free Account →
            </button>
            <button onClick={() => navigate("/pricing")} className="btn-outline" style={{ fontSize: 15, padding: "14px 24px" }}>
              View Pricing
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
