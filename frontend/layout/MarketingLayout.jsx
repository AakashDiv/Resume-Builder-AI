import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../services/authStorage.js";

const navItems = [
  { label: "Features",  to: "/#features" },
  { label: "Templates", to: "/templates" },
  { label: "Pricing",   to: "/pricing" },
];

export default function MarketingLayout() {
  const navigate = useNavigate();
  const authed   = isAuthenticated();

  return (
    <div style={{ background: "var(--bg)", color: "var(--t1)", minHeight: "100vh" }}>

      {/* ── Navbar ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(7,8,15,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #22d3ee, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "Sora, sans-serif"
            }}>N</div>
            <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "Sora, sans-serif", color: "var(--t1)" }}>
              NightHire<span style={{ color: "var(--cyan)" }}>.</span>ai
            </span>
          </Link>

          {/* Nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {navItems.map(item => (
              <NavLink key={item.label} to={item.to} style={{ textDecoration: "none",
                fontSize: 14, fontWeight: 500, color: "var(--t2)",
                transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = "var(--t1)"}
                onMouseLeave={e => e.target.style.color = "var(--t2)"}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Auth buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {authed ? (
              <button onClick={() => navigate("/app/dashboard")} className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>
                Dashboard →
              </button>
            ) : (
              <>
                <button onClick={() => navigate("/login")} className="btn-outline" style={{ padding: "8px 16px", fontSize: 13 }}>
                  Log In
                </button>
                <button onClick={() => navigate("/signup")} className="btn-cta" style={{ padding: "8px 18px", fontSize: 13 }}>
                  Get Started Free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main><Outlet /></main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid var(--border)", marginTop: 80 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40 }}>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "linear-gradient(135deg, #22d3ee, #818cf8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "Sora, sans-serif"
                }}>N</div>
                <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "Sora, sans-serif" }}>NightHire.ai</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7, maxWidth: 260 }}>
                AI-powered job search platform for Indian job seekers. Build, optimize, and apply smarter.
              </p>
              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20,
                  background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)", color: "var(--cyan)" }}>
                  Made in India
                </span>
              </div>
            </div>

            {[
              { title: "Product", links: ["Resume Builder", "ATS Score", "Job Scraper", "Templates"] },
              { title: "Pro Features", links: ["AI Improve", "Job Matching", "Cover Letter", "Auto-Apply"] },
              { title: "Company", links: ["Pricing", "Privacy Policy", "Terms", "Contact"] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "var(--t3)", marginBottom: 12 }}>{col.title}</p>
                {col.links.map(link => (
                  <p key={link} style={{ fontSize: 13, color: "var(--t2)", marginBottom: 8,
                    cursor: "pointer", transition: "color 0.15s" }}
                    onMouseEnter={e => e.target.style.color = "var(--t1)"}
                    onMouseLeave={e => e.target.style.color = "var(--t2)"}>{link}</p>
                ))}
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--border)", marginTop: 40, paddingTop: 24,
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 12, color: "var(--t3)" }}>© 2025 NightHire.ai — All rights reserved</p>
            <p style={{ fontSize: 12, color: "var(--t3)" }}>AI-powered · Trusted by job seekers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
