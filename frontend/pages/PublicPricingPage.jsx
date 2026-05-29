import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../services/authStorage.js";

const freeFeatures = [
  { text: "6+ ATS-friendly resume templates",    yes: true },
  { text: "Manual resume builder + PDF export",   yes: true },
  { text: "Job search across LinkedIn & Naukri",  yes: true },
  { text: "View job listings (title, company)",   yes: true },
  { text: "AI resume improve",                    yes: false },
  { text: "ATS score vs job description",         yes: false },
  { text: "AI tailor resume per job",             yes: false },
  { text: "AI cover letter generation",           yes: false },
  { text: "Job match scores on dashboard",        yes: false },
  { text: "Application tracker board",            yes: false },
];

const proFeatures = [
  { text: "Everything in Free",                   yes: true },
  { text: "AI resume improve (rewrites bullets)", yes: true },
  { text: "ATS score vs any job description",     yes: true },
  { text: "AI tailor resume per job",             yes: true },
  { text: "AI cover letter generation",           yes: true },
  { text: "Semantic job match % scoring",         yes: true },
  { text: "Top matched jobs on dashboard",        yes: true },
  { text: "Application tracker board",            yes: true },
  { text: "Auto-apply queue agent",               yes: true },
  { text: "Email notifications on apply",         yes: true },
];

const faqs = [
  { q: "Is the free plan really free?", a: "Yes — no credit card required. You get the full resume builder and job search forever free." },
  { q: "What AI is used for Pro features?", a: "We use Gemini embeddings for job matching (free tier) and GPT-4o-mini for resume writing — keeping your costs down and quality high." },
  { q: "Can I cancel anytime?", a: "Absolutely. Cancel your Pro subscription anytime from the Subscription page. No questions asked." },
  { q: "Does Auto-Apply actually submit applications?", a: "Currently Auto-Apply queues and tracks applications with tailored resumes and cover letters. Direct form submission is coming soon." },
];

export default function PublicPricingPage() {
  const navigate = useNavigate();
  const authed   = isAuthenticated();

  function handlePro() {
    navigate(authed ? "/app/subscription" : "/login");
  }

  return (
    <div style={{ background: "var(--bg)", color: "var(--t1)" }}>

      {/* Header */}
      <section style={{ textAlign: "center", padding: "80px 24px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "var(--cyan)", fontFamily: "Sora, sans-serif", marginBottom: 16 }}>PRICING</p>
        <h1 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, fontFamily: "Sora, sans-serif", letterSpacing: "-0.02em", marginBottom: 16 }}>
          Simple, <span className="text-gradient">honest pricing</span>
        </h1>
        <p style={{ fontSize: 16, color: "var(--t2)", maxWidth: 480, margin: "0 auto" }}>
          Start free and build your resume today. Upgrade to Pro only when you're ready for AI-powered job matching and auto-apply.
        </p>
      </section>

      {/* Plans */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Free */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 20, padding: 32, display: "flex", flexDirection: "column"
          }}>
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "var(--t3)", marginBottom: 12 }}>FREE</p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 800, fontFamily: "Sora, sans-serif", lineHeight: 1 }}>₹0</span>
                <span style={{ fontSize: 14, color: "var(--t2)", marginBottom: 8 }}>/month</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--t2)" }}>No credit card. No expiry. Always free.</p>
            </div>

            <div style={{ flex: 1, marginBottom: 28 }}>
              {freeFeatures.map(f => (
                <div key={f.text} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                  borderBottom: "1px solid var(--border)", opacity: f.yes ? 1 : 0.45
                }}>
                  <span style={{ fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>
                    {f.yes ? <span style={{ color: "#34D399" }}>✓</span> : <span style={{ color: "var(--t3)" }}>✗</span>}
                  </span>
                  <span style={{ fontSize: 13, color: f.yes ? "var(--t1)" : "var(--t3)" }}>{f.text}</span>
                </div>
              ))}
            </div>

            <button onClick={() => navigate("/builder")} className="btn-outline" style={{ width: "100%", padding: "13px", fontSize: 14, justifyContent: "center" }}>
              Start Building Free
            </button>
          </div>

          {/* Pro */}
          <div style={{
            background: "linear-gradient(160deg, rgba(34,211,238,0.06) 0%, var(--bg-card) 50%)",
            border: "1px solid rgba(34,211,238,0.3)",
            borderRadius: 20, padding: 32, display: "flex", flexDirection: "column",
            position: "relative", overflow: "hidden"
          }}>
            {/* Popular badge */}
            <div style={{
              position: "absolute", top: 20, right: 20,
              background: "linear-gradient(135deg, #22d3ee, #818cf8)",
              borderRadius: 20, padding: "4px 12px",
              fontSize: 10, fontWeight: 700, color: "#fff", fontFamily: "Sora, sans-serif"
            }}>MOST POPULAR</div>

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "var(--cyan)", marginBottom: 12 }}>PRO</p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 800, fontFamily: "Sora, sans-serif", lineHeight: 1 }} className="text-gradient-gold">₹299</span>
                <span style={{ fontSize: 14, color: "var(--t2)", marginBottom: 8 }}>/month</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--t2)" }}>Full AI suite. Cancel anytime.</p>
            </div>

            <div style={{ flex: 1, marginBottom: 28 }}>
              {proFeatures.map(f => (
                <div key={f.text} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                  borderBottom: "1px solid rgba(34,211,238,0.1)"
                }}>
                  <span style={{ color: "#34D399", fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 13, color: "var(--t1)" }}>{f.text}</span>
                </div>
              ))}
            </div>

            <button onClick={handlePro} className="btn-cta" style={{ width: "100%", padding: "14px", fontSize: 15, justifyContent: "center" }}>
              {authed ? "Upgrade to Pro →" : "Get Pro — ₹299/mo →"}
            </button>

            <p style={{ fontSize: 11, color: "var(--t3)", textAlign: "center", marginTop: 10 }}>
              Secured payment · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, fontFamily: "Sora, sans-serif", textAlign: "center", marginBottom: 40 }}>
            Frequently asked questions
          </h2>
          {faqs.map((faq, i) => (
            <div key={i} style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "20px 24px", marginBottom: 12
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, fontFamily: "Sora, sans-serif", marginBottom: 8 }}>{faq.q}</p>
              <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
