import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearToken } from "../services/authStorage.js";
import { fetchCurrentUser } from "../services/authApi.js";

const ICONS = {
  dashboard:       "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  search:          "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  builder:         "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  improve:         "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  ats:             "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  tailor:          "M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z",
  cover:           "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  applications:    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  subscription:    "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  profile:         "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
};

const menuItems = [
  { key: "dashboard",    label: "Dashboard",      to: "/app/dashboard",      icon: "dashboard" },
  { key: "job-search",   label: "Job Search",     to: "/app/job-search",     icon: "search" },
  { key: "resume-builder", label: "Resume Builder", to: "/app/resume-builder", icon: "builder" },
  { key: "improve-resume", label: "Improve Resume", to: "/app/improve-resume", icon: "improve" },
  { key: "ats-score",    label: "ATS Score",      to: "/app/ats-score",      icon: "ats" },
  { key: "tailor-resume", label: "Tailor Resume", to: "/app/tailor-resume",  icon: "tailor" },
  { key: "cover-letter", label: "Cover Letter",   to: "/app/cover-letter",   icon: "cover" },
  { key: "applications", label: "Applications",   to: "/app/applications",   icon: "applications" },
  { key: "subscription", label: "Subscription",   to: "/app/subscription",   icon: "subscription" },
  { key: "profile",      label: "Profile",        to: "/app/profile",        icon: "profile" },
];

const titleByPath = Object.fromEntries(menuItems.map((item) => [item.to, item.label]));

function NavIcon({ path }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{ flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export default function AppShell() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("resume_builder_theme");
    if (stored) return stored === "dark";
    return true; // default dark
  });
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("resume_builder_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    fetchCurrentUser()
      .then((data) => setPlan(data.user?.plan || "free"))
      .catch(() => setPlan("free"));
  }, [location.pathname]);

  const currentTitle = useMemo(() => titleByPath[location.pathname] || "Dashboard", [location.pathname]);

  function handleLogout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  const isPro = plan === "pro";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--t1)", display: "flex" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        position: sidebarOpen ? "fixed" : "sticky",
        top: 0, left: sidebarOpen ? 0 : undefined,
        height: "100vh", width: 240, flexShrink: 0,
        background: "var(--bg-card)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", padding: "20px 12px",
        zIndex: 40, overflowY: "auto",
        transform: sidebarOpen || window.innerWidth >= 1024 ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.2s ease",
      }}>

        {/* Logo */}
        <div style={{ padding: "0 8px 20px", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: "linear-gradient(135deg, #22d3ee, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "Sora, sans-serif",
              flexShrink: 0
            }}>N</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "Sora, sans-serif", lineHeight: 1.2 }}>
                NightHire<span style={{ color: "var(--cyan)" }}>.</span>ai
              </div>
              <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 1 }}>AI Career Suite</div>
            </div>
          </div>

          {/* Plan badge */}
          {isPro ? (
            <span className="pro-badge">⚡ Pro Plan Active</span>
          ) : (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: "var(--bg-card2)", border: "1px solid var(--border)",
              color: "var(--t2)", borderRadius: 20, padding: "2px 10px",
              fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
              cursor: "pointer"
            }} onClick={() => navigate("/app/subscription")}>
              Free — Upgrade →
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {menuItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              <NavIcon path={ICONS[item.icon]} />
              {item.label}
              {(item.key === "improve-resume" || item.key === "tailor-resume" ||
                item.key === "cover-letter" || item.key === "applications") && !isPro && (
                <span style={{
                  marginLeft: "auto", fontSize: 9, fontWeight: 700,
                  background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)",
                  color: "#fbbf24", borderRadius: 6, padding: "1px 5px"
                }}>PRO</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom controls */}
        <div style={{ paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => setDarkMode(prev => !prev)}
            style={{
              background: "var(--bg-card2)", border: "1px solid var(--border)",
              color: "var(--t2)", borderRadius: 10, padding: "8px 12px",
              fontSize: 12, fontWeight: 500, cursor: "pointer",
              textAlign: "left", display: "flex", alignItems: "center", gap: 8
            }}>
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
              color: "#f87171", borderRadius: 10, padding: "8px 12px",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8
            }}>
            ↩ Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 30,
            background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer"
          }}
        />
      )}

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          position: "sticky", top: 0, zIndex: 20,
          background: "rgba(7,8,15,0.9)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px", height: 56
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                color: "var(--t2)", borderRadius: 8, padding: "6px 10px",
                fontSize: 12, cursor: "pointer", display: "none"
              }}
            >☰</button>
            <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: "Sora, sans-serif" }}>
              {currentTitle}
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isPro ? (
              <span className="pro-badge">⚡ Pro</span>
            ) : (
              <button
                onClick={() => navigate("/app/subscription")}
                style={{
                  background: "linear-gradient(135deg, rgba(251,146,60,0.15), rgba(234,88,12,0.1))",
                  border: "1px solid rgba(251,146,60,0.3)",
                  color: "#fb923c", borderRadius: 8, padding: "5px 12px",
                  fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Sora, sans-serif"
                }}>
                ⚡ Upgrade to Pro
              </button>
            )}
          </div>
        </header>

        <main style={{ flex: 1, padding: "24px 24px", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
