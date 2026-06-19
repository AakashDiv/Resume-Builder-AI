import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { isAuthenticated } from "../services/authStorage.js";
import { DEFAULT_HOMEPAGE_TEMPLATE, HOMEPAGE_TEMPLATES } from "../data/homepageTemplates.js";

const navItems = [
  { label: "Features",  to: "/#features" },
  { label: "Templates", to: "/templates" },
  { label: "Blog",      to: "/blog" },
  { label: "Pricing",   to: "/pricing" },
];

export default function MarketingLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const authed   = isAuthenticated();
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("resume_builder_theme");
    return stored ? stored === "dark" : false;
  });
  const selectedHomepage = searchParams.get("homepage") || localStorage.getItem("selected_homepage_template") || DEFAULT_HOMEPAGE_TEMPLATE;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.classList.toggle("theme-dark", darkMode);
    document.documentElement.classList.toggle("theme-light", !darkMode);
    localStorage.setItem("resume_builder_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  function handleHomepageChange(event) {
    const nextTemplate = event.target.value;
    localStorage.setItem("selected_homepage_template", nextTemplate);
    navigate(`/?homepage=${nextTemplate}`);
  }

  return (
    <div className={`site-shell ${darkMode ? "theme-dark" : "theme-light"}`} style={{ background: "var(--bg)", color: "var(--t1)", minHeight: "100vh" }}>

      {/* ── Navbar ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "var(--shell-header-bg)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "var(--brand-grad)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "Inter, Manrope, sans-serif"
            }}>N</div>
            <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "Inter, Manrope, sans-serif", color: "var(--t1)" }}>
              NightHire<span style={{ color: "var(--cyan)" }}>.</span>ai
            </span>
          </Link>

          {/* Nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <select
              value={selectedHomepage}
              onChange={handleHomepageChange}
              aria-label="Select homepage template"
              title="Select homepage template"
              style={{
                width: 126,
                minHeight: 34,
                borderRadius: 10,
                border: "1px solid var(--border2)",
                background: location.pathname === "/" ? "rgba(34,211,238,0.08)" : "var(--bg-card2)",
                color: "var(--t1)",
                padding: "0 10px",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "Inter, Manrope, sans-serif",
                outline: "none",
                cursor: "pointer"
              }}
            >
              {HOMEPAGE_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
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
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              className="theme-toggle-btn"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? "Light" : "Dark"}
            </button>
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
                  background: "var(--brand-grad)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "Inter, Manrope, sans-serif"
                }}>N</div>
                <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "Inter, Manrope, sans-serif" }}>NightHire.ai</span>
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
              { title: "Company", links: ["Blog", "Pricing", "Privacy Policy", "Terms", "Contact"] },
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
