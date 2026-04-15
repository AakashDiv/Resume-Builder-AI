import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearToken } from "../services/authStorage.js";
import { fetchCurrentUser } from "../services/authApi.js";

const menuItems = [
  { key: "job-search", label: "Job Search", to: "/app/job-search" },
  { key: "resume-builder", label: "Resume Builder", to: "/app/resume-builder" },
  { key: "improve-resume", label: "Improve Resume", to: "/app/improve-resume" },
  { key: "ats-score", label: "ATS Score", to: "/app/ats-score" },
  { key: "tailor-resume", label: "Tailor Resume", to: "/app/tailor-resume" },
  { key: "cover-letter", label: "Cover Letter", to: "/app/cover-letter" },
  { key: "subscription", label: "Subscription", to: "/app/subscription" },
  { key: "profile", label: "Profile", to: "/app/profile" }
];

const titleByPath = Object.fromEntries(menuItems.map((item) => [item.to, item.label]));

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("resume_builder_theme");
    if (stored) return stored === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("resume_builder_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-white p-5 transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6">
            <h1 className="text-xl font-bold">Resume OS</h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">AI Resume Builder + ATS Suite</p>
            <span className="mt-3 inline-flex rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold uppercase text-white">
              {plan}
            </span>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-600 text-white"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-8 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Logout
          </button>
        </aside>

        {sidebarOpen ? (
          <button
            className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 md:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold lg:hidden dark:border-slate-700"
              >
                Menu
              </button>
              <h2 className="text-lg font-bold md:text-xl">{currentTitle}</h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase dark:border-slate-700">
                Plan: {plan}
              </span>
              <button
                onClick={() => setDarkMode((prev) => !prev)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold dark:border-slate-700"
              >
                {darkMode ? "Light" : "Dark"}
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
